import {createHash,createHmac} from 'node:crypto';
import type {GenerationRequest} from '../src/ai/options';
import type {ServerConfig} from './config';
import type {JobStore,StoredJob} from './store';
import type {ImageGenerationProvider} from './provider';
import {ApiError,safeError} from './errors';
import {sanitizeImage} from './validation';
export function publicJob(job:StoredJob){return {id:job.id,status:job.status,room_type:job.room_type,style:job.style,created_at:job.created_at,expires_at:job.expires_at,error_code:job.error_code||null};}
export async function runGeneration(user:string,input:GenerationRequest,c:ServerConfig,store:JobStore,provider:ImageGenerationProvider){
 const hash=createHash('sha256').update(JSON.stringify([input.imageBase64,input.mimeType,input.roomType,input.style,input.instructions,c.model])).digest('hex');
 const reserved=await store.reserve(user,input,hash);if(!reserved.created)return {job:publicJob(reserved.job),duplicate:true};
 let providerStarted=false;
 try{const image=await sanitizeImage(Buffer.from(input.imageBase64,'base64'),input.mimeType);await store.put(user,input.requestId,'input',image);
  providerStarted=true;const result=await provider.edit(image,input,createHmac('sha256',c.serviceKey).update(user).digest('hex'));await store.finish(user,input.requestId,{usage:result.usage,provider_request_id:result.requestId});const output=await sanitizeImage(result.image,'image/png',true);await store.put(user,input.requestId,'result',output);await store.finish(user,input.requestId,{status:'succeeded'});
  return {job:publicJob({...reserved.job,status:'succeeded'}),duplicate:false};
 }catch(error){const safe=safeError(error);const uncertain=providerStarted&&!['PROVIDER_REJECTED','PROVIDER_RATE_LIMIT'].includes(safe.code);try{await store.finish(user,input.requestId,{status:uncertain?'uncertain':'failed',error_code:safe.code});}catch{/* Reservation stays durable; cleanup reconciles abandoned work. */}
  // Log only a coarse code and random job ID; never body, prompts, URLs or images.
  console.warn(JSON.stringify({event:'ai_job_failed',jobId:input.requestId,code:safe.code}));throw safe;
 }
}
export async function ownedJob(store:JobStore,user:string,id:string){const job=await store.get(user,id);if(!job)throw new ApiError(404,'NOT_FOUND','This generation was not found.');return job;}
export async function resultUrl(store:JobStore,user:string,id:string){const job=await ownedJob(store,user,id);if(job.status!=='succeeded'||Date.parse(job.expires_at)<=Date.now())throw new ApiError(410,'RESULT_UNAVAILABLE','This result is not ready, was deleted or has expired.');return {url:await store.signedResult(user,id),expiresIn:60};}
export async function deleteJob(store:JobStore,user:string,id:string){const job=await ownedJob(store,user,id);if(job.status==='processing'&&Date.now()-Date.parse(job.created_at)<600000)throw new ApiError(409,'STILL_PROCESSING','Processing may still be active. Check again in ten minutes before deleting.');await store.remove(job);}
