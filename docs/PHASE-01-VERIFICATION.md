# Phase 1 verification

Verified on 16 November 2026.

- `npm run build`: PASS. TypeScript strict compilation and Vite production build completed successfully.
- Final output: `dist/index.html`, CSS approximately 27.92 kB, JavaScript approximately 434.21 kB (138.61 kB gzip).
- Desktop homepage: visually reviewed. Fixed 76px icon-only sidebar, no top navigation header.
- Mobile homepage: visually reviewed at 390 × 844; document width did not exceed the viewport.
- All eleven requested route patterns rendered, including all three project detail entries and all three material detail entries.
- Invalid project slug and unknown route: clear not-found view rendered.
- Project filtering: selecting Spatial study returned one concept; opening it displayed The Gathering Space detail.
- Mobile drawer: opens, closes with Escape, and navigates to Contact. Native modal dialog provides focus containment.
- Contact form: populated using test data; downloading produced the explicit status that the brief was downloaded and no enquiry was sent.
- No browser console errors observed during the initial route and form checks.
- A development hot-reload cache issue occurred after a final source edit. The final production build succeeded and its homepage was separately verified at port 5175, including the updated THE VISION caption.
- Reference hero photography loaded successfully. Fonts and images require third-party network availability.

## Limits and deployment

This was browser smoke testing, not a full accessibility audit, real-device test matrix or production performance audit. Reduced-motion handling was implemented but OS preference emulation was not tested.

The application is prepared for Vercel using `vercel.json`; it has not been deployed to Vercel. A private Sites project was registered and its identity retained in `.openai/hosting.json`, but no hosted version was published. Source publication could not be completed: the initial archive location was rejected by the helper, and Git was not available in the environment. The local source and successful production output remain intact.

The saved mobile screenshot is `docs/mobile-preview.png`. Browser access was policy-blocked when resuming the final screenshot handoff, so no additional desktop screenshot was saved in that resumed step.
