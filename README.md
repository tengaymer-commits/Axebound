# AXEBOUND 1.0 — Warden Update (pre-alpha)

Playable self-contained HTML prototype. Upload **index.html** to GitHub Pages. No external libraries or asset servers are required.

## New in 1.0
- Enemy attacks lock direction when their telegraph begins (no unfair tracking).
- Spatial-hash neighboring enemies for more efficient crowd separation.
- Refined Warden armor/helmet, layered panels, distinctive enemy silhouettes and axe blade.
- Revised procedural attack poses and leg lifts; shrine stones and an arena ring.
- Narrowed dodge immunity to its timed invulnerability rather than the entire animation.
- Prevented stale death callbacks from ending a restarted run.
- Improved contrast and scene atmosphere.

## Controls
Touch: left joystick, Strike (hold for Break), Axe, Parry, Dodge.
Desktop: WASD, left mouse attack, right mouse axe, Q parry, Space dodge.
Debug: ?debug=1. Safe graphics: ?actors=2d or ?renderer=2d. Quality: ?quality=low.

## Scope and limitations
Still *procedural 3D geometry*, not GLB/rigged animation assets. WebGL2 actors may require fallback on some iPhones. Automated Chromium tests are not physical iPhone tests.
