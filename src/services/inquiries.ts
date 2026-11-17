export const projectTypes=['Residential','Commercial','Kitchen','Bathroom','Office','Hospitality','Material Consultation','Other'] as const;
export const currencies=['USD','EUR','GBP','AED','SAR','Other'] as const;
export const propertyTypes=['Apartment','House / Villa','Retail space','Office','Restaurant / Café','Hotel / Guest accommodation','Other'] as const;
export const countryCodes=('AF AL DZ AS AD AO AI AQ AG AR AM AW AU AT AZ BS BH BD BB BY BE BZ BJ BM BT BO BQ BA BW BV BR IO BN BG BF BI CV KH CM CA KY CF TD CL CN CX CC CO KM CG CD CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FK FO FJ FI FR GF PF TF GA GM GE DE GH GI GR GL GD GP GU GT GG GN GW GY HT HM VA HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG NU NF MK MP NO OM PK PW PS PA PG PY PE PH PN PL PT PR QA RE RO RU RW BL SH KN LC MF PM VC WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA GS SS ES LK SD SR SJ SE CH SY TW TJ TZ TH TL TG TK TO TT TN TR TM TC TV UG UA AE GB US UM UY UZ VU VE VN VG VI WF EH YE ZM ZW').split(' ');
const countryNames=new Intl.DisplayNames(['en'],{type:'region'});
export const countries=countryCodes.map(code=>({code,name:countryNames.of(code)||code})).sort((a,b)=>a.name.localeCompare(b.name,'en'));
export interface InquiryValues {name:string;email:string;country:string;phone:string;projectType:string;propertyType:string;budget:string;currency:string;otherCurrency:string;location:string;description:string;consent:boolean;website:string;}
export type InquiryErrors=Partial<Record<keyof InquiryValues|'reference'|'form',string>>;
export const emptyInquiry:InquiryValues={name:'',email:'',country:'',phone:'',projectType:'',propertyType:'',budget:'',currency:'USD',otherCurrency:'',location:'',description:'',consent:false,website:''};
export const referenceRules={maxBytes:10*1024*1024,mimeTypes:['image/jpeg','image/png','image/webp','application/pdf'],extensions:['jpg','jpeg','png','webp','pdf']};
export function validateReference(file:Pick<File,'name'|'size'|'type'>|null):string|undefined{
 if(!file)return;
 if(file.size===0)return 'Choose a non-empty reference file.';
 if(file.size>referenceRules.maxBytes)return 'Choose a reference smaller than or equal to 10 MB.';
 const extension=file.name.split('.').pop()?.toLowerCase()||'';
 const matchingTypes:Record<string,string>={jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',pdf:'application/pdf'};
 if(!referenceRules.mimeTypes.includes(file.type)||matchingTypes[extension]!==file.type)return 'Use a JPG, PNG, WebP or PDF file with a matching file extension.';
}
export function validateInquiry(values:InquiryValues,file:Pick<File,'name'|'size'|'type'>|null=null):InquiryErrors{
 const errors:InquiryErrors={};
 if(values.name.trim().length<2||values.name.trim().length>120)errors.name='Enter your full name (2–120 characters).';
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())||values.email.length>254)errors.email='Enter a valid email address.';
 if(!countryCodes.includes(values.country))errors.country='Select your country or territory.';
 const phone=values.phone.replace(/[\s().-]/g,'');
 if(values.phone&&!/^\+[1-9]\d{6,14}$/.test(phone))errors.phone='Include + and your country code, with 7–15 digits in total.';
 if(!projectTypes.includes(values.projectType as typeof projectTypes[number]))errors.projectType='Select a project type.';
 if(!propertyTypes.includes(values.propertyType as typeof propertyTypes[number]))errors.propertyType='Select a property type.';
 if(values.budget&&(!/^\d+(\.\d{1,2})?$/.test(values.budget)||Number(values.budget)<=0||Number(values.budget)>1e12))errors.budget='Enter a positive indicative amount, using digits and up to two decimal places.';
 if(!currencies.includes(values.currency as typeof currencies[number]))errors.currency='Select a preferred currency.';
 if(values.currency==='Other'&&!/^[A-Za-z]{3}$/.test(values.otherCurrency.trim()))errors.otherCurrency='Enter a three-letter currency code, for example BDT.';
 if(values.location.trim().length<2||values.location.trim().length>200)errors.location='Enter the project city and country (2–200 characters).';
 if(values.description.trim().length<30||values.description.trim().length>5000)errors.description='Describe your project in 30–5,000 characters.';
 if(!values.consent)errors.consent='Please acknowledge the privacy notice before continuing.';
 const referenceError=validateReference(file);if(referenceError)errors.reference=referenceError;
 if(values.website)errors.form='The brief could not be processed. Please leave the website field empty.';
 return errors;
}
/** Server integration seam. No transport is configured or simulated in Phase 3.
 * A production implementation must enforce server validation, origin/CSRF checks,
 * rate limits, anti-abuse verification, private storage, signed short-lived upload
 * grants, magic-byte checks, malware scanning, retention and deletion controls.
 * Client validation is convenience only, never a security boundary.
 */
export interface InquiryGateway {
 submit(values:InquiryValues,reference:File|null,options:{signal:AbortSignal;idempotencyKey:string}):Promise<{accepted:true;receiptId:string}>;
}
export const inquiryGateway:InquiryGateway|null=null;
export async function deliverInquiry(gateway:InquiryGateway|null,values:InquiryValues,file:File|null,options:{signal:AbortSignal;idempotencyKey:string}){
 if(!gateway)throw new Error('Online submissions are not enabled. No enquiry has been sent.');
 if(Object.keys(validateInquiry(values,file)).length)throw new Error('Please correct the highlighted fields before submitting.');
 const receipt=await gateway.submit(values,file,options);
 if(receipt.accepted!==true||!receipt.receiptId?.trim())throw new Error('Delivery could not be confirmed. Please do not assume your enquiry was received.');
 return receipt;
}
export function formatInquiryBrief(values:InquiryValues,file:Pick<File,'name'>|null){
 return `THE HALENA — Local project brief\n\nFull name: ${values.name.trim()}\nEmail: ${values.email.trim()}\nCountry: ${countryNames.of(values.country)}\nPhone: ${values.phone||'Not provided'}\nProject type: ${values.projectType}\nProperty type: ${values.propertyType}\nIndicative budget: ${values.budget||'To be discussed'} ${values.currency==='Other'?values.otherCurrency.toUpperCase():values.currency} (not binding; not a quotation)\nLocation: ${values.location.trim()}\n\nProject description:\n${values.description.trim()}\n\nReference filename: ${file?.name||'None selected'} (file content is not included)\nPrivacy notice acknowledged: ${values.consent?'Yes':'No'}\n\nDownloaded locally. No enquiry or reference file has been sent to THE HALENA.`;
}
