import {build} from 'esbuild';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import assert from 'node:assert/strict';
const output='outputs/material-readiness';await mkdir(output,{recursive:true});
const bundle=await build({stdin:{contents:"export * from './src/catalog/sampleMaterials';export * from './src/studio/model';export * from './src/studio/renderer';export * from './src/studio/application';",resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',write:false});
const m=await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const room=await loadImage(await readFile('public/images/business/bedroom.webp'));const w=room.width,h=room.height;
const pixels=c=>c.getContext('2d').getImageData(0,0,w,h).data;
const base=createCanvas(w,h);base.getContext('2d').drawImage(room,0,0);const original=pixels(base);
const textures=new Map();const rows=[];
for(const material of m.sampleMaterials){
 const row={id:material.id,name:material.name,reference:material.referenceImageUrl,preview:material.thumbnailUrl,texture:material.textureUrl,surfaces:material.suitableSurfaces,license:material.textureLicense||'Unresolved rendering rights',evidence:material.licenseEvidence,eligible:material.renderingReady,status:'Reference Only',missingFiles:[]};
 for(const file of new Set([material.referenceImageUrl,material.thumbnailUrl,material.textureUrl].filter(Boolean)))try{await access('public'+file);}catch{row.missingFiles.push(file);}
 assert.equal(row.missingFiles.length,0);
 if(material.renderingReady){assert.equal(material.licenseStatus,'cleared');assert.ok(material.licenseEvidence);const image=await loadImage(await readFile('public'+material.textureUrl));assert.equal(image.width,2048);textures.set(material.id,image);row.status='Decoded';}
 rows.push(row);
}
for(const material of m.sampleMaterials.filter(m=>m.renderingReady)){
 const kind=material.suitableSurfaces.includes('Wall')?'Wall':'Floor';
 const points=kind==='Wall'?[{x:.69,y:.42},{x:.955,y:.35},{x:.955,y:.49},{x:.69,y:.49}]:[{x:.02,y:.77},{x:.18,y:.8},{x:.34,y:.98},{x:.02,y:.98}];
 const surface={id:'selected-surface',kind,points,materialId:material.id,settings:m.materialSettings(material)};
 assert.equal(m.applicationIssue(material,surface,textures,true,false,false),'');
 const render=s=>{const c=createCanvas(w,h);m.renderComposition(c,room,{surfaces:[s],activeId:s.id},textures,createCanvas,'export');return c;};
 const c=render(surface),edited=pixels(c);let changed=0;for(let i=0;i<edited.length;i+=4)if(Math.abs(edited[i]-original[i])+Math.abs(edited[i+1]-original[i+1])+Math.abs(edited[i+2]-original[i+2])>5)changed++;
 assert.ok(changed>1000,material.id+' must visibly render');
 const alternative=material.id==='HLM-011'?'HLM-012':'HLM-011';assert.notDeepEqual(pixels(render({...surface,materialId:alternative})),edited,'Switch material without reselecting');
 const png=await c.encode('png');await writeFile(`${output}/${material.id}.png`,png);const reopened=createCanvas(w,h);reopened.getContext('2d').drawImage(await loadImage(png),0,0);assert.deepEqual(pixels(reopened),edited);
 Object.assign(rows.find(r=>r.id===material.id),{status:'PASS: decode, compatible selection, render, switch, PNG export/reopen',changedPixels:changed});
}
const counts={total:rows.length,previewReady:rows.filter(r=>r.eligible).length,referenceOnly:rows.filter(r=>!r.eligible).length,materialsWithMissingFiles:rows.filter(r=>r.missingFiles.length).length,materialsWithoutRenderableTexture:rows.filter(r=>!r.texture).length,unresolvedRenderingLicenses:rows.filter(r=>!r.evidence).length};
await writeFile(`${output}/audit.json`,JSON.stringify({counts,materials:rows,browser:'Native Canvas tests; real browser interactions and HTTP loading not verified.'},null,2));console.log(counts);console.log('PASS: every eligible material rendered, switched, exported and reopened against the real bedroom photo.');
