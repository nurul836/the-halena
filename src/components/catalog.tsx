import {assetUrl} from '../config/paths';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useMaterialCatalog } from '../catalog/CatalogProvider';
import { materialStudioUrl } from '../catalog/repository';
import type { Material } from '../catalog/types';

export function TryMaterialLink({material}:{material:Material}){
 const {selectMaterial}=useMaterialCatalog();
 return <Link className="luxury-button outline" to={materialStudioUrl(material.id)} onClick={()=>selectMaterial(material.id)}>Try in My Room <ArrowUpRight size={16}/></Link>;
}
export function MaterialSampleCard({material:m}:{material:Material}){
 const reduced=useReducedMotion();const {textureStatus}=useMaterialCatalog();const ready=textureStatus[m.id]==='ready';
 return <motion.article layout={!reduced} initial={reduced?false:{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.05}} transition={{duration:reduced?0:.35}} className={`sample-card ${ready?'preview-ready':'reference-only'}`}><Link to={`/materials/${m.slug}`} className="sample-image"><img src={assetUrl(m.thumbnailUrl)} alt={`${m.name} — illustrative material sample`} loading="lazy"/><span className="image-tag">Sample / {m.id}</span></Link><span className="texture-readiness">{ready?'Ready to Preview':'Reference Only'}{textureStatus[m.id]==='loading'?' · Checking texture…':textureStatus[m.id]==='failed'?' · Texture failed to load':''}</span><span className="eyebrow">{m.category}</span><h3><Link to={`/materials/${m.slug}`}>{m.name}</Link></h3><p>{m.colors.join(' · ')} / {m.finishes.join(' · ')}</p><div className="sample-actions"><Link to={`/materials/${m.slug}`} className="quiet-link">View details <ArrowUpRight size={15}/></Link><TryMaterialLink material={m}/></div></motion.article>;
}
export function CatalogStatus(){const {loading,error,retry}=useMaterialCatalog();return loading?<p role="status">Loading the material collection…</p>:error?<div role="alert"><p>{error}</p><button className="luxury-button outline" onClick={retry}>Try again</button></div>:null;}
