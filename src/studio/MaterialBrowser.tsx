import {useState} from 'react';
import {Link} from 'react-router-dom';
import type {Material} from '../catalog/types';
import {compatible} from './application';

const categories=[['All',''],['Wood','Wood'],['Marble','Marble'],['Wall Panels','Wall Panels'],['Wallpaper','Wallpaper'],['Tiles','Ceramic & Porcelain Tiles'],['Flooring','Flooring'],['Stone','Natural Stone']] as const;
interface Props{materials:Material[];loaded:ReadonlyMap<string,unknown>;selectedId:string|null|undefined;surface?:'Wall'|'Floor';disabled:boolean;loading:boolean;error:string;onRetry:()=>void;onSelect:(id:string)=>void;}
export function MaterialBrowser({materials,loaded,selectedId,surface,disabled,loading,error,onRetry,onSelect}:Props){
 const [query,setQuery]=useState(''),[category,setCategory]=useState(''),[readyOnly,setReadyOnly]=useState(false);
 const filtered=materials.filter(m=>(!category||m.category===category)&&`${m.name} ${m.id} ${m.category}`.toLowerCase().includes(query.trim().toLowerCase()));
 const ready=filtered.filter(m=>loaded.has(m.id)),reference=filtered.filter(m=>!loaded.has(m.id));
 return <section id="studio-materials" className="studio-material-browser" tabIndex={-1} aria-labelledby="tryon-material-title">
  <div className="material-browser-heading"><div><span className="eyebrow">03 / Choose your finish</span><h2 id="tryon-material-title">A different atmosphere.</h2></div><label><span className="sr-only">Search studio materials</span><input type="search" placeholder="Find a material…" value={query} onChange={e=>setQuery(e.target.value)}/></label></div>
  <div className="tryon-categories" role="group" aria-label="Material categories">{categories.map(([name,value])=><button key={name} aria-pressed={category===value} onClick={()=>setCategory(value)}>{name}</button>)}</div>
  <label className="preview-filter"><input type="checkbox" checked={readyOnly} onChange={e=>setReadyOnly(e.target.checked)}/> Preview-ready materials only</label>
  {loading&&<p role="status" className="editor-hint">Preparing material previews…</p>}
  {error&&<div role="alert" className="editor-error"><p>{error}</p><button onClick={onRetry}>Retry textures</button></div>}
  <div className="studio-material-rail">{ready.map(m=>{const allowed=!surface||compatible(m,surface);return <button key={m.id} className="studio-material-option preview-ready" aria-pressed={selectedId===m.id} disabled={disabled||!allowed} onClick={()=>onSelect(m.id)}><img src={m.thumbnailUrl} alt="" loading="lazy"/><span className="texture-readiness">{allowed?'Ready to Preview':`For ${m.suitableSurfaces.join(' / ')} only`}</span><strong>{m.name}</strong><small>{m.category} · {m.id}</small></button>;})}</div>
  {!ready.length&&!loading&&<p className="editor-hint">No preview-ready materials match these filters. <button onClick={()=>{setQuery('');setCategory('');}}>Clear filters</button></p>}
  {!readyOnly&&reference.length>0&&<div className="tryon-reference"><h3>Reference collection</h3><p className="editor-hint">For inspiration. These samples cannot be applied to your room.</p><div className="studio-material-rail">{reference.map(m=><article key={m.id} className="studio-material-option reference-only"><img src={m.thumbnailUrl} alt="" loading="lazy"/><span className="texture-readiness">{m.renderingReady?loading?'Preparing preview':'Texture unavailable':'Reference Only'}</span><strong>{m.name}</strong><small>{m.renderingReady?'Retry loading textures to preview this material.':m.readinessNote}</small><Link to={'/materials/'+m.slug}>View material details ↗</Link></article>)}</div></div>}
  <Link to="/materials" className="editor-change">Explore the complete catalog ↗</Link>
 </section>;
}
