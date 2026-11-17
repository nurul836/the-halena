# Interactive Material Try-On repair — 16 November 2026

## Result and acceptance boundary

Implementation and automated rendering checks pass. Full browser acceptance remains outstanding: Browser Use returned `Browser Use could not read config`. Browser upload, touch/drag interactions, console output and the browser download action have **not** been verified. This is not a claim that the required browser acceptance test is complete.

## Verified causes and repairs

- The catalog previously provided usable rendering textures for only HLM-011 and HLM-012. In particular, the incoming HLM-003 selection was reference-only. Eight studies now reference local 2048px photographic diffuse maps or documented derivatives.
- Readiness labels relied on catalog metadata rather than successful image loading. Loading now validates the local path, response status, image MIME type, byte size, encoded dimensions and decoded image; failures remain unavailable and can be retried.
- Application lacked clear surface compatibility and prerequisite feedback. Shared application checks now explain missing room/selection/texture, drawing state and incompatible surfaces. Selecting a supported material applies it to the existing compatible selection; pending loads are not labelled applied.
- Material browsing was separated from the preview. It now sits directly below the preview, with wall/floor selection above and adjustment controls visible by default.
- Rendering now offers approximate source-lighting preservation and accounts for surface aspect ratio. Export is blocked while required textures or the composed preview are unavailable.

## Material availability

| ID | Preview source / role |
| --- | --- |
| HLM-001 | Darkened marble derivative |
| HLM-003 | Wood diffuse map |
| HLM-004 | Shared wood map, panel study |
| HLM-005 | Tinted mineral-print derivative, wallpaper concept |
| HLM-006 | Marble with grout grid, tile concept |
| HLM-007 | Shared wood map, flooring study |
| HLM-011 | Original white marble diffuse map |
| HLM-012 | Original wood floor diffuse map |

HLM-002, HLM-008, HLM-009 and HLM-010 remain reference-only until appropriate approved texture assets are supplied. Shared maps and illustrative derivatives are disclosed in catalog descriptions and the texture LICENSE.md; they are not represented as supplier-accurate samples.

## Tests actually run

- `npm run build`: PASS, frontend/backend TypeScript, Vite build, 39 prerendered routes and 404. Production site URL remains unset, so generated pages remain noindex as designed.
- `npm test`: PASS after the initial repair. After the final rendering changes, the affected Phase 5 tests and `npm run test:tryon` were rerun and passed.
- Actual bedroom photograph, 1600 × 1067: production renderer applied wood to a wall quadrilateral, changed to marble, adjusted scale and exported PNG. Each PNG was reopened and compared with the composed pixels. Final output changed 47,664 pixels, with **zero changes outside the selected surface**.
- Additional renderer/model checks: perspective mapping, texture controls, mask clipping, compatible surfaces, history/reset and coordinate invariance at desktop/tablet/mobile widths. These are automated geometry checks, not device interaction tests.
- Failure checks: missing texture, HTML response and invalid image data rejected. All eight catalog entries resolve to real local 2048 × 2048 assets.
- Direct local HTTP checks were attempted but failed due to connection errors, including timeout after Vite reported ready. Actual served MIME/CORS behaviour is therefore unverified; same-origin path constraints and mocked MIME rejection are tested.

Artifacts: `outputs/tryon-repair/bedroom-wood.png`, `bedroom-marble.png`, `bedroom-marble-scaled-export.png`, and `results.json`. These are local QA outputs, not browser download evidence.

## Files changed

- `src/pages/MaterialStudio.tsx`: selection/application flow, truthful load states, catalog placement, controls and export guards.
- `src/studio/application.ts` (new): application prerequisites, compatibility and material settings.
- `src/studio/images.ts`: texture fetch/decode validation and cleanup.
- `src/studio/model.ts`, `src/studio/renderer.ts`: lighting blend and aspect-aware texture mapping.
- `src/catalog/types.ts`, `src/catalog/sampleMaterials.ts`: preview metadata and texture-backed studies.
- `src/styles/studio.css`: workflow, material browser and touch sizing.
- `public/images/render-textures/{noir-marble,mineral-print,marble-tiles}.jpg` (new), `LICENSE.md`: texture assets and provenance.
- `scripts/prepare-tryon-textures.mjs` (new): reproducible derivatives.
- `scripts/verify-tryon-repair.mjs` (new), `verify-phase4.mjs`, `verify-phase5.mjs`: repair regression coverage and updated asset expectations.
- `package.json`, `README.md`, this report: test command and current availability documentation.

## Remaining limits and acceptance checklist

Automatic detection remains disabled because no real segmentation provider is configured. Manual polygon and quad selection remains the supported path. Lighting blending is an approximation; furniture/artwork must be excluded manually and there is no automatic occlusion or physically accurate relighting.

Once browser access is restored:

1. Upload the bedroom photograph and draw/edit a wall quad on desktop and mobile.
2. Select HLM-004, then HLM-011 without redrawing; confirm visible replacement.
3. Adjust scale, rotation, brightness, opacity and position; check undo/redo/reset.
4. Export through the browser, reopen the downloaded PNG and compare it with the preview.
5. Check failed texture feedback, all supported categories, browser console, network MIME responses and mobile pointer behaviour.

No existing business pages, branding, AI provider or backend integration were redesigned or replaced for this repair.
