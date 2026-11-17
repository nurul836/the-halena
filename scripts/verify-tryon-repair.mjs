import {build} from 'esbuild';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const dir='outputs/tryon-repair';await mkdir(dir,{recursive:true});
const bundle=await build({stdin:{contents:"export * from './src/studio/application.ts';export * from './src/studio/model.ts';export * from './src/studio/renderer.ts';export * from './src/studio/images.ts';export * from './src/catalog/sampleMaterials.ts';",resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',packages:'external',write:false});
await writeFile(`${dir}/module.mjs`,bundle.outputFiles[0].text);const m=await import(pathToFileURL(path.resolve(`${dir}/module.mjs`)));
const room=await loadImage(await readFile('public/images/business/bedroom.webp'));const w=room.width,h=room.height;
const textures=new Map();const decoded=new Map();
for(const material of m.sampleMaterials.filter(x=>x.renderingReady)){
 assert.match(material.textureUrl,/^\/images\/render-textures\/.*\.jpg$/);const bytes=await readFile('public'+material.textureUrl);
 if(!decoded.has(material.textureUrl))decoded.set(material.textureUrl,await loadImage(bytes));const image=decoded.get(material.textureUrl);
 assert.equal(image.width,2048);assert.equal(image.height,2048);textures.set(material.id,image);assert.ok(material.previewSettings);
}
assert.equal(textures.size,9);const wood=m.sampleMaterials.find(x=>x.id==='HLM-004'),marble=m.sampleMaterials.find(x=>x.id==='HLM-011');
// The exposed wall strip behind the bed, below the picture frame and above pillows.
const surface={id:'bedroom-wall',kind:'Wall',points:[{x:.69,y:.42},{x:.955,y:.35},{x:.955,y:.49},{x:.69,y:.49}],materialId:wood.id,settings:m.materialSettings(wood)};
assert.ok(m.validPolygon(surface.points));assert.equal(m.applicationIssue(wood,surface,textures,true,false,false),'');
assert.match(m.applicationIssue(wood,undefined,textures,true,false,false),/select a wall/);
assert.match(m.applicationIssue(wood,surface,textures,false,false,false),/upload/);
assert.match(m.applicationIssue(wood,surface,textures,true,true,false),/finish/);
assert.match(m.applicationIssue(wood,surface,new Map(),true,false,false),/failed to load/);
assert.match(m.applicationIssue(m.sampleMaterials.find(x=>x.id==='HLM-007'),surface,textures,true,false,false),/not this wall/);
const draw=design=>{const c=createCanvas(w,h);m.renderComposition(c,room,design,textures,createCanvas,'export');return c;};
const data=c=>c.getContext('2d').getImageData(0,0,w,h).data;
const original=draw(m.emptyDesign()),base=data(original);const woodDesign={surfaces:[surface],activeId:surface.id};const woodCanvas=draw(woodDesign);
const marbleDesign={surfaces:[{...surface,materialId:marble.id}],activeId:surface.id};const marbleCanvas=draw(marbleDesign);
const scaledDesign={...marbleDesign,surfaces:[{...marbleDesign.surfaces[0],settings:{...surface.settings,scale:.45}}]};const scaledCanvas=draw(scaledDesign);
assert.notDeepEqual(data(woodCanvas),base);assert.notDeepEqual(data(marbleCanvas),data(woodCanvas));assert.notDeepEqual(data(scaledCanvas),data(marbleCanvas));
const mask=createCanvas(w,h),mc=mask.getContext('2d');mc.beginPath();surface.points.forEach((p,i)=>i?mc.lineTo(p.x*w,p.y*h):mc.moveTo(p.x*w,p.y*h));mc.closePath();mc.fill();const maskPixels=data(mask),edited=data(scaledCanvas);let changed=0,outside=0;
for(let i=0;i<base.length;i+=4){const delta=Math.abs(base[i]-edited[i])+Math.abs(base[i+1]-edited[i+1])+Math.abs(base[i+2]-edited[i+2]);if(delta>5){changed++;if(maskPixels[i+3]===0)outside++;}}
assert.ok(changed>30000);assert.equal(outside,0);
for(const [name,canvas]of [['bedroom-original',original],['bedroom-wood',woodCanvas],['bedroom-marble',marbleCanvas],['bedroom-marble-scaled-export',scaledCanvas]]){
 const bytes=await canvas.encode('png');await writeFile(`${dir}/${name}.png`,bytes);const reopened=await loadImage(bytes);const verification=createCanvas(w,h);verification.getContext('2d').drawImage(reopened,0,0);assert.deepEqual(data(verification),data(canvas));
}
let history=m.createHistory();for(const design of [woodDesign,marbleDesign,scaledDesign])history=m.commitDesign(history,design);
assert.deepEqual(m.undoDesign(history).present,marbleDesign);assert.deepEqual(m.redoDesign(m.undoDesign(history)).present,scaledDesign);
assert.deepEqual(data(draw(m.commitDesign(history,m.emptyDesign()).present)),base);
for(const width of [360,390,768,1024,1440]){const p=m.mapPointer(width*.69,200+width*h/w*.42,{left:0,top:200,width,height:width*h/w});assert.ok(Math.abs(p.x-.69)<1e-9&&Math.abs(p.y-.42)<1e-9);}
const savedFetch=globalThis.fetch;
try{
 await assert.rejects(m.loadLocalTexture('https://example.test/room.jpg',new AbortController().signal),/not approved/);
 globalThis.fetch=async()=>new Response('Missing',{status:404});await assert.rejects(m.loadLocalTexture('/images/render-textures/missing.jpg',new AbortController().signal),/missing/);
 globalThis.fetch=async()=>new Response('<html/>',{headers:{'content-type':'text/html'}});await assert.rejects(m.loadLocalTexture('/images/render-textures/missing.jpg',new AbortController().signal),/unsupported image type/);
 globalThis.fetch=async()=>new Response(new Uint8Array(8),{headers:{'content-type':'image/jpeg'}});await assert.rejects(m.loadLocalTexture('/images/render-textures/bad.jpg',new AbortController().signal),/not a supported image/);
}finally{globalThis.fetch=savedFetch;}
const result={photo:'Existing bedroom reference photograph',width:w,height:h,renderReady:[...textures.keys()],changedPixels:changed,outsideSelectionChanges:outside,export:'PNG reopened and exact pixels verified',manualGeometry:'Valid editable quad; pointer coordinate invariance tested',checks:'Wood → marble → scale, lighting blend, undo/redo/reset, compatible surfaces, missing texture/HTML/invalid image rejection',browser:'Blocked: Browser Use could not read config. No browser upload, pointer, download or console verification claimed.'};
await writeFile(`${dir}/results.json`,JSON.stringify(result,null,2));console.log(result);
