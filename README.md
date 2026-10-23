# Fashion Design Lab Ultimate

A React/Vite prompt-design web app for fashion products, footwear, and accessories. The app combines archival product silhouettes, brand design DNA, collaboration concepts, materials, aesthetics, color logic, product anatomy, and presentation rules into a canonical design brief before formatting it for an image generator.

## Why this version exists

An earlier refactor accidentally reduced the iconic product database from **411 named entries to 33**. The Ultimate branch restores the full original catalog while retaining the newer UI features and adds regression tests so the catalog cannot silently collapse again.

Current protected catalog:

- **231 footwear silhouettes**
- **180 accessory silhouettes**
- **411 iconic entries total**
- Nike restored from 3 back to 16 archived silhouettes
- full Brand Color DNA restored
- full Artist Color DNA restored
- full IP Character Color DNA restored

## Core workflow

1. Choose **Apparel / Footwear / Accessories**.
2. Choose the main brand and optional co-brand.
3. Add an Artist or IP collaboration.
4. Control **collab influence** (20/40/60/80%) and its scope: color, motif, material, construction, typography, branding.
5. Choose a named base silhouette.
6. Choose up to three compatible materials.
7. Adjust fit/structure and optional footwear anatomy.
8. Apply aesthetic, pattern, and intelligent palette logic.
9. Choose layout, model, output mode, and target generator.
10. Generate a canonical prompt with a **Product Consistency Lock**.

## Footwear anatomy

Footwear can override individual layers without discarding the selected base silhouette:

- toe
- upper construction
- lacing / closure
- midsole
- outsole
- heel
- distress / finish

Leaving an option at **Preserve silhouette** keeps the named model authoritative.

## Collaboration engine

Collaboration is no longer a single adjective injection. The generator separates:

- influence strength
- color
- motif / graphics
- materials
- construction
- typography
- branding

This makes concepts such as “Air Force 1 × Pharrell” controllable: the AF1 can stay structurally authoritative while only selected Pharrell/Human Race cues are injected.


## Smart Random + parameter locks

**Smart Randomize** is compatibility-aware rather than pure chaos. It randomizes design parameters in dependency order and then resolves known conflicts.

Key behavior:

- the 3-panel triptych remains the dominant random layout; diptych/product-only and vertical layouts still appear
- a footwear randomization normally changes only 0–2 anatomy layers; 3-layer mutations are intentionally rare
- component choices avoid duplicating explicit outsole, platform, or zipper anatomy
- collab colors are used only when the **Color** collab scope is active
- brand, collaboration, aesthetic, and IP color DNA remain preferred over arbitrary palettes
- backgrounds are biased toward the selected aesthetic instead of being fully unrelated
- locked materials constrain silhouette selection so the selected product remains materially plausible

The **Smart Random Locks** bar can lock:

- Product Type
- Brand + Category
- Co-Brand
- Collaboration
- Base Silhouette
- Materials
- Fit + Structure
- Aesthetic
- Design Approach
- Pattern
- Colors
- Model
- Background
- 2/3 Panel Layout

Locks affect **Smart Randomize only**. Manual controls remain editable.

Some locks imply dependency locks during randomization. For example, locking a Base Silhouette also pins Product Type and Brand + Category; locking Fit + Structure or Materials pins Product Type. These derived locks are reported by the Smart Random resolver in the UI.

## Output modes

### Composite Sheet
Creates one structured diptych/triptych prompt and explicitly locks product identity across panels.

### Panel Prompt Pack
Creates four independent single-view prompts that share the same canonical design:

1. hero / lateral
2. on-body or on-foot
3. structural detail / outsole
4. top or three-quarter

This is useful when a model has trouble keeping one design consistent inside a single collage.

## Output targets

- Universal
- Midjourney
- Gemini / Nano Banana
- Flux

Universal output contains no model-specific flags. Midjourney output adds aspect-ratio and negative syntax but intentionally does **not** hardcode a model version.

## Reference behavior

The web app does not pretend to upload or bind an image when it cannot. The two reference toggles only add downstream instructions:

- **External Design Ref**
- **External Face Ref**

Attach the corresponding image in the image generator you actually use.

## Project structure

```text
src/
  App.jsx
  data/
    fashionData.js     # restored product/style/color catalog
    designDNA.js       # brand design DNA + footwear options
  engine/
    designEngine.js    # canonical spec, validation, prompt adapters
tests/
  catalog.test.js
  engine.test.js
.github/workflows/
  ci.yml
```

## Validation

Run the full check locally:

```bash
npm ci
npm run check
```

The check runs:

```text
ESLint
→ Node regression tests
→ Vite production build
```

GitHub Actions runs the same validation on pushes and pull requests.

## Development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```
