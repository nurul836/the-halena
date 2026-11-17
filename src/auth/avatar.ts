import {decodeRoom} from '../studio/images';
/** Decode and re-encode: strip metadata and exclude SVG/script payloads. */
export async function prepareAvatar(file:File){
 if(file.size>2*1024*1024||!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Choose a JPG, PNG or WebP image up to 2 MB.');
 const image=await decodeRoom(file);const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
 try{const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Image processing is unavailable.');ctx.fillStyle='#101619';ctx.fillRect(0,0,256,256);const side=Math.min(image.width,image.height);ctx.drawImage(image,(image.width-side)/2,(image.height-side)/2,side,side,0,0,256,256);return await new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Could not prepare the avatar.')),'image/jpeg',.9));}finally{image.close();canvas.width=canvas.height=1;}
}
