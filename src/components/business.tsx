import {assetUrl} from '../config/paths';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from 'lucide-react';
import { AnimatedText, ImageReveal, LuxuryButton, Reveal } from './ui';
import type { ConceptProject, DesignService } from '../data/businessPages';

export function BusinessHero({eyebrow,title,description,image,compact=false}:{eyebrow:string;title:string;description:string;image?:string;compact?:boolean}){
 const reduced=useReducedMotion();const hero=useRef<HTMLElement>(null);const {scrollYProgress}=useScroll({target:hero,offset:['start start','end start']});const y=useTransform(scrollYProgress,[0,1],['0%','10%']);
 return <section ref={hero} className={`business-hero ${image?'has-image':''} ${compact?'compact':''}`}>
  {image&&<><motion.img className="business-hero-image" src={assetUrl(image)} alt={`${title} — illustrative architectural reference`} fetchPriority="high" style={{y:reduced?0:y}} initial={reduced?false:{scale:1.04}} animate={{scale:1}} transition={{duration:2}}/><div className="business-hero-shade"/></>}
  <Link className="wordmark business-wordmark" to="/">THE HALENA</Link><div className="business-hero-copy"><span className="eyebrow">{eyebrow}</span><h1><AnimatedText>{title}</AnimatedText></h1><p>{description}</p></div><span className="business-hero-foot">ARCHITECTURE / INTERIORS / MATERIALITY</span>
 </section>;
}
export function VerticalTimeline({steps}:{steps:string[][]}){
 const ref=useRef<HTMLDivElement>(null);const reduced=useReducedMotion();const {scrollYProgress}=useScroll({target:ref,offset:['start 80%','end 65%']});
 return <div ref={ref} className="vertical-timeline"><div className="vertical-track" aria-hidden="true"><motion.i style={{scaleY:reduced?1:scrollYProgress}}/></div>{steps.map(([title,subtitle,copy],i)=><Reveal className="vertical-step" key={title}><span className="timeline-number">0{i+1}</span><div><span className="eyebrow">{subtitle}</span><h3>{title}</h3><p>{copy}</p></div></Reveal>)}</div>;
}
export function BusinessCTA({title="Let's Shape Something Extraordinary.",image}:{title?:string;image?:string}){
 return <section className={`business-cta ${image?'with-image':''}`}>{image&&<img src={assetUrl(image)} alt="Illustrative architectural atmosphere" loading="lazy"/>}<Reveal><span className="eyebrow">A conversation is the beginning</span><h2>{title}</h2><LuxuryButton to="/contact">Start your project</LuxuryButton></Reveal></section>;
}
export function ServicePresentation({service,index}:{service:DesignService;index:number}){
 return <article id={service.slug} tabIndex={-1} className={`service-presentation ${index%2?'reverse':''}`}><ImageReveal src={assetUrl(service.image)} alt={`${service.title} — reference photography`}/><Reveal className="service-presentation-copy"><span className="eyebrow">{String(index+1).padStart(2,'0')} / {service.title}</span><h2>{service.headline}</h2><p>{service.description}</p><div className="service-links"><LuxuryButton to={`/services/${service.slug}`} variant="text">Explore this service</LuxuryButton><Link to={`/contact?service=${service.slug}`} className="quiet-link">Discuss your project <ArrowUpRight size={15}/></Link></div></Reveal></article>;
}
export function ConceptCard({project}:{project:ConceptProject}){
 return <Link className="concept-card" to={`/projects/${project.slug}`}><div className="concept-card-image"><img src={assetUrl(project.image)} alt={`${project.title} concept — reference photography`} loading="lazy"/><span className="image-tag">Concept Study</span><span className="round-arrow"><ArrowUpRight size={21}/></span></div><div className="card-meta"><div><span className="eyebrow">{project.category} / Spatial exploration</span><h3>{project.title}</h3></div><ArrowUpRight size={19}/></div></Link>;
}
export function ReferenceGallery({items}:{items:{src:string;alt:string}[]}){
 const [selected,setSelected]=useState<number|null>(null);const dialog=useRef<HTMLDialogElement>(null);const opener=useRef<HTMLElement|null>(null);
 useEffect(()=>{if(selected===null)return;dialog.current?.showModal();const overflow=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{dialog.current?.close();document.body.style.overflow=overflow;opener.current?.focus();};},[selected===null]);
 return <><div className="reference-gallery">{items.map((item,i)=><button key={item.src} type="button" onClick={e=>{opener.current=e.currentTarget;setSelected(i);}} aria-label={`Enlarge reference ${i+1}: ${item.alt}`}><ImageReveal src={assetUrl(item.src)} alt={item.alt}/><span>{String(i+1).padStart(2,'0')} / Reference image <ArrowUpRight size={16}/></span></button>)}</div><dialog ref={dialog} className="gallery-dialog" aria-label="Reference image viewer" onCancel={()=>setSelected(null)} onClick={e=>{if(e.target===e.currentTarget)setSelected(null);}} onKeyDown={e=>{if(selected===null)return;if(e.key==='ArrowRight'){e.preventDefault();setSelected((selected+1)%items.length);}if(e.key==='ArrowLeft'){e.preventDefault();setSelected((selected+items.length-1)%items.length);}}}>{selected!==null&&<div className="gallery-dialog-content"><button className="gallery-close" aria-label="Close image viewer" onClick={()=>setSelected(null)}><X/></button><motion.img key={items[selected].src} src={assetUrl(items[selected].src)} alt={items[selected].alt} initial={{opacity:.6}} animate={{opacity:1}} transition={{duration:.25}}/><div className="gallery-dialog-controls"><button aria-label="Previous reference" onClick={()=>setSelected((selected+items.length-1)%items.length)}><ArrowLeft/></button><p aria-live="polite">{selected+1} / {items.length} — {items[selected].alt}</p><button aria-label="Next reference" onClick={()=>setSelected((selected+1)%items.length)}><ArrowRight/></button></div></div>}</dialog></>;
}
