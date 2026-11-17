/** Hosting paths are separate from catalog IDs, stored asset paths and router paths. */
export const appBase=import.meta.env?.BASE_URL||'/';
export const withBase=(path:string)=>appBase+path.replace(/^\//,'');
export const assetUrl=(path:string)=>path.startsWith('/images/')||path.startsWith('/brand/')?withBase(path):path;
export function withoutBase(path:string){
 const prefix=appBase.replace(/\/$/,'');
 const relative=prefix&&path.startsWith(prefix+'/')?path.slice(prefix.length):path===prefix?'/':path;
 return relative.replace(/\/$/,'')||'/';
}
