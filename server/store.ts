import {createClient} from '@supabase/supabase-js';
import type {GenerationJob,GenerationRequest} from '../src/ai/options';
import type {ServerConfig} from './config';
import {ApiError} from './errors';
export interface StoredJob extends GenerationJob {user_id:string;request_hash:string;model:string;reservation_cents:number}
export interface JobStore {
 ready():Promise<boolean>;authenticate(token:string):Promise<string>;
 reserve(user:string,input:GenerationRequest,hash:string):Promise<{created:boolean;job:StoredJob}>;
 put(user:string,id:string,kind:'input'|'result',image:Buffer):Promise<void>;
 finish(user:string,id:string,patch:Record<string,unknown>):Promise<void>;
 get(user:string,id:string):Promise<StoredJob|null>;list(user:string):Promise<StoredJob[]>;
 signedResult(user:string,id:string):Promise<string>;remove(job:StoredJob):Promise<void>;expired():Promise<StoredJob[]>;
}
// Safe reads may retry once. Paid requests and writes are never blindly retried.
export async function safeRead<T>(fn:()=>Promise<T>):Promise<T>{try{return await fn();}catch{await new Promise(r=>setTimeout(r,200));return fn();}}
export function createStore(c:ServerConfig):JobStore{
 const db=createClient(c.supabaseUrl,c.serviceKey,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>fetch(input,{...init,signal:init?.signal??AbortSignal.timeout(15000)})}});
 const object=(u:string,id:string,kind:string)=>`${u}/${id}/${kind}.png`;
 const check=(error:unknown)=>{if(error)throw new ApiError(503,'STORAGE_UNAVAILABLE','Private storage or job tracking is temporarily unavailable.');};
 const reconcile=async(user:string)=>{const {error}=await db.from('ai_jobs').update({status:'uncertain',error_code:'COMPLETION_UNCONFIRMED'}).eq('user_id',user).eq('status','processing').lt('created_at',new Date(Date.now()-600000).toISOString());check(error);};
 return {
 async ready(){return safeRead(async()=>{const bucket=await db.storage.getBucket(c.bucket);const settings=await db.from('ai_settings').select('enabled').eq('id',true).single();check(bucket.error||settings.error);return bucket.data?.public===false&&settings.data?.enabled===true;});},
 async authenticate(token){const {data,error}=await db.auth.getUser(token);if(error||!data.user||data.user.is_anonymous||!data.user.email_confirmed_at)throw new ApiError(401,'UNAUTHORIZED','Sign in with a verified account to use AI generation.');return data.user.id;},
 async reserve(user,input,hash){const {data,error}=await db.rpc('reserve_ai_job',{p_user:user,p_id:input.requestId,p_hash:hash,p_room:input.roomType,p_style:input.style,p_model:c.model,p_hours:c.retentionHours,p_cents:c.reservationCents});if(error){const message=error.message||'';if(message.includes('IDEMPOTENCY_CONFLICT'))throw new ApiError(409,'IDEMPOTENCY_CONFLICT','This request ID was already used with different inputs.');if(message.includes('ACCOUNT_NOT_ENABLED'))throw new ApiError(403,'ACCOUNT_NOT_ENABLED','This account has not been enabled for AI generation. Contact the studio.');if(/RATE_LIMIT|DAILY_QUOTA|GLOBAL_BUDGET/.test(message))throw new ApiError(429,'QUOTA_REACHED','The request rate or generation allowance has been reached. Try later or contact the studio.');throw new ApiError(503,'RESERVATION_FAILED','Generation is unavailable. No AI request was made.');}return data as {created:boolean;job:StoredJob};},
 async put(user,id,kind,image){const {error}=await db.storage.from(c.bucket).upload(object(user,id,kind),image,{contentType:'image/png',upsert:false,cacheControl:'0'});check(error);},
 async finish(user,id,patch){const {data,error}=await db.from('ai_jobs').update(patch).eq('id',id).eq('user_id',user).eq('status','processing').select('id');check(error);if(!data?.length)throw new ApiError(409,'JOB_STATE_CHANGED','The generation job is no longer available.');},
 async get(user,id){await reconcile(user);return safeRead(async()=>{const {data,error}=await db.from('ai_jobs').select('*').eq('id',id).eq('user_id',user).maybeSingle();check(error);return data as StoredJob|null;});},
 async list(user){await reconcile(user);return safeRead(async()=>{const {data,error}=await db.from('ai_jobs').select('*').eq('user_id',user).neq('status','deleted').order('created_at',{ascending:false}).limit(20);check(error);return (data||[]) as StoredJob[];});},
 async signedResult(user,id){return safeRead(async()=>{const {data,error}=await db.storage.from(c.bucket).createSignedUrl(object(user,id,'result'),60);check(error);if(!data?.signedUrl)throw new Error('Missing URL');return data.signedUrl;});},
 async remove(job){const {error}=await db.storage.from(c.bucket).remove([object(job.user_id,job.id,'input'),object(job.user_id,job.id,'result')]);check(error);const result=await db.from('ai_jobs').update({status:'deleted',deleted_at:new Date().toISOString()}).eq('id',job.id).eq('user_id',job.user_id);check(result.error);},
 async expired(){const {data,error}=await db.from('ai_jobs').select('*').neq('status','deleted').lt('expires_at',new Date().toISOString()).order('expires_at').limit(50);check(error);return(data||[]) as StoredJob[];},
 };
}
