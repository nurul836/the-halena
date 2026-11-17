// Reproducible derivatives of the existing CC0 photographic diffuse map.
// These are design-study textures, never photographs of supplier products.
import sharp from 'sharp';
const root='public/images/render-textures';
await sharp(`${root}/white_marble.jpg`).greyscale().negate().linear(.8,12).jpeg({quality:90}).toFile(`${root}/noir-marble.jpg`);
await sharp(`${root}/white_marble.jpg`).modulate({saturation:.3}).tint({r:216,g:204,b:181}).jpeg({quality:90}).toFile(`${root}/mineral-print.jpg`);
const grout=Buffer.from('<svg width="2048" height="2048"><path d="M0 0H2048V2048H0ZM1024 0V2048M0 1024H2048" fill="none" stroke="#b6ada2" stroke-width="12"/></svg>');
await sharp(`${root}/white_marble.jpg`).composite([{input:grout}]).jpeg({quality:90}).toFile(`${root}/marble-tiles.jpg`);
console.log('Prepared three 2K CC0-derived texture files. Physical products/scale are not implied.');

// Mirror the original project illustration at both axes to close repeat edges.
const bronze=await sharp('public/images/textures/metal-study.svg').resize(1024,1024).png().toBuffer();
await sharp({create:{width:2048,height:2048,channels:3,background:'#aa9270'}}).composite([
 {input:bronze,left:0,top:0}, {input:await sharp(bronze).flop().toBuffer(),left:1024,top:0},
 {input:await sharp(bronze).flip().toBuffer(),left:0,top:1024}, {input:await sharp(bronze).flip().flop().toBuffer(),left:1024,top:1024}
]).jpeg({quality:88,mozjpeg:true}).toFile('public/images/render-textures/satin-bronze.jpg');
