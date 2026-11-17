import type {IncomingMessage,ServerResponse} from 'node:http';
import {timingSafeEqual} from 'node:crypto';
import {backendConfigured,generationConfigured,readConfig} from './config';
import {createStore} from './store';
import {createOpenAIProvider} from './provider';
import {deleteJob,publicJob,resultUrl,runGeneration} from './generation';
import {ApiError,safeError} from './errors';
import {uuid,validateRequest} from './validation';
type Request=IncomingMessage&{body?:unknown};
export async function readBody(req:Request){if(!req.headers['content-type']?.startsWith('application/json'))throw new ApiError(415,'CONTENT_TYPE','Use application/json.');if(Number(req.headers['content-length']||0)>3000000)throw new ApiError(413,'BODY_TOO_LARGE','The upload copy is too large.');if(req.body!==undefined){const text=typeof req.body==='string'?req.body:JSON.stringify(req.body);if(Buffer.byteLength(text)>3000000)throw new ApiError(413,'BODY_TOO_LARGE','The upload copy is too large.');try{return JSON.parse(text);}catch{throw new ApiError(400,'INVALID_JSON','Invalid request body.');}}
 let size=0;const chunks:Buffer[]=[];for await(const chunk of req){size+=chunk.length;if(size>3000000)throw new ApiError(413,'BODY_TOO_LARGE','The upload copy is too large.');chunks.push(Buffer.from(chunk));}try{return JSON.parse(Buffer.concat(chunks).toString());}catch{throw new ApiError(400,'INVALID_JSON','Invalid request body.');}}
export function checkOrigin(origin:string|undefined,expected:string){if(!origin||origin!==expected)throw new ApiError(403,'ORIGIN_REJECTED','This request origin is not allowed.');}
const equalSecret=(a:string,b:string)=>!!b&&Buffer.byteLength(a)===Buffer.byteLength(b)&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
export async function handler(req:Request,res:ServerResponse,forcedAction?:string){
 res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','private, no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
 const send=(status:number,data:unknown)=>{res.statusCode=status;res.end(JSON.stringify(data));};const c=readConfig();
 try{const url=new URL(req.url||'/','http://local');const action=forcedAction||url.searchParams.get('action')||'status';const method=req.method||'GET';
  if(action==='status'&&method==='GET'){let ready=false;if(generationConfigured(c))try{ready=await createStore(c).ready();}catch{/* Fail closed. */}send(200,{configured:ready,message:ready?'Ready for authorized accounts.':'AI generation not configured.',...(ready?{provider:'OpenAI',model:c.model,retentionHours:c.retentionHours}:{})});return;}
  if(!backendConfigured(c))throw new ApiError(503,'NOT_CONFIGURED','AI generation not configured.');const store=createStore(c);
  if(action==='cleanup'){if(method!=='GET'||!equalSecret(req.headers.authorization||'',`Bearer ${c.cronSecret}`)||!c.cronSecret)throw new ApiError(401,'UNAUTHORIZED','Unauthorized.');const jobs=await store.expired();let deleted=0;for(const job of jobs){await store.remove(job);deleted++;}send(200,{deleted,batchLimit:50});return;}
  const allowed:Record<string,string>={generate:'POST',jobs:'GET',result:'GET',delete:'POST'};if(allowed[action]!==method)throw new ApiError(405,'METHOD_NOT_ALLOWED','Method not allowed.');if(method==='POST')checkOrigin(req.headers.origin,c.origin);
  const bearer=req.headers.authorization?.match(/^Bearer ([^\s]+)$/)?.[1];if(!bearer)throw new ApiError(401,'UNAUTHORIZED','Sign in to continue.');const user=await store.authenticate(bearer);
  if(action==='generate'){if(!generationConfigured(c)||!await store.ready())throw new ApiError(503,'NOT_CONFIGURED','AI generation not configured.');const input=validateRequest(await readBody(req));const result=await runGeneration(user,input,c,store,createOpenAIProvider(c));send(result.job.status==='processing'?202:200,result);return;}
  if(action==='jobs'){send(200,{jobs:(await store.list(user)).map(publicJob)});return;}
  const body=action==='delete'?await readBody(req):null;const id=action==='delete'?body?.id:url.searchParams.get('id');if(!uuid(id))throw new ApiError(400,'INVALID_ID','Invalid generation identifier.');
  if(action==='result'){send(200,await resultUrl(store,user,id));return;}await deleteJob(store,user,id);send(200,{deleted:true});
 }catch(error){const safe=safeError(error);send(safe.status,{error:safe.code,message:safe.message});}
}
