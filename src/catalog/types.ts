export const categoryNames=['Marble','Natural Stone','Wood','Wall Panels','Wallpaper','Ceramic & Porcelain Tiles','Flooring','Decorative Finishes','Architectural Textures'] as const;
export type MaterialCategory=typeof categoryNames[number];
export interface Material {
 id:string; slug:string; name:string; category:MaterialCategory; description:string;
 colors:string[]; finishes:string[]; materialType:string; suitableSurfaces:string[];
 referenceImageUrl?:string; licenseStatus?:'cleared'|'unresolved'; licenseEvidence?:string;
 thumbnailUrl:string; textureUrl:string|null; galleryImages:string[];
 textureScale?:{widthMm:number;heightMm:number}; textureRepeat?:boolean;
 /** Relative preview settings; not invented physical dimensions. */
 previewSettings?:{scale:number;rotation:number};
 textureOrientation?:'horizontal'|'vertical'|'non-directional';
 isActive:boolean; isSample:true; renderingReady:boolean; readinessNote:string;
 assetKind:'reference-photograph'|'procedural-illustration'|'diffuse-texture'; sourceUrl:string;
 textureLicense?:string;
 verifiedSpecifications:{label:string;value:string;sourceUrl:string}[];
}
export interface MaterialCategoryInfo {name:MaterialCategory;image:string;description:string;}
export interface MaterialFilters {query:string;category:string;color:string;finish:string;materialType:string;surface:string;}
export const emptyMaterialFilters:MaterialFilters={query:'',category:'',color:'',finish:'',materialType:'',surface:''};
export interface MaterialRepository {
 /** Optional local/SSR seed. Remote adapters may omit it and load asynchronously. */
 bootstrap?:readonly Material[];
 list(signal?:AbortSignal):Promise<Material[]>;
 getById(id:string,signal?:AbortSignal):Promise<Material|null>;
 getBySlug(slug:string,signal?:AbortSignal):Promise<Material|null>;
}
