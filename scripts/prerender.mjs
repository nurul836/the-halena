import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';
import react from '@vitejs/plugin-react';

// Render the actual application at build time; never request private studio data.
await build({configFile:false,plugins:[react()],build:{ssr:'src/entry-server.tsx',outDir:'outputs/ssr',emptyOutDir:true,rollupOptions:{output:{manualChunks:undefined,inlineDynamicImports:true}}}});
const {render,publicRoutes,pageMetadata,structuredData,productionOrigin}=await import(pathToFileURL(path.resolve('outputs/ssr/entry-server.js')));
const template=await readFile('dist/index.html','utf8');
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const css=[...template.matchAll(/<link[^>]+rel="stylesheet"[^>]*>/g)].map(m=>m[0]).join('');
// Lazy routes may own CSS chunks. Include their small styles in prerendered HTML
// to avoid a flash of unstyled content before hydration.
const manifest=JSON.parse(await readFile('dist/.vite/manifest.json','utf8'));
const allCss=[...new Set(Object.values(manifest).flatMap(item=>item.css||[]))];
const extraCss=allCss.filter(file=>!css.includes(file)).map(file=>`<link rel="stylesheet" href="/${file}"/>`).join('');
for(const route of [...publicRoutes,'/404']){
 const meta=pageMetadata(route); const data=structuredData(route);
 const tags=`<title>${escape(meta.title)}</title><meta name="description" content="${escape(meta.description)}"/><meta name="robots" content="${meta.robots}"/><meta property="og:title" content="${escape(meta.title)}"/><meta property="og:description" content="${escape(meta.description)}"/><meta property="og:type" content="website"/><meta property="og:site_name" content="THE HALENA"/><meta name="twitter:card" content="summary_large_image"/>`+(meta.canonical?`<link rel="canonical" href="${escape(meta.canonical)}"/><meta property="og:url" content="${escape(meta.canonical)}"/><meta property="og:image" content="${escape(meta.image)}"/><meta property="og:image:alt" content="Architectural interior reference for THE HALENA"/>`:'')+(data?`<script type="application/ld+json" id="structured-data">${JSON.stringify(data).replaceAll('<','\\u003c')}</script>`:'');
 const html=template.replace(/<title>[\s\S]*?<\/title>/,'').replace(/<meta name="description"[^>]*\/>/,'').replace('</head>',tags+extraCss+'</head>').replace('<div id="root"></div>',`<div id="root" data-prerendered="true">${render(route)}</div>`);
 const file=route==='/'?'dist/index.html':`dist${route}.html`;
 await mkdir(path.dirname(file),{recursive:true});await writeFile(file,html);
}
const origin=productionOrigin();
const locations=publicRoutes.filter(route=>!route.startsWith('/auth/')&&!route.startsWith('/ai-studio')&&route!=='/material-try-on');
await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${origin?locations.map(route=>`<url><loc>${escape(origin+route)}</loc></url>`).join(''):''}</urlset>`);
await writeFile('dist/robots.txt',origin?`User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${origin}/sitemap.xml\n`:'User-agent: *\nDisallow: /\n');
console.log(`Prerendered ${publicRoutes.length} routes + 404. ${origin?'Canonical URLs and sitemap enabled.':'VITE_SITE_URL is unset: preview is noindex; configure the HTTPS production origin and rebuild before launch.'}`);
