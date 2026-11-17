import {useEffect,useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {completeGoogleCallback,consumeReturnPath} from '../auth/oauth';
export default function AuthCallback(){
 const navigate=useNavigate();const [error,setError]=useState('');
 useEffect(()=>{let live=true;void completeGoogleCallback().then(()=>{if(live)navigate(consumeReturnPath(),{replace:true});}).catch(e=>{if(live)setError(e instanceof Error?e.message:'Sign-in could not be completed.');});return()=>{live=false;};},[navigate]);
 return <section className="auth-callback"><span className="eyebrow">THE HALENA ACCOUNT</span><h1>{error?'Sign-in needs attention.':'Completing your sign-in.'}</h1><p role={error?'alert':'status'}>{error||'Securely verifying your account. Please wait…'}</p>{error&&<Link to="/">Return home and try again ↗</Link>}</section>;
}
