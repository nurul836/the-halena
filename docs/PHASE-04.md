# Phase 4 — Material collection

Implemented locally; not published. Existing homepage, business pages, contact and navigation source files were preserved.

## Delivered

- Cinematic materials landing page, nine image-led category filters and actual active counts.
- Ten clearly labelled sample material studies with stable HLM-001–HLM-010 IDs. Existing material slugs preserved.
- URL-backed search and five combinable facets; clear, count, empty, loading and retry states. Mobile filters use a native modal drawer with Escape and focus return.
- Detail routes, high-resolution reference gallery, palette selection, finish directions, proposed uses, related samples and explicit specification/readiness status.
- Temporary context selection plus shareable `/ai-studio?material=HLM-001` handoff. Direct links resolve independently of prior navigation. Unknown IDs never silently select another sample.
- Local JPG/PNG/WebP room selection with extension/MIME/signature/size checks and browser decoding/dimension checks. Object URLs are revoked on replacement/unmount. Files remain in memory, survive internal navigation and are cleared by reload or removal. No upload, rendering, masking or surface detection occurs.
- Motion card reveals/layout transitions, reduced-motion handling and responsive layouts.

## Architecture and files

- `src/catalog/types.ts`: material and repository contracts, categories and filter model. Metadata supports scale, repeat, orientation, surfaces, source attribution and readiness.
- `src/catalog/sampleMaterials.ts`: ten illustrative records and nine category descriptions, independent of components. These are design directions, not verified manufacturer products.
- `src/catalog/repository.ts`: active-only local repository, cloning and cancellation; search/facet/count helpers and studio URL builder.
- `src/catalog/CatalogProvider.tsx`: replaceable repository, load/error/retry state and temporary room/material state.
- `src/catalog/roomImage.ts`: file header/type/size validation.
- `src/components/catalog.tsx`: reusable sample card, selection link and load/error UI.
- `src/pages/MaterialPages.tsx`, `src/pages/MaterialStudio.tsx`: new catalog, detail and workspace implementations.
- `src/styles/materials.css`: responsive catalog/detail/workspace styles.
- `src/App.tsx`: provider, route integration and material metadata.
- `public/images/textures/`: four high-resolution photographic references and an original procedural metal illustration. No image is advertised as a seamless, calibrated production map. Some studies intentionally reuse a reference; gallery views disclose this.
- `scripts/verify-phase4.mjs`: repository, filtering, routes, assets, handoff and file-validation checks.

## Verification

`npm run build` succeeds. Vite reports an advisory that the main JavaScript chunk is slightly over 500 kB; route splitting remains a useful optimization before deployment.

Phase 4 automated checks pass: ten unique stable IDs/slugs; all nine categories; ID/name/category searches; every filter facet; combined and empty results; clear state; inactive exclusion; repository clone/abort behavior; every local asset path; ten detail pages and ten selected-material workspace routes; missing material/ID states; image signature, extension and size rejection.

Phase 2 and Phase 3 regression scripts also pass, including 26 rendered routes, internal destinations, local asset references, one primary heading/footer, no duplicate header and unchanged homepage/navigation source hashes.

Browser interaction testing is outstanding: the browser tool returned “Browser Use could not read config.” Static rendering and source checks cannot certify viewport overflow, focus behavior, image decoding, animations or browser-console cleanliness. Manually verify desktop/tablet/mobile widths, drawer keyboard operation, category/search back navigation, gallery controls, file replace/remove/reload and material selection while preserving the room image.

## Phase 5 requirements

1. Acquire distinct, rights-cleared production textures and verify scale, seamless repeat, orientation, material compatibility and technical specifications. All current records deliberately have `renderingReady: false`.
2. Implement a Supabase-backed `MaterialRepository` and validate remote records at the boundary. Keep database administration server-side; add authenticated admin policies and storage permissions before material editing/uploads. No admin UI or database credentials are included now.
3. Add explicit upload consent, private object storage, retention/deletion controls, server-side validation and a secure API for provider credentials. Current local selection is not a server upload implementation.
4. Implement real segmentation, surface selection, texture mapping and AI rendering with progress, cancellation, error handling and truthful result provenance. Gate rendering on verified texture readiness.
5. Complete live browser QA and performance checks, then optimize image delivery and split route bundles before deployment.
