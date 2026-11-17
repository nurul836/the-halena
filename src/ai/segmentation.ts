import type {Point} from '../studio/model';
/** Extension point only. No automatic detector is configured or advertised. */
export interface SurfaceSegmentationProvider{detect(image:Blob,signal:AbortSignal):Promise<{kind:'Wall'|'Floor';polygon:Point[];confidence:number}[]>}
export const automaticSegmentation:SurfaceSegmentationProvider|null=null;
