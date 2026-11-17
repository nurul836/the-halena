# Phase 5 — Local manual material try-on

Implemented at `/ai-studio`. Phase 6 has not been started. Existing homepage, business pages, contact and icon/mobile navigation sources remain unchanged (verified by hashes and regression checks).

## What works

- File picker, drag/drop and mobile file selection for JPG, PNG and WebP. Validation checks extension, MIME, signatures and encoded dimensions before allocating an image bitmap, then checks decoded dimensions again. Limits: 10 MB, 16 megapixels, 8,000 pixels per side, minimum 32 × 32 pixels. Corrupt image decoding reports an error.
- Browser image decoding requests EXIF orientation through `createImageBitmap(..., { imageOrientation: 'from-image' })`. The oriented bitmap's dimensions are retained for PNG export; the editor uses an aspect-correct reduced preview with a maximum side of 1,600 pixels.
- Up to six independent wall/floor surfaces, each with 3–24 polygon points, an active-surface selector, editable control points, reset/cancel/remove controls and visible outlines. Normalized coordinates remain aligned across display sizes. Self-intersections, collapsed shapes and invalid coordinates are rejected. An editable rectangle and arrow-key corner controls provide a keyboard alternative to tracing.
- Catalog selection uses the existing provider/repository and stable IDs. Detail-page links carry `?material=ID`. The bottom collection has search and prioritizes preview-ready textures. Selecting a usable texture updates the active surface; reference-only samples cannot be applied and do not erase an already applied texture.
- Texture scale, rotation, X/Y position, opacity, brightness and normal/multiply/soft-light blending. Each surface retains its own material/settings.
- Undo/redo stores real designs (up to 60 history entries). Drag/slider previews commit as a single operation. Reset Design is undoable. Replacing/removing the room clears the coordinate space and history.
- PNG export reruns the composition at the room bitmap's original dimensions. Selection outlines and corner controls are UI overlays and never enter the exported image. Export is disabled until at least one valid, visible texture application exists.
- Local-only processing. No room file, image pixels or photo metadata is sent to an API. Texture maps are served from this site's own assets. Export object URLs are revoked; image bitmaps are closed on replacement/unmount. Photos are held in memory by the existing provider; design edits are scoped to the studio route and cleared when leaving it. No storage persistence, fake AI, automatic segmentation or comparison slider was added.

## Rendering and approximations

`src/studio/renderer.ts` uses the same Canvas2D compositor for preview and export. It draws the source image first, creates a transformed repeating texture tile, maps it to the selected surface and composites with the chosen opacity/blend.

Convex quadrilaterals use a unit-square homography. A projective grid is rasterized as affine triangles (18 × 18 cells for previews, 32 × 32 for exports). Slightly overlapping triangles on an opaque intermediate layer avoid mesh cracks. The outer polygon clip bounds every application.

Other simple polygons, including concave polygons, use a documented flat bounding-box texture approximation clipped to the polygon. They do not infer perspective. Texture scale is relative rather than a measured installation size. Color-map blending does not recover lighting, reflections, depth, shadows, physical roughness or foreground-object masks. Trace around foreground objects or avoid covering them; no automatic occlusion handling is claimed.

## Preview-ready textures

The original ten reference-only samples remain unchanged and disabled for rendering. Two new entries extend the catalog to twelve:

| Stable ID | Catalog study | Asset |
| --- | --- | --- |
| HLM-011 | Ivory Marble — Texture Study | Poly Haven White Marble, 2K diffuse JPEG |
| HLM-012 | Oak Rhythm — Panel Texture | Poly Haven Wood Floor, 2K diffuse JPEG, used as a wall-panel design direction |

Sources: https://polyhaven.com/a/white_marble and https://polyhaven.com/a/wood_floor. Assets are CC0: https://polyhaven.com/license. Attribution and interpretation notes are also stored in `public/images/render-textures/LICENSE.md`.

`renderingReady` here means suitable for this local manual color-map compositor, not verified manufacturer data or a calibrated physically based material. Both assets repeat; physical dimensions remain unspecified. No manufacturer, price, product performance or installation specification was invented.

## Files

- `src/pages/MaterialStudio.tsx`: upload, controls, pointer/keyboard editing, catalog and export lifecycle.
- `src/studio/model.ts`: normalized geometry, polygon validation, homography and bounded history operations.
- `src/studio/useDesignHistory.ts`: React history with transient edit transactions.
- `src/studio/renderer.ts`: shared actual composition renderer.
- `src/studio/images.ts`: encoded dimension parsing, decoding and local-only texture loading.
- `src/styles/studio.css`: desktop canvas/controls layout, mobile collapsible controls and material rail.
- `src/catalog/types.ts`, `sampleMaterials.ts`: texture metadata and two new stable entries.
- `src/pages/MaterialPages.tsx`: repeat-readiness metadata now reflects each asset.
- `src/App.tsx`: truthful studio SEO description.
- `scripts/verify-phase5.mjs`: real Canvas2D/pixel/export tests. `@napi-rs/canvas` is a development-only test dependency, not shipped to clients.
- `scripts/verify-phase4.mjs`: preserved catalog checks updated for the expanded twelve-entry catalog and live studio.

## Verification results

`npm run build` passes. Vite emits its existing single-bundle size advisory (approximately 527 kB before gzip). No TypeScript or build errors remain.

Phase 2, Phase 3 and updated Phase 4 regression suites pass, including preserved page/navigation hashes, internal links, all twelve material detail/selected-studio routes, filters, assets and missing-ID handling.

`node scripts/verify-phase5.mjs` passes using a real 1000 × 668 room photograph and the actual local diffuse maps through the application's renderer:

1. Decode/inspect image dimensions and reject oversized headers.
2. Validate a wall quadrilateral and its projected corners; reject crossed/collapsed shapes.
3. Verify identical normalized coordinate mapping at desktop and mobile viewport sizes.
4. Apply wood: 111,421 pixels visibly changed, zero changed pixels outside the selected wall's bounds.
5. Switch to marble; independently verify scale, rotation, positioning, opacity, brightness and blending change output pixels.
6. Test arbitrary polygon approximation, unavailable textures and zero-opacity behavior.
7. Test undo/redo, history branching and the history cap.
8. Encode and decode the exported PNG: original dimensions preserved, pixels match the final composition and differ from the original photograph.

Artifacts in `outputs/phase5/`: `wood-wall.png`, `marble-wall.png`, `results.json`. Both rendered images were visually inspected.

**Verification limit:** Browser inventory works, but claiming the preview tab fails with “Browser Use could not read config.” No alternate browser automation was used. Real browser upload/drop, pointer capture, mobile gestures, focus behavior, download dispatch, EXIF orientation, responsive overflow and browser-console checks remain unverified. Native canvas/pure-coordinate tests are not substitutes for those interaction checks.

## What needs AI services later

Automatic segmentation, inferred room geometry, object occlusion, relighting and generative interior design need real models/services and a separate explicit privacy/consent flow. The current manual compositor needs no AI service, API secret or backend. Phase 6 should also address design persistence if desired, live device QA, route bundle splitting and broader measured texture coverage.
