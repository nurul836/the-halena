import sharp from 'sharp';
import {designStyles,roomTypes} from '../src/ai/options';
import type {GenerationRequest} from '../src/ai/options';
import {ApiError} from './errors';
export const uuid=(value:unknown):value is string=>typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
export function validateRequest(body:unknown):GenerationRequest{
 if(!body||typeof body!=='object'||Array.isArray(body))throw new ApiError(400,'INVALID_REQUEST','Provide a valid generation request.');const b=body as Record<string,unknown>;
 if(!uuid(b.requestId)||!roomTypes.includes(b.roomType as never)||!designStyles.some(s=>s.id===b.style)||b.consent!==true||typeof b.instructions!=='string'||b.instructions.length>1200||!['image/jpeg','image/png','image/webp'].includes(String(b.mimeType)))throw new ApiError(400,'INVALID_REQUEST','Choose a room type and style, limit instructions to 1,200 characters and give processing consent.');
 if(typeof b.imageBase64!=='string'||b.imageBase64.length>2800000||!b.imageBase64.length||b.imageBase64.length%4!==0||!/^[A-Za-z0-9+/]+={0,2}$/.test(b.imageBase64))throw new ApiError(413,'INVALID_IMAGE','Choose a supported image. The AI upload copy must be under 2 MB.');return b as unknown as GenerationRequest;
}
export async function sanitizeImage(bytes:Buffer,mime:string,output=false):Promise<Buffer>{
 if(!bytes.length||bytes.length>(output?20:2)*1024*1024)throw new ApiError(413,'INVALID_IMAGE','The image exceeds the processing limit.');
 try{const decoder=sharp(bytes,{limitInputPixels:output?16777216:4194304,failOn:'error',animated:false});const metadata=await decoder.metadata();const formats:Record<string,string>={'image/jpeg':'jpeg','image/png':'png','image/webp':'webp'};
 if(!metadata.width||!metadata.height||metadata.width<32||metadata.height<32||(metadata.pages??1)>1||(!output&&metadata.format!==formats[mime])||!['jpeg','png','webp'].includes(metadata.format||''))throw new Error('format');
 return await decoder.rotate().resize({width:output?4096:2048,height:output?4096:2048,fit:'inside',withoutEnlargement:true}).png().toBuffer();
 }catch{throw new ApiError(400,'INVALID_IMAGE','The image could not be safely decoded. Use a non-animated JPG, PNG or WebP photograph.');}
}
