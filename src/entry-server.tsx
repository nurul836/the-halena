import {appBase,withBase} from './config/paths';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import ClientApp from './App';
import AuthCallback from './pages/AuthCallback';
import Home from './pages/Home';
import {Legal,NotFound} from './pages/Pages';
import {Materials,MaterialDetail} from './pages/MaterialPages';
import MaterialTryOn from './pages/MaterialStudio';
import InteriorGenerator from './pages/InteriorGenerator';
import Contact from './pages/ContactPage';
import {AboutPage as About,ServicesPage as Services,ServiceDetailPage,ProjectsPage as Projects,ProjectDetailPage as ProjectDetail} from './pages/BusinessPages';
const pages={AuthCallback,Home,Legal,NotFound,Materials,MaterialDetail,MaterialTryOn,InteriorGenerator,About,Services,ServiceDetailPage,Projects,ProjectDetail,Contact};
export default function App(){return <ClientApp pages={pages}/>;}
export { publicRoutes, pageMetadata, structuredData, productionOrigin } from './seo';
export function render(path: string) {
  return renderToString(<StaticRouter basename={appBase} location={withBase(path)}><MotionConfig reducedMotion="user"><App /></MotionConfig></StaticRouter>);
}
