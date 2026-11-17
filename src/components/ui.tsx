import {assetUrl} from '../config/paths';
import { useRef } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import type { projects, materials } from '../data/catalog';

export function PageTransition({ children }: { children: ReactNode }) {
 const reduced = useReducedMotion();
 return <motion.div initial={reduced ? false : { opacity: 1, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }}>{children}</motion.div>;
}
export function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
 const reduced = useReducedMotion();
 return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .12 }} transition={{ duration: .7 }}>{children}</motion.div>;
}
export function AnimatedText({ children }: { children: string }) {
 const reduced = useReducedMotion();
 return <span aria-label={children}>{children.split(' ').map((word, i) => <span className="word-mask" key={i}><motion.span aria-hidden="true" initial={reduced ? false : { y: '105%' }} whileInView={{ y: 0 }} viewport={{ once: true }} transition={{ duration: .8, delay: i * .07 }}>{word}&nbsp;</motion.span></span>)}</span>;
}
export function ImageReveal({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
 const reduced = useReducedMotion();
 return <motion.div className={`image-reveal ${className}`} initial={reduced ? false : { clipPath: 'inset(8% 0 8% 0)', opacity: 0 }} whileInView={{ clipPath: 'inset(0% 0 0% 0)', opacity: 1 }} viewport={{ once: true, amount: .1 }} transition={{ duration: .85 }}><img src={assetUrl(src)} alt={alt} loading="lazy" decoding="async" /></motion.div>;
}
export function ParallaxImage({ src, alt }: { src: string; alt: string }) {
 const ref = useRef<HTMLDivElement>(null);
 const reduced = useReducedMotion();
 const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
 const y = useTransform(scrollYProgress, [0, 1], ['-4%', '4%']);
 return <div ref={ref} className="parallax-image"><motion.img src={assetUrl(src)} alt={alt} loading="lazy" decoding="async" style={{ y: reduced ? 0 : y }} /></div>;
}
export function LuxuryButton({ children, to, variant = 'primary' }: { children: ReactNode; to: string; variant?: 'primary' | 'outline' | 'text' }) {
 return <Link className={`luxury-button ${variant}`} to={to}>{children}<ArrowUpRight size={17} strokeWidth={1.4} /></Link>;
}
export function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
 return <Reveal className="section-heading"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{children && <p>{children}</p>}</Reveal>;
}
export function ProjectCard({ project, index = 0 }: { project: typeof projects[number]; index?: number }) {
 return <Link to={`/projects/${project.slug}`} className="project-card group"><div className="project-image"><img src={assetUrl(project.image)} alt={`${project.title} — illustrative interior reference`} loading="lazy" decoding="async" /><span className="image-tag">Concept study</span><span className="round-arrow"><ArrowUpRight size={22} /></span></div><div className="card-meta"><div><span className="eyebrow">{project.category} / Concept {String(index + 1).padStart(2, '0')}</span><h3>{project.title}</h3></div><ArrowUpRight size={20} /></div></Link>;
}
export function MaterialCard({ material }: { material: typeof materials[number] }) {
 return <Link to={`/materials/${material.slug}`} className="material-card"><div aria-hidden="true" className={`material-swatch ${material.className}`} /><div className="card-meta"><div><span className="eyebrow">{material.family}</span><h3>{material.title}</h3></div><ArrowUpRight size={20} /></div></Link>;
}
export function ConsultationCTA() {
 return <section className="consultation section-pad"><Reveal><span className="eyebrow">Every remarkable space begins with a conversation</span><h2>Let’s imagine<br /><em>something extraordinary.</em></h2><LuxuryButton to="/contact">Start a conversation</LuxuryButton></Reveal><span className="cta-mark" aria-hidden="true">H</span></section>;
}
