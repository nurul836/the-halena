# Floating glass navigation — 17 November 2026

Navigation-only update: 68px collapsed / 250px expanded rail, 16px viewport inset, 18px corners, 24px glass blur with opaque fallback, teal active accents and 360ms width transition. The requested eight Lucide icons are used. No top header was introduced.

Expansion is click-controlled. The preference is saved locally when storage is available; unavailable storage is caught. Server and first client render agree on the collapsed state. A layout effect reads the preference before revealing the rail, while the 100px desktop content gutter remains constant. Expansion overlays rather than resizing the page. Clicking or focusing outside, choosing a destination, or pressing Escape collapses it; these changes also save the resulting state. Escape returns focus to the toggle. Collapsed links have hover/focus tooltips and accessible names.

At 768px and below, desktop navigation is hidden and the floating mobile toggle opens a native modal glass drawer. It has touch-sized links, initial close-button focus, native focus containment, Escape/backdrop/route dismissal, body-scroll locking and restored trigger focus. Resizing to desktop closes the mobile dialog. Short desktop viewports allow the navigation list to scroll; tooltips are suppressed in that constrained list to avoid clipping. Reduced-motion preferences disable the added transitions.

Changed: src/components/navigation.tsx, src/styles/navigation.css, src/main.tsx (stylesheet import), scripts/verify-phase7.mjs (sidebar class assertion), this report. No page/editor/backend implementation changed in this navigation update.

Validation: production build passes, including TypeScript and 39 prerendered routes plus 404. Browser access was attempted against localhost:5173 but failed with “Browser Use could not read config.” Desktop/laptop/tablet/mobile animation, actual focus flow, storage persistence, overlap and horizontal overflow have therefore not been verified in a browser. CSS constraints and event handling were reviewed; this is not a substitute for visual acceptance testing.

No reference image was accessible in the request; styling follows the supplied written specifications.
