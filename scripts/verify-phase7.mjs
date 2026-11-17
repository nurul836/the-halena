import assert from 'node:assert/strict';
import {readFile,stat,writeFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {build} from 'esbuild';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const {publicRoutes,pageMetadata}=await import(pathToFileURL(path.resolve('outputs/ssr/entry-server.js')));
const titles=new Set();
for(const route of [...publicRoutes,'/404']){
 const html=await readFile(route==='/'?'dist/index.html':`dist${route}.html`,'utf8');
 const head=html.split('</head>')[0];
 assert.equal((head.match(/<title>/g)||[]).length,1,route);
 const title=head.match(/<title>(.*?)<\/title>/)[1];assert.ok(!titles.has(title),`Duplicate title: ${route}`);titles.add(title);
 assert.match(head,/<meta property="og:title"/);assert.match(head,/<meta name="description"/);
 assert.equal((html.match(/<h1\b/g)||[]).length,1,route);
 assert.equal((html.match(/<header\b/g)||[]).length,0,route);
 assert.equal((html.match(/class="sidebar glass-sidebar"/g)||[]).length,1,route);
 assert.match(html,/id="main-content" tabindex="-1"/);assert.match(html,/aria-label="Main navigation"/);
 assert.match(html,/data-prerendered="true"/);assert.doesNotMatch(html,/Loading your next space/);
 if(!pageMetadata(route).canonical)assert.match(head,/content="noindex, follow"/);
}
// An isolated fixture checks configured-domain behavior; it is never deployed.
const fixture=await build({entryPoints:['src/seo.ts'],bundle:true,platform:'node',format:'esm',write:false,define:{'import.meta.env':'{"VITE_SITE_URL":"https://halena.example"}'}});
await writeFile('outputs/seo-fixture.mjs',fixture.outputFiles[0].text);
const seo=await import(pathToFileURL(path.resolve('outputs/seo-fixture.mjs')));
assert.equal(seo.pageMetadata('/about/').canonical,'https://halena.example/about');
assert.equal(seo.pageMetadata('/about').robots,'index, follow');
assert.equal(seo.pageMetadata('/ai-studio').robots,'noindex, follow');
assert.equal(seo.pageMetadata('/missing').robots,'noindex, follow');
assert.equal(seo.structuredData('/about')['@type'],'WebPage');
for(const value of ['http://example.com','https://example.com/path','https://user:password@example.com','https://example.com?q=1'])assert.throws(()=>seo.productionOrigin(value));
const manifest=JSON.parse(await readFile('dist/.vite/manifest.json','utf8'));
const closure=new Set();function walk(key){if(closure.has(key))return;closure.add(key);for(const dep of manifest[key].imports||[])walk(dep);}
walk('index.html');walk('src/pages/Home.tsx');
assert.ok(![...closure].some(key=>key.includes('supabase')||key.includes('InteriorGenerator')||key.includes('MaterialStudio')),'Home must not load studio/backend SDK code');
let bytes=0,gzip=0;for(const key of closure){const buffer=await readFile('dist/'+manifest[key].file);bytes+=buffer.length;gzip+=gzipSync(buffer).length;}
const hero=[];for(const width of [640,960,1440,1920])hero.push({width,bytes:(await stat(`public/images/responsive/hero-${width}.webp`)).size});
const css=await readFile('src/styles/refinement.css','utf8');assert.match(css,/prefers-reduced-motion/);assert.match(css,/min-width:44px/);assert.match(css,/font-size:16px/);
const routing=JSON.parse(await readFile('vercel.json','utf8'));assert.equal(routing.cleanUrls,true);assert.ok(!routing.rewrites,'Unknown production URLs must reach a real 404, not the homepage');assert.ok(routing.functions['api/ai.ts']);
console.log(JSON.stringify({prerenderedRoutes:publicRoutes.length,unknownRoute:'404.html',seo:'PASS: unique metadata, domain validation, structured data and workspace noindex',navigation:'PASS: server-rendered sidebar, named drawer, skip target, no header',homepageJavaScript:{bytes,gzip},hero,viewports:'360,390,768,1024,1440,1920: visual/browser checks unavailable; CSS safeguards reviewed, not a rendered viewport audit',lighthouse:'Not run'},null,2));
