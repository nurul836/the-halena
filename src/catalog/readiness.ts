import type {Material} from './types';
export const hasLicensedTexture=(m:Material)=>m.renderingReady&&!!m.textureUrl&&m.licenseStatus==='cleared';
