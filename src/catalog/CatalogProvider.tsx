import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Material, MaterialRepository } from './types';
import { materialRepository } from './repository';
import {loadLocalTexture} from '../studio/images';
import {hasLicensedTexture} from './readiness';
interface CatalogState {textureStatus:Record<string,'loading'|'ready'|'failed'>;materials:Material[];loading:boolean;error:string;retry:()=>void;selectedId:string|null;selectMaterial:(id:string|null)=>void;roomImage:File|null;setRoomImage:(file:File|null)=>void;}
const CatalogContext=createContext<CatalogState|null>(null);
export function CatalogProvider({children,repository=materialRepository}:{children:ReactNode;repository?:MaterialRepository}){
 const [textureStatus,setTextureStatus]=useState<Record<string,'loading'|'ready'|'failed'>>({});
 const [materials,setMaterials]=useState<Material[]>([...(repository.bootstrap||[])]);const [loading,setLoading]=useState(!repository.bootstrap);const [error,setError]=useState('');const [attempt,setAttempt]=useState(0);const [selectedId,selectMaterial]=useState<string|null>(null);const [roomImage,setRoomImage]=useState<File|null>(null);
 useEffect(()=>{const controller=new AbortController();setError('');if(!repository.bootstrap)setLoading(true);repository.list(controller.signal).then(items=>{if(!controller.signal.aborted)setMaterials(items.filter(m=>m.isActive));}).catch(()=>{if(!controller.signal.aborted)setError('The material collection could not be loaded. Please try again.');}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});return()=>controller.abort();},[repository,attempt]);
 useEffect(()=>{const controller=new AbortController();const eligible=materials.filter(hasLicensedTexture);setTextureStatus(Object.fromEntries(eligible.map(m=>[m.id,'loading'])));const loads=new Map<string,Promise<HTMLImageElement>>();for(const m of eligible){let task=loads.get(m.textureUrl!);if(!task){task=loadLocalTexture(m.textureUrl!,controller.signal);loads.set(m.textureUrl!,task);}task.then(()=>{if(!controller.signal.aborted)setTextureStatus(previous=>({...previous,[m.id]:'ready'}));}).catch(()=>{if(!controller.signal.aborted)setTextureStatus(previous=>({...previous,[m.id]:'failed'}));});}return()=>controller.abort();},[materials,attempt]);
 return <CatalogContext.Provider value={{textureStatus,materials,loading,error,retry:()=>setAttempt(v=>v+1),selectedId,selectMaterial,roomImage,setRoomImage}}>{children}</CatalogContext.Provider>;
}
export function useMaterialCatalog(){const context=useContext(CatalogContext);if(!context)throw new Error('Material catalog components require CatalogProvider.');return context;}
