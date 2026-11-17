export const roomTypes=['Living Room','Bedroom','Kitchen','Bathroom','Dining Room','Office','Commercial Space','Other'] as const;
export const designStyles=[
 {id:'modern-luxury',name:'Modern Luxury',description:'Sculptural furnishings, rich stone and restrained metallic details.',image:'/images/business/lounge.webp'},
 {id:'contemporary',name:'Contemporary',description:'Clean architectural lines, thoughtful contrast and expressive forms.',image:'/images/business/commercial.webp'},
 {id:'minimalist',name:'Minimalist',description:'Quiet proportions, essential furnishings and a reduced palette.',image:'/images/bathroom.webp'},
 {id:'scandinavian',name:'Scandinavian',description:'Pale timber, soft textiles and inviting daylight.',image:'/images/business/bedroom.webp'},
 {id:'japandi',name:'Japandi',description:'Natural textures, low silhouettes and a calm, earthy palette.',image:'/images/wood.webp'},
 {id:'industrial',name:'Industrial',description:'Honest structural character, dark metal and tactile mineral finishes.',image:'/images/business/office.webp'},
 {id:'classic-luxury',name:'Classic Luxury',description:'Balanced compositions, tailored details and elegant layered materials.',image:'/images/business/hospitality.webp'},
 {id:'mediterranean',name:'Mediterranean',description:'Warm plaster, sandy stone and relaxed natural texture.',image:'/images/stone.webp'},
 {id:'modern-organic',name:'Modern Organic',description:'Rounded forms, natural grain and warm neutral tones.',image:'/images/business/lounge.webp'},
] as const;
export type RoomType=typeof roomTypes[number];
export type StyleId=typeof designStyles[number]['id'];
export interface GenerationRequest {requestId:string;roomType:RoomType;style:StyleId;instructions:string;consent:true;imageBase64:string;mimeType:'image/jpeg'|'image/png'|'image/webp'}
export interface GenerationJob {id:string;status:'processing'|'succeeded'|'failed'|'uncertain'|'deleted';room_type:string;style:string;created_at:string;expires_at:string;error_code?:string|null}
export interface GeneratorStatus {configured:boolean;message:string;provider?:string;retentionHours?:number;model?:string}
