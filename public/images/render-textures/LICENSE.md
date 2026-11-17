# Local preview textures

These color maps are from Poly Haven and distributed under CC0:
https://polyhaven.com/license

- `wood_floor.jpg`: Wood Floor, 2K diffuse map. Source: https://polyhaven.com/a/wood_floor
- `white_marble.jpg`: White Marble, 2K diffuse map. Source: https://polyhaven.com/a/white_marble

Downloaded via Poly Haven's public asset API on 2026-11-16. Assets are hosted locally; no private room photo is sent to Poly Haven.

The wood floor map is used as a conceptual wall-panel direction, not a manufactured panel specification. The editor uses color maps only, without normal/roughness/displacement maps. Physical product specifications and real-world scale remain unverified.

## Catalog derivatives

`noir-marble.jpg`, `mineral-print.jpg` and `marble-tiles.jpg` are reproducible
THE HALENA derivatives of the CC0 `white_marble.jpg` diffuse map: respectively
a grayscale negative/tonal adjustment, a warm print tint, and an added grout grid.
Run `node scripts/prepare-tryon-textures.mjs` to regenerate them. All are 2048px
JPEG colour maps. They depict illustrative design directions, not supplier products.
HLM-003, HLM-004 and HLM-007 intentionally share the licensed wood-plank map for
wood, conceptual wall panels and flooring. No room photograph is used as a map.

## Original bronze study

`satin-bronze.jpg` is a 2048px JPEG derived only from the original project artwork
`public/images/textures/metal-study.svg`, an SVG of gradients and line patterns.
It uses four mirrored quadrants to close repeat boundaries. Authorized for use
in this project and its exported visualizations; this does not assert a CC0
dedication or ownership of any external artwork. It is an illustration, not a
photographic metal map or a physically calibrated reflective material.
Regenerate using `node scripts/prepare-tryon-textures.mjs`.

The reference photographs for HLM-002, HLM-008 and HLM-009 have no documented
rendering permission in this repository. They have not been transformed or used
as render maps. Supply approved diffuse textures and explicit usage evidence.
