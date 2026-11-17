# Four-corner selection repair

## Root cause

The stage had one `onPointerDown` handler, not separate mouse/click/touch listeners. It immediately appended every primary-button event, accepted repeated coordinates and allowed 24 points. Overlapping draft markers could hide previous numbers, producing apparent numbering gaps. The array itself was already numbered sequentially with `index + 1`. No browser reproduction was available to establish which specific gestures produced the reported screenshot.

The handler also used a closure-based array update. Finish was enabled based only on three points, even when polygon validation would reject them. These verified code defects are repaired.

## Changes

- `src/studio/selection.ts`: a single primary pointer gesture, committed on release; repeated down/up events, secondary contacts, cancelled gestures and drags do not add corners. Duplicate coordinates are rejected and the default selection caps at four corners.
- `src/pages/MaterialStudio.tsx`: functional point updates avoid stale arrays. Starting/resetting/cancelling clears the gesture and points. Four points automatically trigger validation feedback; Finish is enabled only for a valid quadrilateral. Numbering remains 1–4. Existing editable handles remain; their pointer events cannot begin a selection gesture. Drag completion validates the latest ref-held geometry instead of potentially stale render state.
- `src/studio/model.ts`: explicitly reject duplicate vertices anywhere in a polygon, retaining orientation-independent boundary validation.
- `scripts/verify-selection.mjs`: regression tests for mouse/touch/pen gesture sequences, duplicate events/positions, multitouch, four-point limit, reset/numbering, drag cancellation, clockwise/counterclockwise acceptance, crossings and image-relative coordinates.

No unrelated pages, AI Generator, navigation or branding were modified.

## Verification

`node scripts/verify-selection.mjs` passed. The actual bedroom photo renderer test (`npm run test:tryon`) passed wood → marble → scale → PNG export/reopen, with 47,664 changed pixels and zero outside the wall selection. This verifies the generated PNG contents, not the browser download action.

Browser testing was attempted against the current localhost:5174 tab. Browser Use failed with `Browser Use could not read config`. Browser pointer/touch behaviour, clicking Finish, and downloading through the browser remain unverified. The automated tests must not be treated as browser acceptance results.
