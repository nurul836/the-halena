import { isConvexQuad, quadTransform, validPolygon } from './model';
import type { Design, Point, Surface } from './model';
export type TextureImage=CanvasImageSource & {width:number;height:number};
export type CanvasFactory=(width:number,height:number)=>HTMLCanvasElement;
export const browserCanvas:CanvasFactory=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
function path(ctx:CanvasRenderingContext2D,points:Point[]){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();}
// Affine triangle mapping is used on a subdivided projective grid, keeping
// Canvas2D portable and avoiding a second WebGL rendering/context lifecycle.
function triangle(ctx:CanvasRenderingContext2D,image:CanvasImageSource,src:Point[],dst:Point[]){
 const [s0,s1,s2]=src,[d0,d1,d2]=dst;const sx1=s1.x-s0.x,sy1=s1.y-s0.y,sx2=s2.x-s0.x,sy2=s2.y-s0.y;const det=sx1*sy2-sx2*sy1;if(Math.abs(det)<1e-9)return;
 const a=((d1.x-d0.x)*sy2-(d2.x-d0.x)*sy1)/det,b=((d1.y-d0.y)*sy2-(d2.y-d0.y)*sy1)/det,c=((d2.x-d0.x)*sx1-(d1.x-d0.x)*sx2)/det,d=((d2.y-d0.y)*sx1-(d1.y-d0.y)*sx2)/det;
 // Slightly overlap mesh triangles on an opaque offscreen layer to avoid seams.
 const center={x:(d0.x+d1.x+d2.x)/3,y:(d0.y+d1.y+d2.y)/3};const expanded=dst.map(p=>{const len=Math.hypot(p.x-center.x,p.y-center.y)||1;return{x:p.x+(p.x-center.x)/len*.65,y:p.y+(p.y-center.y)/len*.65};});
 ctx.save();path(ctx,expanded);ctx.clip();ctx.transform(a,b,c,d,d0.x-a*s0.x-c*s0.y,d0.y-b*s0.x-d*s0.y);ctx.drawImage(image,0,0);ctx.restore();
}
function tileTexture(texture:TextureImage,s:Surface['settings'],make:CanvasFactory,size:number,aspect:number){
 const tile=make(size,Math.max(64,Math.round(size*Math.max(.1,Math.min(2,aspect))))),ctx=tile.getContext('2d')!;
 const pattern=ctx.createPattern(texture,'repeat');if(!pattern)throw new Error('Texture could not be prepared.');
 // Transform the canvas rather than the pattern for broad Canvas2D compatibility.
 ctx.translate(size/2+s.offsetX*size,tile.height/2+s.offsetY*tile.height);ctx.rotate(s.rotation*Math.PI/180);const factor=size*s.scale/Math.max(texture.width,texture.height);ctx.scale(factor,factor);ctx.fillStyle=pattern;
 const cover=size*8/factor;ctx.fillRect(-cover,-cover,cover*2,cover*2);
 // Brightness is applied once to the tile, also on browsers without ctx.filter.
 if(s.brightness!==1){const pixels=ctx.getImageData(0,0,tile.width,tile.height);for(let i=0;i<pixels.data.length;i+=4){pixels.data[i]*=s.brightness;pixels.data[i+1]*=s.brightness;pixels.data[i+2]*=s.brightness;}ctx.putImageData(pixels,0,0);}
 return tile;
}
export function renderComposition(canvas:HTMLCanvasElement,room:CanvasImageSource,design:Design,textures:Map<string,TextureImage>,make:CanvasFactory=browserCanvas,quality:'preview'|'export'='preview'){
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas rendering is unavailable.');const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);ctx.drawImage(room,0,0,w,h);
 for(const surface of design.surfaces){const texture=surface.materialId?textures.get(surface.materialId):null;if(!texture||!validPolygon(surface.points))continue;
  const points=surface.points.map(p=>({x:p.x*w,y:p.y*h}));const left=Math.max(0,Math.floor(Math.min(...points.map(p=>p.x)))),top=Math.max(0,Math.floor(Math.min(...points.map(p=>p.y))));const width=Math.min(w-left,Math.ceil(Math.max(...points.map(p=>p.x)))-left),height=Math.min(h-top,Math.ceil(Math.max(...points.map(p=>p.y)))-top);if(width<1||height<1)continue;
  const layer=make(width,height),lc=layer.getContext('2d')!;const local=points.map(p=>({x:p.x-left,y:p.y-top}));const size=quality==='export'?2048:768;const edge=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);const aspect=isConvexQuad(local)?(edge(local[0],local[3])+edge(local[1],local[2]))/(edge(local[0],local[1])+edge(local[3],local[2])):height/width;const tile=tileTexture(texture,surface.settings,make,size,aspect);
  lc.save();path(lc,local);lc.clip();
  if(isConvexQuad(surface.points)){const project=quadTransform(local);const steps=quality==='export'?32:18;for(let y=0;y<steps;y++)for(let x=0;x<steps;x++){const uv=[{x:x/steps,y:y/steps},{x:(x+1)/steps,y:y/steps},{x:(x+1)/steps,y:(y+1)/steps},{x:x/steps,y:(y+1)/steps}];const src=uv.map(p=>({x:p.x*tile.width,y:p.y*tile.height})),dst=uv.map(p=>project(p.x,p.y));triangle(lc,tile,[src[0],src[1],src[2]],[dst[0],dst[1],dst[2]]);triangle(lc,tile,[src[0],src[2],src[3]],[dst[0],dst[2],dst[3]]);}}
  else{lc.drawImage(tile,0,0,width,height);}lc.restore();
  if(surface.settings.blend==='lighting'){
   // Relative source luminance preserves broad shadows without multiplying the
   // new material by the old wall's colour. This is an approximation, not relighting.
   const source=ctx.getImageData(left,top,width,height).data;const mapped=lc.getImageData(0,0,width,height);const data=mapped.data;let sum=0,count=0;
   for(let i=0;i<data.length;i+=4)if(data[i+3]>128){sum+=.2126*source[i]+.7152*source[i+1]+.0722*source[i+2];count++;}
   const average=Math.max(20,sum/Math.max(count,1));
   for(let i=0;i<data.length;i+=4)if(data[i+3]){const luminance=.2126*source[i]+.7152*source[i+1]+.0722*source[i+2];const gain=Math.max(.3,Math.min(1.65,luminance/average));data[i]*=gain;data[i+1]*=gain;data[i+2]*=gain;}
   lc.putImageData(mapped,0,0);
  }
  ctx.save();ctx.globalAlpha=surface.settings.opacity;ctx.globalCompositeOperation=surface.settings.blend==='lighting'?'source-over':surface.settings.blend;ctx.drawImage(layer,left,top);ctx.restore();layer.width=1;layer.height=1;tile.width=1;tile.height=1;
 }
}
