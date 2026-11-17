import {withBase} from './config/paths';
import { conceptProjects, designServices } from './data/businessPages';
import { sampleMaterials } from './catalog/sampleMaterials';
import { business } from './config/business';
export const metadata:Record<string,[string,string]> = {
 '/':['Spaces with soul','Luxury interior design, architectural thinking and material exploration. Discover THE HALENA’s considered design perspective.'],
 '/auth/callback':['Account verification','Complete secure account sign-in.'],
 '/about':['Our philosophy','Discover a design philosophy grounded in intention, materiality and possibility.'],
 '/services':['Design disciplines','Explore interior design, architectural direction, material exploration and AI-assisted visualization.'],
 '/projects':['Concept studies','Explore illustrative interior concepts shaped by proportion, atmosphere and materiality.'],
 '/materials':['Material library','Explore nine material families through an interactive collection of clearly labelled interior design studies.'],
 '/material-try-on':['Material Try-On Studio','Explore materials on your room photograph with local polygon editing, perspective texture mapping and downloadable previews.'],
 '/ai-studio':['AI Interior Generator','Explore AI-assisted interior redesign with explicit processing consent, private storage and authorized access.'],
 '/contact':['International consultation','Prepare an international interior design brief with THE HALENA. Online enquiry delivery is not yet enabled.'],
 '/privacy-policy':['Privacy policy','Privacy information for THE HALENA foundation website.'],
 '/terms-of-service':['Terms of service','Website terms and information about illustrative design content.'],
};

export const publicRoutes=[...Object.keys(metadata),...designServices.map(s=>'/services/'+s.slug),...conceptProjects.map(p=>'/projects/'+p.slug),...sampleMaterials.filter(m=>m.isActive).map(m=>'/materials/'+m.slug)];
export function productionOrigin(value=business.siteUrl){if(!value)return '';const url=new URL(value);if(url.protocol!=='https:'||url.pathname!=='/'||url.search||url.hash||url.username||url.password)throw new Error('VITE_SITE_URL must be an HTTPS origin without a path or credentials.');return url.origin;}
export function pageMetadata(pathname:string,materials=sampleMaterials){
 const path=pathname.replace(/\/$/,'')||'/';
 const material=materials.find(m=>m.isActive&&path==='/materials/'+m.slug);
 const item=conceptProjects.find(p=>path==='/projects/'+p.slug)||designServices.find(s=>path==='/services/'+s.slug)||(material?{title:material.name,description:material.description}:undefined);
 const [title,description]=metadata[path]||(item?[item.title,item.description]:['Page not found','This page could not be found.']);
 const origin=productionOrigin(); const known=Boolean(metadata[path]||item);
 const indexable=known&&!path.startsWith('/auth/')&&!path.startsWith('/ai-studio')&&path!=='/material-try-on';
 return {title:title+' — THE HALENA',description,canonical:origin?origin+withBase(path):'',image:origin?origin+withBase('/images/business/lounge.webp'):'',robots:origin&&indexable?'index, follow':'noindex, follow',known,path};
}
export function structuredData(pathname:string){const meta=pageMetadata(pathname);if(!meta.canonical||!meta.known)return null;const origin=productionOrigin();return {'@context':'https://schema.org','@type':'WebPage','@id':meta.canonical,name:meta.title,description:meta.description,url:meta.canonical,inLanguage:'en',isPartOf:{'@type':'WebSite',name:'THE HALENA',url:origin},publisher:{'@type':'Organization',name:'THE HALENA',url:origin}};}
export function updateMetadata(pathname:string,materials=sampleMaterials){const meta=pageMetadata(pathname,materials);document.title=meta.title;
 const set=(key:string,value:string,property=false)=>{const attr=property?'property':'name';let el=document.head.querySelector<HTMLMetaElement>('meta['+attr+'="'+key+'"]');if(!el){el=document.createElement('meta');el.setAttribute(attr,key);document.head.append(el);}el.content=value;};
 set('description',meta.description);set('robots',meta.robots);set('og:title',meta.title,true);set('og:description',meta.description,true);set('og:type','website',true);set('og:site_name','THE HALENA',true);set('og:url',meta.canonical,true);set('og:image',meta.image,true);set('og:image:alt','Architectural interior reference for THE HALENA',true);set('twitter:card','summary_large_image');
 let link=document.querySelector<HTMLLinkElement>('link[rel="canonical"]');if(meta.canonical){if(!link){link=document.createElement('link');link.rel='canonical';document.head.append(link);}link.href=meta.canonical;}else link?.remove();
 document.getElementById('structured-data')?.remove();const data=structuredData(pathname);if(data){const script=document.createElement('script');script.id='structured-data';script.type='application/ld+json';script.textContent=JSON.stringify(data);document.head.append(script);}
}
