/** Retain Supabase session credentials, but never persist Google API tokens. */
export function withoutProviderTokens(value:string){
 try{const parsed=JSON.parse(value);if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed)){delete parsed.provider_token;delete parsed.provider_refresh_token;return JSON.stringify(parsed);}}catch{/* PKCE verifier strings are not JSON. */}
 return value;
}
const memory=new Map<string,string>();
export const sessionStorageAdapter={
 getItem(key:string){try{const value=localStorage.getItem(key);if(value===null)return memory.get(key)??null;const clean=withoutProviderTokens(value);if(clean!==value)localStorage.setItem(key,clean);return clean;}catch{return memory.get(key)??null;}},
 setItem(key:string,value:string){const clean=withoutProviderTokens(value);try{localStorage.setItem(key,clean);memory.delete(key);}catch{memory.set(key,clean);}},
 removeItem(key:string){memory.delete(key);try{localStorage.removeItem(key);}catch{/* Restricted browser storage. */}},
};
