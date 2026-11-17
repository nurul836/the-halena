/** Future persistence adapter: no saved designs are fabricated or stored yet. */
export interface SavedDesignSummary {
 id:string;
 ownerId:string;
 kind:'material-try-on'|'ai-interior';
 title:string;
 createdAt:string;
}
export interface DesignLibraryRepository {
 listForCurrentUser(signal?:AbortSignal):Promise<SavedDesignSummary[]>;
 deleteOwnedDesign(id:string):Promise<void>;
}
// A future adapter must enforce ownership in its backend/RLS, not trust ownerId
// supplied by a browser. Existing AI history remains in the secure AI endpoint.
