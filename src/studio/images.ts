import {validateRoomImage} from '../catalog/roomImage';
export const MAX_ROOM_PIXELS=16000000;
export const MAX_ROOM_SIDE=8000;
export function validateDimensions(width:number,height:number){if(width<32||height<32||width*height>MAX_ROOM_PIXELS||Math.max(width,height)>MAX_ROOM_SIDE)throw new Error('Choose an image at least 32 × 32 pixels, up to 16 megapixels and 8,000 pixels per side.');}
/** Inspect encoded dimensions before allocating a decoded bitmap. */
export function encodedDimensions(bytes:Uint8Array,type:string):{width:number;height:number}|null{
 const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);const text=(i:number,n:number)=>String.fromCharCode(...bytes.slice(i,i+n));
 if(type==='image/png'&&bytes.length>=24)return{width:v.getUint32(16),height:v.getUint32(20)};
 if(type==='image/jpeg'){let i=2;while(i+3<bytes.length){if(bytes[i++]!==255)continue;while(bytes[i]===255)i++;const marker=bytes[i++];if(marker===217||marker===218)break;if(marker===216||marker===1||(marker>=208&&marker<=215))continue;if(i+2>bytes.length)break;const size=v.getUint16(i);if(size<2||i+size>bytes.length)break;if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)&&size>=7)return{width:v.getUint16(i+5),height:v.getUint16(i+3)};i+=size;}}
 if(type==='image/webp'){let i=12;while(i+8<=bytes.length){const name=text(i,4),size=v.getUint32(i+4,true),start=i+8;if(start+size>bytes.length)break;if(name==='VP8X'&&size>=10){const u24=(p:number)=>bytes[p]+bytes[p+1]*256+bytes[p+2]*65536;return{width:u24(start+4)+1,height:u24(start+7)+1};}if(name==='VP8 '&&size>=10)return{width:v.getUint16(start+6,true)&16383,height:v.getUint16(start+8,true)&16383};if(name==='VP8L'&&size>=5&&bytes[start]===47){const bits=v.getUint32(start+1,true);return{width:(bits&16383)+1,height:((bits>>>14)&16383)+1};}i=start+size+(size%2);}}
 return null;
}
export async function decodeRoom(file:File):Promise<ImageBitmap>{
 await validateRoomImage(file);
 const dimensions=encodedDimensions(new Uint8Array(await file.arrayBuffer()),file.type);if(!dimensions)throw new Error('The image dimensions could not be read. Please re-save it as a standard JPG, PNG or WebP.');validateDimensions(dimensions.width,dimensions.height);
 let bitmap:ImageBitmap;try{bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});}catch{throw new Error('This image could not be decoded. Choose a valid JPG, PNG or WebP photograph.');}
 try{validateDimensions(bitmap.width,bitmap.height);}catch(error){bitmap.close();throw error;}return bitmap;
}
export async function loadLocalTexture(url:string,signal:AbortSignal):Promise<HTMLImageElement>{
 signal=AbortSignal.any([signal,AbortSignal.timeout(20000)]);
 if(!/^\/images\/render-textures\/[a-z0-9_-]+\.(jpg|jpeg|png|webp)$/i.test(url))throw new Error('This texture is not approved for local preview.');
 const response=await fetch(url,{signal,credentials:'same-origin',redirect:'error'});
 if(!response.ok)throw new Error('Texture file missing or unavailable.');
 const mime=response.headers.get('content-type')?.split(';')[0].trim()||'';
 if(!['image/jpeg','image/png','image/webp'].includes(mime))throw new Error('Texture server returned an unsupported image type.');
 const blob=await response.blob();if(!blob.size||blob.size>10*1024*1024)throw new Error('Texture file exceeds the supported size.');
 const bytes=new Uint8Array(await blob.arrayBuffer());
 const dimensions=encodedDimensions(bytes,mime);if(!dimensions)throw new Error('Texture data is not a supported image.');
 validateDimensions(dimensions.width,dimensions.height);signal.throwIfAborted();
 const objectUrl=URL.createObjectURL(blob);
 try{return await new Promise((resolve,reject)=>{const img=new Image();const cleanup=()=>{img.onload=null;img.onerror=null;signal.removeEventListener('abort',abort);};const abort=()=>{cleanup();img.src='';reject(new DOMException('Cancelled','AbortError'));};img.onload=()=>{cleanup();if(img.naturalWidth<32||img.naturalHeight<32)reject(new Error('Texture dimensions are invalid.'));else resolve(img);};img.onerror=()=>{cleanup();reject(new Error('Texture could not be decoded.'));};signal.addEventListener('abort',abort,{once:true});if(signal.aborted){abort();return;}img.src=objectUrl;});}finally{URL.revokeObjectURL(objectUrl);}
}
