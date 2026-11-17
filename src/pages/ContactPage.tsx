import { useSearchParams } from 'react-router-dom';
import { ArrowDown } from 'lucide-react';
import { BusinessHero, VerticalTimeline } from '../components/business';
import { InquiryForm } from '../components/InquiryForm';
import { Reveal, SectionHeading } from '../components/ui';
import { business } from '../config/business';
import { designServices } from '../data/businessPages';
import { images } from '../data/catalog';
export default function ContactPage(){
 const [search]=useSearchParams();const service=designServices.find(s=>s.slug===search.get('service'));const type=service?.slug==='material-consultation'?'Material Consultation':service?.category||'';
 return <div className="business-page consultation-page"><BusinessHero eyebrow="International consultation / Begin a conversation" title="Let's Create Something Exceptional." description="A home, a workplace, a destination. Tell us about the space you imagine and the life you want it to support." image={images.kitchen} compact/><section className="business-pad inquiry-layout" id="project-inquiry"><aside className="inquiry-aside"><span className="eyebrow">Your vision / Our starting point</span><h2>Every detail<br/><em>begins with you.</em></h2><p>Share the context, possibilities and practical priorities of your project. An indicative budget helps frame a future conversation; it is never a binding commitment.</p><div className="studio-contact"><h3>Studio contact</h3>{business.email?<a href={`mailto:${business.email}`}>{business.email}</a>:<p>Email details will be published when configured.</p>}{business.phone&&<a href={`tel:${business.phone.replace(/[^+\d]/g,'')}`}>{business.phone}</a>}{business.address&&<p>{business.address}</p>}<p>Online enquiries are not yet enabled. No response time or appointment is confirmed by preparing a brief.</p></div></aside><InquiryForm initialProjectType={type}/></section><section className="business-pad consultation-process"><SectionHeading eyebrow="What a consultation can look like" title="A thoughtful first conversation."/><VerticalTimeline steps={[
 ['Share Your Vision','01 / Your starting point','Prepare the context, ideas and priorities you would like to discuss.'],
 ['Initial Consultation','02 / Establish the context','Once contact channels are active, a conversation can explore fit, expectations and the available information.'],
 ['Design Discussion','03 / Explore the possibilities','Discuss spatial needs, material direction and the level of design support appropriate to the project.'],
 ['Next Steps','04 / Agree a direction','Any engagement proceeds only after scope, responsibilities, fees and timing are agreed.'],
 ]}/></section><section className="business-pad contact-closing"><Reveal><span className="eyebrow">Your next chapter</span><h2>A clear brief.<br/><em>A world of possibility.</em></h2><p>Start with what matters to you. The details can develop from there.</p><a className="luxury-button outline" href="#project-inquiry">Prepare your project brief<ArrowDown size={17}/></a></Reveal></section></div>;
}
