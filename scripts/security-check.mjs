import {readdir,readFile} from 'node:fs/promises';
import path from 'node:path';
const excluded=new Set(['node_modules','.git','.vercel','.openai','outputs']);
const textExtensions=new Set(['.ts','.tsx','.js','.mjs','.json','.html','.css','.md','.yml','.yaml','.txt','.sql']);
const patterns=[/sk-(?:proj-)?[A-Za-z0-9_-]{24,}/,/gh[pousr]_[A-Za-z0-9]{30,}/,/github_pat_[A-Za-z0-9_]{30,}/,/sb_secret_[A-Za-z0-9_-]{20,}/,/AKIA[0-9A-Z]{16}/,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/];
const findings=[];let scanned=0;
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){
 if(excluded.has(entry.name)||entry.isSymbolicLink())continue;
 const file=path.join(dir,entry.name);
 if(entry.isDirectory()){await walk(file);continue;}
 if(!textExtensions.has(path.extname(file))&&!entry.name.startsWith('.env'))continue;
 const source=await readFile(file,'utf8');scanned++;
 if(patterns.some(pattern=>pattern.test(source)))findings.push(file);
 for(const token of source.matchAll(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g)){
  try{if(JSON.parse(Buffer.from(token[0].split('.')[1],'base64url').toString()).role==='service_role')findings.push(file);}catch{/* Non-JWT text. */}
 }
}}
await walk('.');
if(findings.length){console.error('Potential credentials found in these files (values withheld):\n'+[...new Set(findings)].join('\n'));process.exitCode=1;}
else console.log(`PASS: scanned ${scanned} source/build text files for common credential formats; no matches. This is a heuristic scan, not proof that arbitrary secrets are absent.`);
