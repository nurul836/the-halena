# Material readiness audit — 16 November 2026

12 total; 9 texture-backed materials passed rendering tests; 3 reference-only; 0 broken/missing referenced files; 3 absent approved render maps; 3 unresolved rendering licenses. Browser readiness is additionally gated on successful HTTP fetch and image decode, never merely the catalog eligibility flag.

## Per-material inventory

### HLM-001 — Noir Vein — Marble Study

- Reference image: `/images/marble.webp`
- Catalog preview: `/images/render-textures/noir-marble.jpg`
- Render texture: `/images/render-textures/noir-marble.jpg`
- Supported conceptual surfaces: Wall, Countertop
- License: CC0 — Poly Haven; derivatives documented in LICENSE.md
- Evidence: https://polyhaven.com/license
- Test status: PASS: decode, compatible selection, render, switch, PNG export/reopen (47615 visibly changed pixels)

### HLM-002 — Dune Strata — Stone Study

- Reference image: `/images/stone.webp`
- Catalog preview: `/images/stone.webp`
- Render texture: Not supplied
- Supported conceptual surfaces: Wall, Floor
- License: Unresolved rendering rights
- Evidence: Not documented
- Test status: Reference Only

### HLM-003 — Warm Grain — Wood Study

- Reference image: `/images/wood.webp`
- Catalog preview: `/images/render-textures/wood_floor.jpg`
- Render texture: `/images/render-textures/wood_floor.jpg`
- Supported conceptual surfaces: Joinery, Wall
- License: CC0 — Poly Haven; derivatives documented in LICENSE.md
- Evidence: https://polyhaven.com/license
- Test status: PASS: decode, compatible selection, render, switch, PNG export/reopen (47623 visibly changed pixels)

### HLM-004 — Timber Rhythm — Panel Study

- Reference image: `/images/wood.webp`
- Catalog preview: `/images/render-textures/wood_floor.jpg`
- Render texture: `/images/render-textures/wood_floor.jpg`
- Supported conceptual surfaces: Wall
- License: CC0 — Poly Haven; derivatives documented in LICENSE.md
- Evidence: https://polyhaven.com/license
- Test status: PASS: decode, compatible selection, render, switch, PNG export/reopen (47623 visibly changed pixels)

### HLM-005 — Mineral Print — Wallpaper Study

- Reference image: `/images/stone.webp`
- Catalog preview: `/images/render-textures/mineral-print.jpg`
- Render texture: `/images/render-textures/mineral-print.jpg`
- Supported conceptual surfaces: Wall
- License: CC0 — Poly Haven; derivatives documented in LICENSE.md
- Evidence: https://polyhaven.com/license
- Test status: PASS: decode, compatible selection, render, switch, PNG export/reopen (47665 visibly changed pixels)

### HLM-006 — Vein Composition — Tile Study

- Reference image: `/images/marble.webp`
- Catalog preview: `/images/render-textures/marble-tiles.jpg`
- Render texture: `/images/render-textures/marble-tiles.jpg`
- Supported conceptual surfaces: Wall, Floor
- License: CC0 — Poly Haven; derivatives documented in LICENSE.md
- Evidence: https://polyhaven.com/license
- Test status: PASS: decode, compatible selection, render, switch, PNG export/reopen (47664 visibly changed pixels)

### HLM-007 — Grounded Grain — Floor Study

- Reference image: `/images/wood.webp`
- Catalog preview: `/images/render-textures/wood_floor.jpg`
- Render texture: `/images/render-textures/wood_floor.jpg`
- Supported conceptual surfaces: Floor
- License: CC0 — Poly Haven; derivatives documented in LICENSE.md
- Evidence: https://polyhaven.com/license
- Test status: PASS: decode, compatible selection, render, switch, PNG export/reopen (78164 visibly changed pixels)

### HLM-008 — Veiled Earth — Finish Study

- Reference image: `/images/finish.webp`
- Catalog preview: `/images/finish.webp`
- Render texture: Not supplied
- Supported conceptual surfaces: Wall, Joinery
- License: Unresolved rendering rights
- Evidence: Not documented
- Test status: Reference Only

### HLM-009 — Sculpted Strata — Texture Study

- Reference image: `/images/stone.webp`
- Catalog preview: `/images/stone.webp`
- Render texture: Not supplied
- Supported conceptual surfaces: Wall
- License: Unresolved rendering rights
- Evidence: Not documented
- Test status: Reference Only

### HLM-010 — Satin Bronze — Metal Study

- Reference image: `/images/textures/metal-study.svg`
- Catalog preview: `/images/render-textures/satin-bronze.jpg`
- Render texture: `/images/render-textures/satin-bronze.jpg`
- Supported conceptual surfaces: Joinery, Wall
- License: Original THE HALENA procedural artwork — authorized project use
- Evidence: Original project SVG: /images/textures/metal-study.svg
- Test status: PASS: decode, compatible selection, render, switch, PNG export/reopen (47637 visibly changed pixels)

### HLM-011 — Ivory Marble — Texture Study

- Reference image: `/images/render-textures/white_marble.jpg`
- Catalog preview: `/images/render-textures/white_marble.jpg`
- Render texture: `/images/render-textures/white_marble.jpg`
- Supported conceptual surfaces: Wall, Floor
- License: CC0 — Poly Haven
- Evidence: https://polyhaven.com/license
- Test status: PASS: decode, compatible selection, render, switch, PNG export/reopen (47665 visibly changed pixels)

### HLM-012 — Oak Rhythm — Panel Texture

- Reference image: `/images/render-textures/wood_floor.jpg`
- Catalog preview: `/images/render-textures/wood_floor.jpg`
- Render texture: `/images/render-textures/wood_floor.jpg`
- Supported conceptual surfaces: Wall, Floor
- License: CC0 — Poly Haven
- Evidence: https://polyhaven.com/license
- Test status: PASS: decode, compatible selection, render, switch, PNG export/reopen (47623 visibly changed pixels)

## Implementation

The original bronze SVG has been rasterized to an optimized 2048px JPEG with mirrored repeat edges. It retains the existing bronze palette and brushed illustration. The eight existing CC0-based studies remain in place. Poly Haven's asset license was checked at https://polyhaven.com/license; it permits reuse and redistribution under CC0. The original project bronze artwork is not claimed to be CC0. No unverified reference photograph was copied into a rendering texture.

Reference image, render map, rights status/evidence, optional physical dimensions, repeat and orientation are separate catalog fields. Physical dimensions remain unspecified. Eligibility is checked before loading; the catalog's Ready to Preview label requires a successful local fetch and decode. Loading and failed states stay explicitly qualified. Both the catalog and studio sort loaded materials first and offer Show Preview-Ready Materials Only. Reference cards are visually distinguished; unavailable selections offer compatible loaded alternatives. One failed texture does not disable other cards.

Existing four-corner selection, perspective mapping, scale, rotation, position, lighting blend, opacity and brightness remain intact. Renderer tests exercise controls and preserve the photo outside the selected polygon. No paid API, backend or runtime server rendering was added. All try-on rendering remains browser Canvas2D. Static production prerendering remains the existing build process.

## Verification

- npm run test:materials: all 9 eligible materials decoded, applied to a valid compatible surface on the actual bedroom photograph, visibly rendered, switched to another material without changing the surface, exported to PNG and reopened with exact pixel comparison.
- Phase 4 catalog/routes and Phase 5 renderer tests passed.
- npm run test:tryon passed, including wood-to-marble changes, controls, clipping and export.
- npm run build passed with frontend/backend TypeScript checks and 39 routes plus 404.
- Browser acceptance attempted: Browser Use could not read config. Actual browser clicks, network MIME delivery, mobile interactions and downloaded-file handling remain unverified. Native Canvas export tests are not represented as browser tests.

Per-material PNG evidence and machine-readable inventory: outputs/material-readiness/.

## Assets still needed

- HLM-002 Dune Strata: sandy layered-stone diffuse map with explicit reuse/redistribution permission.
- HLM-008 Veiled Earth: grey/white/brown veined decorative-finish map with equivalent permission.
- HLM-009 Sculpted Strata: linear mineral/strata map retaining that study's identity, with equivalent permission.

For each, supply the original texture, author/source and license evidence. Seamless maps are preferred for repeated surfaces; any physical dimensions must come from verified source data. Unverified colour calibration and manufacturer specifications are not required for an honestly labelled conceptual preview and are not invented.

## Changed files

src/catalog/{types,sampleMaterials,CatalogProvider,readiness}.ts(x); src/components/catalog.tsx; src/pages/{MaterialPages,MaterialStudio}.tsx; src/studio/application.ts; src/styles/{materials,studio}.css; public/images/render-textures/{satin-bronze.jpg,LICENSE.md}; scripts/{prepare-tryon-textures,verify-material-readiness,verify-phase4,verify-phase5,verify-tryon-repair}.mjs; package.json; README.md; this report.
