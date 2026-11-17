import type { Material, MaterialCategoryInfo } from './types';
const asset=(name:string)=>`/images/${name}.webp`;
const texture=(name:string)=>`/images/textures/${name}.webp`;
const sources:Record<string,string>={stone:'https://images.unsplash.com/photo-1644033563135-166ac821f696',marble:'https://images.unsplash.com/photo-1645617649646-b4a168237383',wood:'https://images.unsplash.com/photo-1506968430777-bf7784a87f23',finish:'https://images.unsplash.com/photo-1694382224141-8368bf043717'};
type Entry=Pick<Material,'id'|'slug'|'name'|'category'|'description'|'colors'|'finishes'|'materialType'|'suitableSurfaces'> & {asset:string};
const entries:Entry[]=[
 {id:'HLM-001',slug:'marble',name:'Noir Vein — Marble Study',category:'Marble',asset:'marble',colors:['Black','White'],finishes:['Polished'],materialType:'Mineral',suitableSurfaces:['Wall','Countertop'],description:'A dark mineral reference crossed by light veins. This sample explores a dramatic marble direction for focal surfaces; it is not a specified stone product.'},
 {id:'HLM-002',slug:'natural-stone',name:'Dune Strata — Stone Study',category:'Natural Stone',asset:'stone',colors:['Beige','Brown'],finishes:['Honed'],materialType:'Mineral',suitableSurfaces:['Wall','Floor'],description:'Layered sandy tones suggest a calm, geological character. A visual study for natural-stone palettes, with application suitability still to be verified.'},
 {id:'HLM-003',slug:'warm-timber',name:'Warm Grain — Wood Study',category:'Wood',asset:'wood',colors:['Brown'],finishes:['Matte'],materialType:'Timber',suitableSurfaces:['Joinery','Wall'],description:'A timber-grain reference for warm, tactile interiors. Species, treatment and physical performance are not identified by this sample.'},
 {id:'HLM-004',slug:'wall-panels',name:'Timber Rhythm — Panel Study',category:'Wall Panels',asset:'wood',colors:['Brown'],finishes:['Textured'],materialType:'Timber',suitableSurfaces:['Wall'],description:'A panel-design direction using timber texture as an illustrative reference. The photograph does not represent a manufactured panel system or its dimensions.'},
 {id:'HLM-005',slug:'mineral-wallpaper',name:'Mineral Print — Wallpaper Study',category:'Wallpaper',asset:'stone',colors:['Beige','Brown'],finishes:['Matte'],materialType:'Printed surface',suitableSurfaces:['Wall'],description:'An imagined printed wallcovering direction inspired by natural mineral layers. The image is a stone reference, not a photograph or specification of a wallpaper product.'},
 {id:'HLM-006',slug:'porcelain-veil',name:'Vein Composition — Tile Study',category:'Ceramic & Porcelain Tiles',asset:'marble',colors:['Black','White'],finishes:['Polished'],materialType:'Ceramic concept',suitableSurfaces:['Wall','Floor'],description:'A stone-look ceramic and porcelain design direction. Natural stone photography illustrates the pattern; no actual tile, size, slip rating or installation suitability is implied.'},
 {id:'HLM-007',slug:'flooring',name:'Grounded Grain — Floor Study',category:'Flooring',asset:'wood',colors:['Brown'],finishes:['Matte'],materialType:'Timber',suitableSurfaces:['Floor'],description:'A timber-inspired floor palette exploring warmth and continuity. The reference does not establish a flooring construction, finish system or performance standard.'},
 {id:'HLM-008',slug:'decorative-finishes',name:'Veiled Earth — Finish Study',category:'Decorative Finishes',asset:'finish',colors:['Grey','White','Brown'],finishes:['Textured'],materialType:'Decorative concept',suitableSurfaces:['Wall','Joinery'],description:'Expressive veining suggests a layered decorative direction. A mineral photograph communicates atmosphere only; no coating composition or application method is specified.'},
 {id:'HLM-009',slug:'architectural-strata',name:'Sculpted Strata — Texture Study',category:'Architectural Textures',asset:'stone',colors:['Beige','Brown'],finishes:['Textured'],materialType:'Mineral',suitableSurfaces:['Wall'],description:'A study of linear mineral movement as an architectural texture. Depth, relief and physical scale cannot be inferred from the reference image.'},
 {id:'HLM-010',slug:'brushed-metal',name:'Satin Bronze — Metal Study',category:'Decorative Finishes',asset:'metal',colors:['Bronze'],finishes:['Brushed'],materialType:'Metal concept',suitableSurfaces:['Joinery','Wall'],description:'An original digital illustration of a brushed bronze direction. It is not a photograph of a supplier sample, a calibrated metal texture or a verified alloy.'},
];
/** IDs are explicit permanent identifiers, never derived from array order or names. */
export const sampleMaterials:Material[]=entries.map(({asset:assetName,...entry})=>({
 ...entry,referenceImageUrl:assetName==='metal'?'/images/textures/metal-study.svg':asset(assetName),thumbnailUrl:assetName==='metal'?'/images/textures/metal-study.svg':asset(assetName),
 textureUrl:assetName==='metal'?null:texture(assetName),
 galleryImages:assetName==='metal'?['/images/textures/metal-study.svg']:[texture(assetName),asset(assetName)],
 textureOrientation:assetName==='wood'?'horizontal':'non-directional',
 isActive:true,isSample:true,renderingReady:false,
 readinessNote:assetName==='metal'?'Illustration only. A calibrated photographic texture is not available.':'High-resolution reference only. Seamless repeat, physical scale, colour calibration and rendering rights have not been validated.',
 assetKind:assetName==='metal'?'procedural-illustration':'reference-photograph',sourceUrl:sources[assetName]||'',verifiedSpecifications:[],
}));
export const materialCategories:MaterialCategoryInfo[]=[
 {name:'Marble',image:asset('marble'),description:'Expressive veins and considered contrast.'},
 {name:'Natural Stone',image:asset('stone'),description:'Layers of mineral colour and organic movement.'},
 {name:'Wood',image:asset('wood'),description:'Grain, warmth and a tactile sense of character.'},
 {name:'Wall Panels',image:asset('wood'),description:'Rhythm and texture for architectural planes.'},
 {name:'Wallpaper',image:asset('stone'),description:'Illustrative print directions for expressive walls.'},
 {name:'Ceramic & Porcelain Tiles',image:asset('marble'),description:'Pattern studies for considered tiled surfaces.'},
 {name:'Flooring',image:asset('wood'),description:'A grounded palette for the spaces we move through.'},
 {name:'Decorative Finishes',image:asset('finish'),description:'Layered visual directions and subtle reflections.'},
 {name:'Architectural Textures',image:asset('stone'),description:'Material movement explored at a spatial scale.'},
];

// Dedicated, locally hosted color maps. Readiness means usable by the manual
// 2D compositor, not a verified physical product or a calibrated PBR material.
sampleMaterials.push(...([
 {id:'HLM-011',slug:'ivory-marble-texture',name:'Ivory Marble — Texture Study',category:'Marble',colors:['White','Beige'],finishes:['Smooth'],materialType:'Mineral',suitableSurfaces:['Wall','Floor'],asset:'white_marble',description:'A light marble colour map for manual visualization. This digital sample does not specify a manufacturer product or physical finish.'},
 {id:'HLM-012',slug:'oak-panel-texture',name:'Oak Rhythm — Panel Texture',category:'Wall Panels',colors:['Brown'],finishes:['Satin'],materialType:'Timber',suitableSurfaces:['Wall','Floor'],asset:'wood_floor',description:'A wood-plank colour map used as a panel design study. Its use on a wall is a visual interpretation, not a verified panel product or installation recommendation.'},
] as const).map(({asset:assetName,...entry}):Material=>({...entry,colors:[...entry.colors],finishes:[...entry.finishes],suitableSurfaces:[...entry.suitableSurfaces],thumbnailUrl:`/images/render-textures/${assetName}.jpg`,textureUrl:`/images/render-textures/${assetName}.jpg`,galleryImages:[`/images/render-textures/${assetName}.jpg`],textureRepeat:true,textureOrientation:assetName==='wood_floor'?'vertical':'non-directional',isActive:true,isSample:true,renderingReady:true,readinessNote:'Ready for local manual preview using a 2K repeatable diffuse map. Physical scale and product suitability remain unverified; this is not physically based rendering.',assetKind:'diffuse-texture',sourceUrl:`https://polyhaven.com/a/${assetName}`,textureLicense:'CC0 — Poly Haven',verifiedSpecifications:[]})));

// Original IDs/slugs remain stable. Catalog and studio share these actual maps.
const previewAssets:Record<string,{file:string;source:string;note:string;repeat:boolean}>={
 'HLM-001':{file:'noir-marble',source:'white_marble',repeat:true,note:'Dark tonal derivative of a CC0 marble colour map; a digital noir-marble study, not a specified stone.'},
 'HLM-003':{file:'wood_floor',source:'wood_floor',repeat:true,note:'CC0 wood-plank diffuse photograph used for a timber study; not a verified species or joinery product.'},
 'HLM-004':{file:'wood_floor',source:'wood_floor',repeat:true,note:'CC0 wood-plank colour map interpreted as wall panels; not a manufactured panel specification.'},
 'HLM-005':{file:'mineral-print',source:'white_marble',repeat:true,note:'Warm mineral-print derivative of a CC0 marble map, used as a conceptual wallpaper pattern; not an actual wallpaper product.'},
 'HLM-006':{file:'marble-tiles',source:'white_marble',repeat:true,note:'CC0 marble colour map with an illustrative grout grid; a stone-look tile study, not a manufactured tile.'},
 'HLM-007':{file:'wood_floor',source:'wood_floor',repeat:true,note:'CC0 wood-floor colour map for local flooring visualization; installation and physical scale are unverified.'},
};
for(const material of sampleMaterials){
 const asset=previewAssets[material.id];
 if(asset){const url=`/images/render-textures/${asset.file}.jpg`;Object.assign(material,{textureUrl:url,thumbnailUrl:url,galleryImages:[url],renderingReady:true,textureRepeat:asset.repeat,textureOrientation:asset.source==='wood_floor'?'vertical':'non-directional',assetKind:'diffuse-texture',sourceUrl:`https://polyhaven.com/a/${asset.source}`,textureLicense:'CC0 — Poly Haven; derivatives documented in LICENSE.md',description:asset.note,readinessNote:`Usable 2K texture for local preview. ${asset.note}`});}
 if(material.renderingReady)material.previewSettings={scale:1,rotation:0};
}

// Asset eligibility is separate from the browser's successful load/decode state.
for(const material of sampleMaterials){
 if(material.id==='HLM-010')Object.assign(material,{
  textureUrl:'/images/render-textures/satin-bronze.jpg',thumbnailUrl:'/images/render-textures/satin-bronze.jpg',
  galleryImages:['/images/render-textures/satin-bronze.jpg','/images/textures/metal-study.svg'],
  renderingReady:true,textureRepeat:true,textureOrientation:'horizontal',previewSettings:{scale:1,rotation:0},
  textureLicense:'Original THE HALENA procedural artwork — authorized project use',
  readinessNote:'Original bronze illustration rasterized as a mirrored repeat for local preview. No physical metal reflectance, scale or colour calibration is claimed.'
 });
 material.referenceImageUrl??=material.thumbnailUrl;
 material.licenseStatus=material.renderingReady?'cleared':'unresolved';
 material.licenseEvidence=material.id==='HLM-010'?'Original project SVG: /images/textures/metal-study.svg':material.renderingReady?'https://polyhaven.com/license':undefined;
 if(!material.renderingReady){material.textureUrl=null;material.readinessNote='Reference Only: rendering rights for this reference are undocumented and no approved diffuse map is supplied. A licensed texture matching this material is needed.';}
}
