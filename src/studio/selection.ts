import {mapPointer, validPolygon} from './model';
import type {Point} from './model';

export const MAX_CORNERS = 4;
export function appendCorner(points:Point[], point:Point):Point[] {
 if(points.length>=MAX_CORNERS || !Number.isFinite(point.x) || !Number.isFinite(point.y) || points.some(p=>Math.hypot(p.x-point.x,p.y-point.y)<.002))return points;
 return [...points,point];
}
export const validSelection=(points:Point[])=>points.length===MAX_CORNERS&&validPolygon(points);

/** One primary pointer gesture produces at most one corner, on release. */
export function createCornerGesture(){
 let pending:{id:number;x:number;y:number;moved:boolean}|null=null;
 return {
  start(e:{pointerId:number;isPrimary:boolean;button:number;clientX:number;clientY:number}){
   if(pending||!e.isPrimary||e.button!==0)return false;
   pending={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};return true;
  },
  move(e:{pointerId:number;clientX:number;clientY:number}){
   if(pending?.id===e.pointerId&&Math.hypot(e.clientX-pending.x,e.clientY-pending.y)>8)pending.moved=true;
  },
  end(e:{pointerId:number;clientX:number;clientY:number},rect:{left:number;top:number;width:number;height:number}):Point|null{
   if(pending?.id!==e.pointerId)return null;
   const gesture=pending;pending=null;
   if(gesture.moved||Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>8||rect.width<=0||rect.height<=0||e.clientX<rect.left||e.clientX>rect.left+rect.width||e.clientY<rect.top||e.clientY>rect.top+rect.height)return null;
   return mapPointer(e.clientX,e.clientY,rect);
  },
  cancel(){pending=null;},
 };
}
