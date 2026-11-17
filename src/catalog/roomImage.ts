export const ROOM_IMAGE_MAX_BYTES=10*1024*1024;
export async function validateRoomImage(file:File):Promise<void>{
 if(!file.size||file.size>ROOM_IMAGE_MAX_BYTES)throw new Error('Choose an image between 1 byte and 10 MB.');
 const extensions:Record<string,RegExp>={'image/jpeg':/\.jpe?g$/i,'image/png':/\.png$/i,'image/webp':/\.webp$/i};
 if(!extensions[file.type]?.test(file.name))throw new Error('Choose a JPG, PNG or WebP image with a matching file extension.');
 const b=new Uint8Array(await file.slice(0,12).arrayBuffer());const ascii=(start:number,end:number)=>String.fromCharCode(...b.slice(start,end));
 const valid=file.type==='image/jpeg'?b[0]===255&&b[1]===216&&b[2]===255:file.type==='image/png'?b.slice(0,8).join(',')==='137,80,78,71,13,10,26,10':ascii(0,4)==='RIFF'&&ascii(8,12)==='WEBP';
 if(!valid)throw new Error('This file does not contain the expected image format.');
}
