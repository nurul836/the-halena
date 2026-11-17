import { build } from 'esbuild';
import { mkdir, writeFile, rm, access, readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
const output=path.resolve('outputs/phase3-qa.mjs');
await mkdir(path.dirname(output),{recursive:true});
const result=await build({stdin:{contents:"export {default as App} from './src/entry-server.tsx'; export * from './src/data/businessPages.ts'; export * from './src/services/inquiries.ts';",resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'esm',packages:'external',jsx:'automatic',loader:{'.css':'empty'},define:{'import.meta.env':'{"SSR":true}'}});
await writeFile(output,result.outputFiles[0].text);
try{
 const m=await import(pathToFileURL(output));const render=route=>renderToStaticMarkup(React.createElement(MemoryRouter,{initialEntries:[route]},React.createElement(m.App)));
 assert.equal(m.designServices.length,10);assert.equal(new Set(m.designServices.map(s=>s.image)).size,10,'Unique service imagery');assert.equal(m.conceptProjects.length,7);
 const routes=['/','/about','/services','/projects','/contact','/ai-studio','/materials','/privacy-policy','/terms-of-service',...m.designServices.map(s=>`/services/${s.slug}`),...m.conceptProjects.map(p=>`/projects/${p.slug}`)];
 for(const route of routes){const html=render(route);assert.equal((html.match(/<h1\b/g)||[]).length,1,`${route}: one heading`);assert.equal((html.match(/<footer\b/g)||[]).length,1);assert.equal((html.match(/<header\b/g)||[]).length,0);assert.ok(!html.includes('This space is yet to be imagined.'),route);
  for(const [,src]of html.matchAll(/src="(\/images\/[^"?]+)"/g))await access(path.resolve('public'+src));
  for(const [,href]of html.matchAll(/href="(\/[^"]*)"/g)){const url=new URL(href,'https://example.test');if(url.pathname.startsWith('/images/')){await access(path.resolve('public'+url.pathname));continue;}const dest=render(url.pathname);assert.ok(!dest.includes('This space is yet to be imagined.'),`${route} -> ${href}`);if(url.hash)assert.ok(dest.includes(`id="${url.hash.slice(1)}"`),href);}
 }
 for(const category of m.projectCategories.slice(1))assert.ok(m.conceptProjects.some(p=>p.category===category),`Empty ${category} filter`);
 for(const route of ['/services/missing','/projects/missing','/missing'])assert.match(render(route),/This space is yet to be imagined/);
 const contact=render('/contact');assert.match(contact,/disabled=""[^>]*>Submission not enabled/);assert.match(contact,/No file is uploaded/);
 const valid={...m.emptyInquiry,name:'Test Person',email:'test@example.com',country:'BD',phone:'+880 1712 345678',projectType:'Residential',propertyType:'House / Villa',budget:'50000.50',currency:'USD',location:'Dhaka, Bangladesh',description:'A warm residential interior with natural materials and a flexible living space.',consent:true};
 assert.deepEqual(m.validateInquiry(valid),{});
 assert.ok(Object.keys(m.validateInquiry(m.emptyInquiry)).length>=7);
 for(const [field,value]of [['email','broken'],['country','XX'],['phone','01712345678'],['phone','+44123456789012345'],['budget','-5'],['budget','NaN'],['currency','FAKE'],['projectType','Invalid'],['propertyType','Invalid'],['consent',false],['description','short'],['website','spam.example']])assert.ok(Object.keys(m.validateInquiry({...valid,[field]:value})).length,`${field} invalid value rejected`);
 assert.ok(m.validateInquiry({...valid,currency:'Other'}).otherCurrency);assert.deepEqual(m.validateInquiry({...valid,currency:'Other',otherCurrency:'BDT'}),{});
 assert.equal(m.validateReference({name:'ref.pdf',type:'application/pdf',size:1024}),undefined);
 assert.ok(m.validateReference({name:'ref.svg',type:'image/svg+xml',size:1024}));assert.ok(m.validateReference({name:'ref.jpg',type:'application/pdf',size:1024}));assert.ok(m.validateReference({name:'ref.pdf',type:'application/pdf',size:11*1024*1024}));assert.ok(m.validateReference({name:'ref.pdf',type:'application/pdf',size:0}));
 const options={signal:new AbortController().signal,idempotencyKey:'test-only'};
 assert.equal(m.inquiryGateway,null);await assert.rejects(m.deliverInquiry(null,valid,null,options),/not enabled/);
 await assert.rejects(m.deliverInquiry({submit:async()=>({accepted:false,receiptId:''})},valid,null,options),/could not be confirmed/);
 await assert.rejects(m.deliverInquiry({submit:async()=>{throw new Error('Network unavailable');}},valid,null,options),/Network unavailable/);
 const receipt=await m.deliverInquiry({submit:async()=>({accepted:true,receiptId:'unit-test-only'})},valid,null,options);assert.equal(receipt.receiptId,'unit-test-only');
 const brief=m.formatInquiryBrief(valid,{name:'ref.pdf'});assert.match(brief,/No enquiry or reference file has been sent/);assert.match(brief,/not binding; not a quotation/);assert.match(brief,/file content is not included/);
 console.log(`PASS: ${routes.length} rendered routes; 10 unique service images; 7 concepts covering all filters; internal links, local assets, invalid routes, disabled delivery, validation, upload constraints, receipt handling, local download text.`);
}finally{await rm(output);}
