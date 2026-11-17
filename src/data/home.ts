import { images } from './catalog';
export const homeImages = {
 hero: images.interior,
 bathroom: '/images/bathroom.webp',
 stone: '/images/stone.webp',
 marble: '/images/marble.webp',
 wood: '/images/wood.webp',
 finish: '/images/finish.webp',
};
export const featuredServices = [
 { slug:'residential-interiors',title:'Residential Interiors',image:images.room,description:'Personal spaces shaped around your rituals, aspirations and the way you live.' },
 { slug:'commercial-interiors',title:'Commercial Interiors',image:images.hero,description:'Purposeful environments that connect a brand’s identity with the experience of its people.' },
 { slug:'kitchen-design',title:'Kitchen Design',image:images.kitchen,description:'A balance of effortless circulation, considered storage and a beautiful material palette.' },
 { slug:'bathroom-design',title:'Bathroom Design',image:homeImages.bathroom,description:'Restorative spaces guided by light, practical planning and tactile finishes.' },
 { slug:'architectural-visualization',title:'Architectural Visualization',image:images.interior,description:'Visual studies that communicate atmosphere, proportion and design intent before decisions are made.' },
 { slug:'material-consultation',title:'Material Consultation',image:homeImages.stone,description:'Explore coherent combinations of texture, tone and finish, with supplier verification before specification.' },
];
export const materialCollections = [
 {title:'Marble',slug:'marble',image:homeImages.marble,note:'Expressive / Sculptural'},
 {title:'Natural Stone',slug:'natural-stone',image:homeImages.stone,note:'Organic / Enduring'},
 {title:'Wood',slug:'warm-timber',image:homeImages.wood,note:'Warm / Tactile'},
 {title:'Wall Panels',slug:'wall-panels',image:homeImages.wood,note:'Rhythm / Dimension'},
 {title:'Flooring',slug:'flooring',image:homeImages.stone,note:'Grounded / Considered'},
 {title:'Decorative Finishes',slug:'decorative-finishes',image:homeImages.finish,note:'Depth / Character'},
];
export const processSteps = [
 ['Discover','A conversation about you.','We begin with your aspirations, the character of your space and the way you want to feel within it.'],
 ['Conceptualize','Give imagination a direction.','Spatial ideas, references and a first material palette bring the possibilities into focus.'],
 ['Refine','Bring every detail into balance.','Together, we develop the chosen direction, considering proportion, function and finish.'],
 ['Realize','Prepare the vision for its next chapter.','The agreed design scope informs the next steps, with delivery responsibilities defined for each project.'],
];
