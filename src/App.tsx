import {AuthProvider} from './auth/AuthProvider';
import { lazy, Suspense, useEffect, useRef } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppLayout } from './components/layout';
import { PageTransition } from './components/ui';
const AuthCallback=lazy(()=>import('./pages/AuthCallback'));
const Home=lazy(()=>import('./pages/Home'));
const Legal=lazy(()=>import('./pages/Pages').then(m=>({default:m.Legal})));
const NotFound=lazy(()=>import('./pages/Pages').then(m=>({default:m.NotFound})));
const Materials=lazy(()=>import('./pages/MaterialPages').then(m=>({default:m.Materials})));
const MaterialDetail=lazy(()=>import('./pages/MaterialPages').then(m=>({default:m.MaterialDetail})));
const MaterialTryOn=lazy(()=>import('./pages/MaterialStudio'));
const InteriorGenerator=lazy(()=>import('./pages/InteriorGenerator'));
import { CatalogProvider, useMaterialCatalog } from './catalog/CatalogProvider';
const About=lazy(()=>import('./pages/BusinessPages').then(m=>({default:m.AboutPage})));
const Services=lazy(()=>import('./pages/BusinessPages').then(m=>({default:m.ServicesPage})));
const ServiceDetailPage=lazy(()=>import('./pages/BusinessPages').then(m=>({default:m.ServiceDetailPage})));
const Projects=lazy(()=>import('./pages/BusinessPages').then(m=>({default:m.ProjectsPage})));
const ProjectDetail=lazy(()=>import('./pages/BusinessPages').then(m=>({default:m.ProjectDetailPage})));
const Contact=lazy(()=>import('./pages/ContactPage'));
import { updateMetadata } from './seo';

function RouteEffects() {
 const {materials}=useMaterialCatalog();
 const {pathname,hash}=useLocation();const first=useRef(true);
 useEffect(()=>{updateMetadata(pathname,materials);},[pathname,materials]);
 useEffect(()=>{
  if(!first.current){window.scrollTo({top:0,behavior:'instant'});document.querySelector<HTMLElement>('#main-content')?.focus({preventScroll:true});}first.current=false;
 },[pathname]);
 useEffect(()=>{
  if(!hash)return;
  let observer:MutationObserver|undefined;
  const locate=()=>{
   let id:string;try{id=decodeURIComponent(hash.slice(1));}catch{return;}
   const target=document.getElementById(id);
   if(target){target.scrollIntoView({behavior:'instant',block:'start'});if(!target.hasAttribute('tabindex'))target.setAttribute('tabindex','-1');target.focus({preventScroll:true});observer?.disconnect();return true;}return false;
  };
  const frame=requestAnimationFrame(()=>{if(!locate()){observer=new MutationObserver(locate);observer.observe(document.getElementById('main-content')!,{childList:true,subtree:true});}});
  return ()=>{cancelAnimationFrame(frame);observer?.disconnect();};
 },[pathname,hash]);return null;
}
export const clientPages={AuthCallback,Home,Legal,NotFound,Materials,MaterialDetail,MaterialTryOn,InteriorGenerator,About,Services,ServiceDetailPage,Projects,ProjectDetail,Contact};
export type Pages = { [K in keyof typeof clientPages]: React.ComponentType<React.ComponentProps<typeof clientPages[K]>> };
export default function App({pages=clientPages}:{pages?:Pages}={}) {
 return <AuthProvider><CatalogProvider><AppRoutes pages={pages}/></CatalogProvider></AuthProvider>;
}
function LegacyGenerator(){const {search,hash}=useLocation();return <Navigate replace to={'/ai-studio'+search+hash}/>;}
function AppRoutes({pages}:{pages:Pages}) {
 const {AuthCallback,Home,Legal,NotFound,Materials,MaterialDetail,MaterialTryOn,InteriorGenerator,About,Services,ServiceDetailPage,Projects,ProjectDetail,Contact}=pages;
 const {pathname}=useLocation();
 const page=(element:React.ReactNode)=><PageTransition key={pathname}><Suspense fallback={<div className="route-loading" role="status">Loading your next space…</div>}>{element}</Suspense></PageTransition>;
 return <><RouteEffects/><Routes><Route element={<AppLayout/>}><Route path="auth/callback" element={page(<AuthCallback/>)}/><Route index element={page(<Home/>)}/><Route path="about" element={page(<About/>)}/><Route path="services" element={page(<Services/>)}/><Route path="services/:slug" element={page(<ServiceDetailPage/>)}/><Route path="projects" element={page(<Projects/>)}/><Route path="projects/:slug" element={page(<ProjectDetail/>)}/><Route path="materials" element={page(<Materials/>)}/><Route path="materials/:slug" element={page(<MaterialDetail/>)}/><Route path="material-try-on" element={page(<MaterialTryOn/>)}/><Route path="ai-studio" element={page(<InteriorGenerator/>)}/><Route path="ai-studio/generator" element={<LegacyGenerator/>}/><Route path="contact" element={page(<Contact/>)}/><Route path="privacy-policy" element={page(<Legal type="privacy"/>)}/><Route path="terms-of-service" element={page(<Legal type="terms"/>)}/><Route path="*" element={page(<NotFound/>)}/></Route></Routes></>;
}
