/** Integration boundaries for later phases. No provider calls or simulated results. */
export interface UploadAsset { id: string; url: string; mimeType: string; }
export interface UploadService { upload(file: File, signal?: AbortSignal): Promise<UploadAsset>; }
export interface VisualizationRequest { imageId: string; prompt: string; materialIds: string[]; }
export interface VisualizationService { create(request: VisualizationRequest, signal?: AbortSignal): Promise<{ jobId: string }>; }
export interface CatalogRepository<T> { list(): Promise<T[]>; get(slug: string): Promise<T | null>; }
