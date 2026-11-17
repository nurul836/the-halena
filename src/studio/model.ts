export interface Point {x:number;y:number}
export interface TextureSettings {scale:number;rotation:number;opacity:number;brightness:number;offsetX:number;offsetY:number;blend:'lighting'|'source-over'|'multiply'|'soft-light'}
export interface Surface {id:string;kind:'Wall'|'Floor';points:Point[];materialId:string|null;settings:TextureSettings}
export interface Design {surfaces:Surface[];activeId:string|null}
export const emptyDesign=():Design=>({surfaces:[],activeId:null});
export const defaultSettings=():TextureSettings=>({scale:1,rotation:0,opacity:.85,brightness:1,offsetX:0,offsetY:0,blend:'lighting'});
export interface History {past:Design[];present:Design;future:Design[]}
export const createHistory=():History=>({past:[],present:emptyDesign(),future:[]});
export function commitDesign(h:History,next:Design):History{return JSON.stringify(h.present)===JSON.stringify(next)?h:{past:[...h.past,h.present].slice(-60),present:next,future:[]};}
export function undoDesign(h:History):History{return h.past.length?{past:h.past.slice(0,-1),present:h.past[h.past.length-1],future:[h.present,...h.future]}:h;}
export function redoDesign(h:History):History{return h.future.length?{past:[...h.past,h.present],present:h.future[0],future:h.future.slice(1)}:h;}
export const clamp=(v:number,min=0,max=1)=>Math.max(min,Math.min(max,v));
export function mapPointer(x:number,y:number,rect:{left:number;top:number;width:number;height:number}):Point{return {x:clamp((x-rect.left)/rect.width),y:clamp((y-rect.top)/rect.height)};}
const cross=(a:Point,b:Point,c:Point)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
export function polygonArea(p:Point[]){return Math.abs(p.reduce((sum,a,i)=>{const b=p[(i+1)%p.length];return sum+a.x*b.y-b.x*a.y;},0))/2;}
export function validPolygon(p:Point[]):boolean{
 if(p.length<3||p.length>24||p.some(v=>!Number.isFinite(v.x)||!Number.isFinite(v.y)||v.x<0||v.x>1||v.y<0||v.y>1)||polygonArea(p)<.0004)return false;
 for(let i=0;i<p.length;i++){
  const a=p[i],b=p[(i+1)%p.length];if(p.some((other,j)=>j!==i&&Math.hypot(a.x-other.x,a.y-other.y)<.002))return false;
  for(let j=i+1;j<p.length;j++){if(j===i+1||(i===0&&j===p.length-1))continue;const c=p[j],d=p[(j+1)%p.length];const c1=cross(a,b,c),c2=cross(a,b,d),c3=cross(c,d,a),c4=cross(c,d,b);if(c1*c2<=0&&c3*c4<=0&&Math.max(Math.min(a.x,b.x),Math.min(c.x,d.x))<=Math.min(Math.max(a.x,b.x),Math.max(c.x,d.x))&&Math.max(Math.min(a.y,b.y),Math.min(c.y,d.y))<=Math.min(Math.max(a.y,b.y),Math.max(c.y,d.y)))return false;}
 }return true;
}
export function isConvexQuad(p:Point[]){if(p.length!==4||!validPolygon(p))return false;const signs=p.map((_,i)=>cross(p[i],p[(i+1)%4],p[(i+2)%4]));return signs.every(s=>s>1e-8)||signs.every(s=>s< -1e-8);}
/** Projective mapping from the unit square to four ordered polygon corners. */
export function quadTransform(p:Point[]):(u:number,v:number)=>Point{
 const [a,b,c,d]=p;const dx1=b.x-c.x,dx2=d.x-c.x,dx3=a.x-b.x+c.x-d.x;const dy1=b.y-c.y,dy2=d.y-c.y,dy3=a.y-b.y+c.y-d.y;const det=dx1*dy2-dx2*dy1;
 const g=Math.abs(det)>1e-12?(dx3*dy2-dx2*dy3)/det:0;const h=Math.abs(det)>1e-12?(dx1*dy3-dx3*dy1)/det:0;
 return(u,v)=>{const den=g*u+h*v+1;return{x:((b.x-a.x+g*b.x)*u+(d.x-a.x+h*d.x)*v+a.x)/den,y:((b.y-a.y+g*b.y)*u+(d.y-a.y+h*d.y)*v+a.y)/den};};
}
