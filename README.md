# AXEBOUND 0.3 — The Ashen Meadow

The first actual WebGL2 rendering pass of the playable AXEBOUND combat prototype, with the established 0.2 combat simulation retained. **No external 3D libraries/CDN or textures are required**; the 3D scene is created from hand-built, low-poly meshes using a small standalone WebGL2 renderer (`renderer3d.js`). The game still uses Canvas2D as a transparent overlay for particles, slashes, and floating damage numbers.

## New in 0.3
- Genuine 3D triangle geometry, orthographic isometric projection, per-face shading and pixel-texture-inspired color quantization.
- Low-poly armored hero with animated limbs, shield arm, helmet, weapon and runic details; distinct models for basic undead, shield-bearing undead, mutant, and boss.
- Procedural walk/attack poses, explicit raised-shield **parry pose**, crouched mobile **dodge pose**, ground-level dodge trail, directional telegraph circles, guard visibility.
- Procedural grass blades, flowers, rocky ground, stones, columns, and ruins.
- All 0.2 gameplay: mobile controls, axe throw/recall, hit feedback, wave progression, essence blessings, and miniboss victory.
- Automatic fallback to the original flat Canvas rendering if WebGL2 initialization is unavailable.

## Start
- Open `index.html` from this folder in a desktop browser (keep `renderer3d.js` beside the HTML file).
- On iPhone, upload the entire folder to an HTTPS static host (GitHub Pages, Netlify, etc.), then open Safari in landscape mode. No package installation is needed.
- Google Fonts are optional and require network access; system font fallbacks are provided.

## Controls
**PC:** WASD move; left mouse / J = attack; hold left mouse / K = heavy attack; right mouse / E = axe throw or recall; Q = parry; Space = dodge; Esc = pause.

**iPhone:** landscape; joystick and on-screen STRIKE, AXE, PARRY, DODGE. Hold STRIKE for heavy guard break.

## Scope / known limitations
This is *not* a fully rigged GLB character-animation pipeline. The pose animation is procedural; characters are still geometric, though now genuinely 3D. Lighting is baked through per-face directional shading rather than real-time shadow mapping. There are no authored PBR texture maps or original soundtrack yet. The complete run duration remains inherited from build 0.2 (~4 minutes until the final wave, not yet the target 7–9-minute vertical slice). The game may need optimization depending on your iPhone model. An interactive Safari playthrough has not been verified in this development environment.

The next production step should be importing art-directed low-poly GLB characters, skeletal clips and terrain materials while retaining the proven combat state machine.

## 0.3.1 visibility hotfix
Separate terrain and character depth passes in the WebGL2 renderer so terrain cannot occlude the player and enemies; adjusted depth ordering. Replace both index.html and renderer3d.js when updating the site.
