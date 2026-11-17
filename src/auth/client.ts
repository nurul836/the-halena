import {withoutBase} from '../config/paths';
import {createClient} from '@supabase/supabase-js';
import {sessionStorageAdapter} from './sessionStorage';
import {authUrl,authKey} from './config';
function createAuthClient(){
 if(!authUrl||!authKey)return null;
 try{const url=new URL(authUrl);if(url.protocol!=='https:'||url.username||url.password||url.pathname!=='/')return null;
 return createClient(authUrl,authKey,{auth:{persistSession:true,autoRefreshToken:true,storage:sessionStorageAdapter,detectSessionInUrl:typeof window==='undefined'||withoutBase(window.location.pathname)!=='/auth/callback',flowType:'pkce'}});
 }catch{return null;}
}
/** One client/session shared by account UI and the existing AI generator. */
export const authClient=createAuthClient();
