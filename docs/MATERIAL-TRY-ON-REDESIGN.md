# Material Try-On presentation redesign

Scope: `/material-try-on` and its presentation components only. The rendering engine, coordinate mapping, surface gesture logic, history, authentication, navigation, AI generator and backend were not changed.

## Interface

- Compact “See it in your space.” introduction and a large, single-column room canvas.
- Wall/Floor selection and one contextual next-step instruction. Four-corner selection, numbered editable handles and validation retained.
- Upload, replace, remove, reset and download actions; compact Undo/Redo toolbar.
- Advanced Adjustments closed by default. Keyboard rectangle creation and multiple-surface management are available in a separate disclosure.
- Responsive material cards with category/search/ready-only filters. Loaded textures are selectable; incompatible surface materials are disabled. Reference-only materials are separate informational cards with detail links.
- Local processing and privacy messaging, texture-error/retry feedback, reduced-motion support and keyboard focus indicators.

## Source files

- `src/pages/MaterialStudio.tsx`
- `src/studio/MaterialBrowser.tsx` (new presentation component)
- `src/styles/studio.css`

## Tests completed

`npm run build` passed: frontend/backend TypeScript and 40 prerendered routes plus 404.

Real headless Chrome tests used the production build served through Vite preview and the existing bedroom photograph. At **360, 390, 768, 1024 and 1440px**:

- File upload and actual canvas rendering passed.
- Four deliberate corners produced labels 1–4; an additional interaction did not add a fifth point.
- Finish selection succeeded for the valid surface and remained disabled for crossed edges.
- Wood HLM-012 and marble HLM-011 visibly changed canvas pixels; switching materials changed the result.
- Undo/Redo restored the expected rendered pixels; scale adjustment changed the image.
- Browser download produced a PNG at the original photograph dimensions, with pixels different from the original.
- Reset restored the original pixels and disabled download.
- Advanced settings expanded; no page-level horizontal overflow was detected.
- Touch input was emulated at 360/390/768px; mouse input was used at 1024/1440px.

Additional Chrome checks passed: category/search/ready-only filtering; material-ID URL selection; editable rectangle application; corner dragging and arrow-key editing without additional points; remove/replace photo clearing selection. Aborted texture requests produced a visible error, retry action and no usable preview cards. No page JavaScript errors occurred during the main acceptance run.

`npm run test:tryon` passed the existing native-canvas bedroom, perspective mapping, compatible surfaces, wood/marble/scale, undo/redo/reset, missing asset and exact PNG pixel tests. That older script contains a historical browser-unavailable note; the separate real Chrome tests above supersede it for this redesign.

Local artifacts: `outputs/tryon-redesign/results.json`, `workspace-{width}.png`, `design-{width}.png`. Browser scripts: `outputs/test-tryon-redesign.mjs` and `outputs/test-tryon-controls.mjs`; isolated Playwright Core tooling lives under `outputs/browser-tools`, with no changes to application package dependencies.

## Limits

Chrome viewport/touch emulation is not testing on physical phones. Safari and Firefox were not tested. This remains manual visualization with illustrative scale/colour and no automatic surface detection. Designs remain local and should be downloaded before leaving the workspace. No permanent account storage was added.
