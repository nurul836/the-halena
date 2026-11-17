import {hasLicensedTexture} from '../catalog/readiness';
import type {Material} from '../catalog/types';
import type {Surface} from './model';
import {defaultSettings,validPolygon} from './model';
export function compatible(material:Material,kind:Surface['kind']) {return material.suitableSurfaces.includes(kind);}
export function applicationIssue(material:Material|undefined,surface:Surface|undefined,loaded:ReadonlyMap<string,unknown>,roomReady:boolean,drawing:boolean,loading:boolean){
 if(!roomReady)return 'Step 1: upload a room photograph.';
 if(drawing)return 'Step 2: finish your surface selection. Tap corners around its boundary, then choose Finish surface.';
 if(!surface||!validPolygon(surface.points))return 'Step 2: select a wall or floor before applying a material.';
 if(!material)return 'Step 3: choose a material below the room preview.';
 if(!hasLicensedTexture(material))return `${material.id} is reference-only: a usable rendering texture has not been supplied. Choose a preview-ready material.`;
 if(!compatible(material,surface.kind))return `This material supports ${material.suitableSurfaces.join(' or ').toLowerCase()}, not this ${surface.kind.toLowerCase()}. Select a compatible material or surface.`;
 if(!loaded.has(material.id))return loading?'Loading the selected texture. It will apply when ready.':'This texture failed to load. Retry textures or choose another ready material.';
 return '';
}
export function materialSettings(material:Material){return {...defaultSettings(),scale:material.previewSettings?.scale??1,rotation:material.previewSettings?.rotation??0};}
