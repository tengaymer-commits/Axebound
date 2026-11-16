# AXEBOUND 0.9 — Combat Director & Game Feel

One-file HTML build for GitHub Pages: replace the repository `index.html`.

## Changes from 0.8
- Attack slot coordinator now counts active telegraphs once per simulation step instead of repeating a full enemy scan for every actor.
- Enemy attack damage checks facing at the actual contact moment, so dodging outside the telegraphed sector is rewarded.
- Perfect parry unlocks a 1.15-second counter opportunity: the next light attack is faster and stronger, with a distinct golden ground cue.
- Attacking arms get anticipation and follow-through procedural poses.
- Clear contextual PARRY, DODGE, COUNTER READY prompt when a nearby threat is actively preparing an attack.
- Reduced far-off terrain tiling while retaining the full playable arena.
- Fixed a death/restart timeout race and suppressed upgrade overlay after victory.
- Minor mobile control contrast and safe-area styling.

## Limitations and validation
- This is still procedurally generated low-poly mesh rendering with runtime poses, not rigged animation / imported GLB models.
- 3D compatibility needs to be verified on real iPhone Safari.
- Diagnostic parameters: `?debug=1`, `?actors=2d`, `?renderer=2d`, `?quality=low`.
- This version is a substantial mechanics/stability batch, not the full character art overhaul.
