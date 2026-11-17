import { build } from 'esbuild';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

// Render real application components without a browser. This complements,
// but does not replace, viewport, keyboard and motion testing in a browser.
const output=path.resolve('outputs/phase2-qa.mjs');
await mkdir(path.dirname(output),{recursive:true});
const result=await build({entryPoints:['src/entry-server.tsx'],bundle:true,write:false,platform:'node',format:'esm',packages:'external',jsx:'automatic',loader:{'.css':'empty'},define:{'import.meta.env':'{"SSR":true}'}});
await writeFile(output,result.outputFiles[0].text);
try {
 const {default:App}=await import(pathToFileURL(output));
 const render=route=>renderToStaticMarkup(React.createElement(MemoryRouter,{initialEntries:[route]},React.createElement(App)));
 const home=render('/');
 assert.equal((home.match(/<section\b/g)||[]).length,10,'Ten homepage sections before the footer');
 assert.equal((home.match(/<footer\b/g)||[]).length,1,'One shared luxury footer');
 assert.equal((home.match(/<header\b/g)||[]).length,0,'No top header');
 assert.equal((home.match(/class="photo-service-card"/g)||[]).length,6);
 assert.equal((home.match(/class="collection-card"/g)||[]).length,6);
 assert.match(home,/Room upload and manual material try-on work locally in your browser/);
 const hrefs=[...home.matchAll(/href="(\/[^"]*)"/g)].map(m=>m[1]);
 const targets=[...new Set(hrefs)];
 for(const href of targets){
  const [route,hash]=href.split('#');const html=render(route);
  assert.ok(!html.includes('This space is yet to be imagined.'),`Missing destination: ${href}`);
  if(hash)assert.ok(html.includes(`id="${hash}"`),`Missing service anchor: ${href}`);
 }
 for(const route of ['/about','/services','/projects','/projects/quiet-residence','/projects/sculpted-retreat','/projects/gathering-space','/materials','/materials/natural-stone','/materials/warm-timber','/materials/brushed-metal','/ai-studio','/contact','/privacy-policy','/terms-of-service'])assert.ok(!render(route).includes('This space is yet to be imagined.'),`Phase 1 route regression: ${route}`);
 assert.match(render('/missing'),/This space is yet to be imagined/);
 console.log(`PASS: 11 sections, 6 services, 6 material collections, ${targets.length} unique internal destinations, original routes and 404.`);
} finally {await rm(output);}
