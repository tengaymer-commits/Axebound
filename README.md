# AXEBOUND 0.3.2 — Safari visibility hotfix

This release fixes the missing player/enemies on iPhone by drawing actors in the foreground Canvas2D layer independently of WebGL depth and projection. The WebGL renderer continues to draw the 3D landscape. All gameplay systems from 0.3.1 remain.

## Deploy
Upload **index.html and renderer3d.js** together to your GitHub Pages repository. If cached, reload with `?v=032` appended to the URL.

## Fallback
If WebGL terrain causes trouble, add `?renderer=2d` to the URL. This selects the previous Canvas2D background and also draws actors.

## Important limitation
Characters in this hotfix are 2.5D Canvas2D silhouettes over a WebGL3D world, not rigged 3D models. This is an intentional reliability workaround while the 3D actor pass is investigated.
