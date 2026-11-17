import { sampleMaterials } from './sampleMaterials';
import type { Material, MaterialFilters, MaterialRepository } from './types';
export function createLocalMaterialRepository(records:readonly Material[]):MaterialRepository{
 const active=()=>records.filter(m=>m.isActive);
 const check=(signal?:AbortSignal)=>signal?.throwIfAborted();
 return {bootstrap:active(),async list(signal){check(signal);return structuredClone(active());},async getById(id,signal){check(signal);return structuredClone(active().find(m=>m.id===id)||null);},async getBySlug(slug,signal){check(signal);return structuredClone(active().find(m=>m.slug===slug)||null);}};
}
export const materialRepository=createLocalMaterialRepository(sampleMaterials);
export function filterMaterials(items:readonly Material[],filters:MaterialFilters):Material[]{
 const terms=filters.query.trim().toLocaleLowerCase('en').split(/\s+/).filter(Boolean);
 return items.filter(m=>m.isActive&&(!filters.category||m.category===filters.category)&&(!filters.color||m.colors.includes(filters.color))&&(!filters.finish||m.finishes.includes(filters.finish))&&(!filters.materialType||m.materialType===filters.materialType)&&(!filters.surface||m.suitableSurfaces.includes(filters.surface))&&terms.every(term=>`${m.name} ${m.id} ${m.category}`.toLocaleLowerCase('en').includes(term)));
}
export function getFilterOptions(items:readonly Material[]){const active=items.filter(m=>m.isActive);const unique=(values:string[])=>[...new Set(values)].sort();return {colors:unique(active.flatMap(m=>m.colors)),finishes:unique(active.flatMap(m=>m.finishes)),materialTypes:unique(active.map(m=>m.materialType)),surfaces:unique(active.flatMap(m=>m.suitableSurfaces))};}
export function categoryCounts(items:readonly Material[]){return items.filter(m=>m.isActive).reduce<Record<string,number>>((counts,m)=>({...counts,[m.category]:(counts[m.category]||0)+1}),{});}
export const materialStudioUrl=(id:string)=>`/material-try-on?material=${encodeURIComponent(id)}`;
