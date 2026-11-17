import {AccountButton} from '../auth/AccountButton';
import {MonogramLogo,LogoWordmark,HorizontalLogo} from './BrandLogo';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { House, UserRound, Layers, LayoutGrid, SwatchBook, PaintRoller, Sparkles, Mail, Menu, X, ArrowUpRight, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
export const navigation = [
 { to: '/', label: 'Home', icon: House }, { to: '/about', label: 'About', icon: UserRound },
 { to: '/services', label: 'Services', icon: Layers }, { to: '/projects', label: 'Projects', icon: LayoutGrid },
 { to: '/materials', label: 'Materials', icon: SwatchBook }, { to: '/material-try-on', label: 'Material Try-On', icon: PaintRoller },
 { to: '/ai-studio', label: 'AI Studio', icon: Sparkles }, { to: '/contact', label: 'Contact', icon: Mail },
];
const preferenceKey='halena.navigation.expanded';
const useBeforePaint=typeof window==='undefined'?useEffect:useLayoutEffect;
export function SidebarNavigation() {
 const [expanded,setExpanded]=useState(false);const [ready,setReady]=useState(false);
 const sidebar=useRef<HTMLElement>(null);const toggle=useRef<HTMLButtonElement>(null);
 useBeforePaint(()=>{try{setExpanded(localStorage.getItem(preferenceKey)==='true');}catch{/* Storage is optional. */}setReady(true);},[]);
 const change=(value:boolean)=>{setExpanded(value);try{localStorage.setItem(preferenceKey,String(value));}catch{/* Private browsing remains usable. */}};
 useEffect(()=>{if(!expanded)return;const outside=(event:Event)=>{if(event.target instanceof Node&&!sidebar.current?.contains(event.target))change(false);};const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){change(false);toggle.current?.focus();}};document.addEventListener('pointerdown',outside);document.addEventListener('focusin',outside);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('focusin',outside);document.removeEventListener('keydown',escape);};},[expanded]);
 return <aside ref={sidebar} className="sidebar glass-sidebar" data-expanded={expanded} data-ready={ready} aria-label="Site navigation"><Link className="glass-brand" to="/" aria-label="THE HALENA home"><span className="glass-logo-slot"><MonogramLogo/></span><span className="glass-label brand-name"><LogoWordmark/></span></Link><nav id="desktop-navigation" aria-label="Main navigation">{navigation.map(({to,label,icon:Icon})=><NavLink key={to} to={to} end={to==='/'} aria-label={label} className="nav-icon" onClick={()=>{if(expanded)change(false);}}><Icon aria-hidden="true" size={20} strokeWidth={1.5}/><span className="glass-label" aria-hidden="true">{label}</span>{!expanded&&<span className="tooltip" aria-hidden="true">{label}</span>}</NavLink>)}</nav><button ref={toggle} className="sidebar-toggle" aria-label={expanded?'Collapse navigation':'Expand navigation'} aria-expanded={expanded} aria-controls="desktop-navigation" onClick={()=>change(!expanded)}>{expanded?<PanelLeftClose size={20}/>:<PanelLeftOpen size={20}/>}<span className="glass-label" aria-hidden="true">Collapse navigation</span></button><AccountButton/></aside>;
}
export function MobileNavigation() {
 const [open,setOpen]=useState(false);const {pathname}=useLocation();
 const dialog=useRef<HTMLDialogElement>(null);const trigger=useRef<HTMLButtonElement>(null);const close=useRef<HTMLButtonElement>(null);
 useEffect(()=>{setOpen(false);},[pathname]);
 useEffect(()=>{if(!open)return;dialog.current?.showModal();close.current?.focus();const previous=document.body.style.overflow;document.body.style.overflow='hidden';const media=window.matchMedia('(min-width: 769px)');const resize=()=>{if(media.matches)setOpen(false);};media.addEventListener('change',resize);return()=>{media.removeEventListener('change',resize);dialog.current?.close();document.body.style.overflow=previous;trigger.current?.focus();};},[open]);
 return <div className="mobile-navigation glass-mobile"><button ref={trigger} className="mobile-trigger" aria-label="Open navigation" aria-expanded={open} aria-controls="mobile-menu" onClick={()=>setOpen(true)}><Menu size={22}/></button><dialog ref={dialog} id="mobile-menu" className="mobile-dialog" aria-label="Main navigation" onCancel={e=>{e.preventDefault();setOpen(false);}} onClick={e=>{if(e.target===e.currentTarget)setOpen(false);}}><div className="drawer"><div className="drawer-top"><Link className="brand-home mobile-brand" to="/" aria-label="THE HALENA home" onClick={()=>setOpen(false)}><HorizontalLogo/></Link><button ref={close} aria-label="Close navigation" onClick={()=>setOpen(false)}><X/></button></div><nav aria-label="Mobile navigation">{navigation.map(({to,label,icon:Icon})=><NavLink to={to} end={to==='/'} key={to} onClick={()=>setOpen(false)}><Icon aria-hidden="true" size={20} strokeWidth={1.5}/><span>{label}</span><ArrowUpRight aria-hidden="true" size={16}/></NavLink>)}</nav><AccountButton mobile onOpen={()=>{setOpen(false);trigger.current?.focus();}}/><p>Spaces with soul.<br/>Design without boundaries.</p></div></dialog></div>;
}
