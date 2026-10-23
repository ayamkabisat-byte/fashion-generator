# Fashion Design Lab Ultimate

A React/Vite prompt-design web app for fashion products, footwear, and accessories. The app keeps the user-facing workflow direct—brand/collab, base shape, material, fit, visible structural modifiers, aesthetic, color and layout—while richer brand/design logic stays inside the engine.

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
7. Adjust fit/structure, obvious structural add-ons, and an optional footwear sole modifier.
8. Apply aesthetic, pattern, and intelligent palette logic.
9. Choose layout, model, output mode, and target generator.
10. Generate a canonical prompt with a **Product Consistency Lock**.

## Footwear structure

Footwear intentionally avoids a long anatomy checklist. The selected named silhouette or uploaded product image remains the structural base.

The UI exposes only:

- **Fit / Structure**
- up to **two obvious structural add-ons** such as ankle straps, zip shrouds, external cages or utility loops
- **Sole Modifier**, because a sole change can visibly alter the entire footwear silhouette

Leaving Sole Modifier on **Preserve base sole** keeps the original sole profile.

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
- footwear randomization changes only the sole and/or a small number of obvious structural add-ons
- the engine no longer randomizes toe, upper, lacing, midsole, heel and distress as separate user-facing anatomy controls
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

### Uploaded Product Base

A real image can be selected locally with **Use Uploaded Product as Base**. When enabled, the uploaded product becomes the structural authority instead of a database silhouette.

This is intended for:

- local footwear brands
- niche or obscure products
- custom products
- products whose shape the target image model may not recognize reliably by name

The generated prompt tells the target model to preserve the uploaded product's overall silhouette, proportions, major panel geometry, sole/base profile, closure and functional shape while applying the selected brand, collaboration, materials, colors and graphics as redesign layers.

The local image is used as an in-app reference preview only. Attach the same image again in the target image generator together with the generated prompt.

### Face Reference

**External Face Reference** remains available for lookbook/model shots. Attach the matching person image in the downstream image generator.

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
