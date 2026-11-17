import assert from 'node:assert/strict';
import {build} from 'esbuild';
const bundle=await build({entryPoints:['src/studio/selection.ts'],bundle:true,platform:'node',format:'esm',write:false});
const {appendCorner,createCornerGesture,validSelection}=await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const rect={left:76,top:100,width:800,height:533.5};
const corners=[{x:.69,y:.42},{x:.955,y:.35},{x:.955,y:.49},{x:.69,y:.49}];
for(const pointerType of ['mouse','touch','pen']){
 const gesture=createCornerGesture();let points=[];
 const event=(p,id=1)=>({pointerType,pointerId:id,isPrimary:true,button:0,clientX:rect.left+p.x*rect.width,clientY:rect.top+p.y*rect.height});
 for(const corner of corners){
  const e=event(corner);assert.equal(gesture.start(e),true);assert.equal(gesture.start(e),false);
  assert.equal(gesture.start({...e,pointerId:2,isPrimary:false}),false);
  const point=gesture.end(e,rect);assert.ok(point);points=appendCorner(points,point);
  assert.equal(gesture.end(e,rect),null);points=appendCorner(points,point);
 }
 assert.equal(points.length,4);assert.deepEqual(points.map((_,i)=>i+1),[1,2,3,4]);
 assert.ok(validSelection(points));assert.ok(validSelection([...points].reverse()));
 assert.equal(appendCorner(points,{x:.1,y:.1}),points);
 gesture.start(event(corners[0]));gesture.move(event(corners[1]));assert.equal(gesture.end(event(corners[0]),rect),null);
 gesture.start(event(corners[0]));gesture.cancel();assert.equal(gesture.end(event(corners[0]),rect),null);
 points=[];gesture.start(event(corners[0]));points=appendCorner(points,gesture.end(event(corners[0]),rect));assert.deepEqual(points.map((_,i)=>i+1),[1]);
}
assert.equal(validSelection([corners[0],corners[2],corners[1],corners[3]]),false);
assert.equal(validSelection([corners[0],corners[1],corners[2],corners[0]]),false);
assert.equal(validSelection(corners.slice(0,3)),false);
console.log('PASS: primary mouse/touch/pen gestures, duplicate down/up, multitouch, duplicate positions, four-point cap, numbering/reset, drag/cancel, both windings, crossing rejection, image-relative coordinates. Browser interactions not verified.');
