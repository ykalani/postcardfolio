# National Park Landscape Playbook

A shared implementation guide for the portfolio's six landscape destinations. Read this and the relevant scene brief before implementation. This records the actual implementation, the user’s feedback, the failed approaches, and the acceptance criteria—not just an aesthetic prompt.

## Current art direction: visible brushwork

The user rejected the previous photo-like appearance. All six active scenes now use `scenes/brush-painting.js`, including Yosemite's local authoring path. The reference is reduced to a coarse color study: 5-pixel cells, discrete pigment values, broad irregular flat-brush marks, and selective smaller accents. No dense per-pixel refinement pass may cover those marks. Landmarks remain recognizable, but camera microdetail and smooth photographic shading must not survive as the dominant visual language.

Judge the actual finished painting at normal desktop and mobile size. Visible paint planes, broken bristle ends, and simplified colors are required; a blurred photo or subtle grain overlay does not meet this direction. The renderer receives color arrays only and reconstructs the whole painting with Canvas strokes; it never draws a reference photo onto the visible artwork. Rebuild live cutouts from that same painted surface.

Brush mark length, breadth, spacing, and sampling cells are now half of the first expressive edition; the same discrete pigment palette preserves the painted character.

Give every composition deliberate depth: richer, higher-contrast near foliage or rock framing against cooler, quieter distant terrain. Keep material masks tied to the scene rather than adding rectangular color bands. Build motion from the same painted surfaces, anchor attachments and shorelines, and check the requested moving regions separately from the whole canvas. Preserve reduced-motion behavior and static artwork fallbacks.

Active caches are `painting-v5.webp`, `fallback-v5.webp`, and `live-v5.*` for the five shared-renderer scenes. Home uses `yosemite-terrain-brush3.webp`, `yosemite-display-brush3.webp`, and matching `*-brush3` live/foreground atlases. These names replace older photo-like cache versions so existing browser caches cannot conceal the new painting style. No reference-image downloads or brush generation occur during normal visits.

Visible motion must be assessed at normal viewing scale and over short time sequences. Nonzero changed-pixel counts alone do not establish that an effect is readable. Keep moving paint marks comparable in size and palette to the terrain, avoid smooth smoke laid over bristled paint, and exclude cliff/sky pixels from kayak cutouts. Local detail belongs only inside the tower and human silhouettes; keep surrounding foliage, rock, and water at their established stroke scale.

## Portfolio plan and scene briefs

The agreed portfolio has six sections. These are content destinations, not a requirement to stack five full-screen canvases on one page.

| Section | Landscape | Scene brief |
| --- | --- | --- |
| Home | Yosemite | [Yosemite](landscapes/yosemite.md) |
| Experience (`/experiences`) | Hawaiʻi Volcanoes | [Hawaiʻi Volcanoes](landscapes/hawaii-volcanoes.md) |
| Projects (`/projects`) | Great Sand Dunes | [Great Sand Dunes](landscapes/great-sand-dunes.md) |
| Writing | Banff | [Banff](landscapes/banff.md) |
| Tech Blog | Beaumont Tower | [Beaumont](landscapes/beaumont.md) |
| About | Pictured Rocks arch reference | [About arch scene](landscapes/sleeping-bear.md) |

Keep shared rendering, accessibility, navigation, QA, and deployment instructions here. Keep viewpoint, palette, movement, mobile framing, and asset research in the linked briefs. Later explicit user instructions take precedence; otherwise use this guide for shared rules and the scene brief for art direction.

All six landscapes are implemented as separate buildless pages, with shared paper navigation and a painted cloud curtain. Yosemite remains Home, with the expressive painting and optimized live atlas runtime. The additional scenes use `scenes/scene-painter.js` for seeded multiscale bristles, local edge definition, cache/fallback loading and viewport fitting, plus a scene-specific motion module. Portfolio content is still separate from this landscape implementation; résumé/contact do not need extra landscape destinations.

Each active scene has a photographic guide, a baked original brush painting, and asset credits. The new Banff, About arch, and Beaumont references were supplied by the user; no outside photographer or public-domain license is invented. Historical Sleeping Bear sunset assets retain their original CC BY-SA attribution. Live animation is artistic motion of the documented scene, not live weather or eruption telemetry.

## 1. The job

Build recognizable, detailed, living paintings of national parks for Yash Kalani’s portfolio. The reference is https://ronacher.eu/: inspect the rendered page, preferably with the postcard put away. Study how pigment, atmosphere, and scene-specific motion create a painting that feels alive.

The deliverable is a working browser scene, not a mood board, static illustration, generic mountain wallpaper, or list of recommendations. Finish and visually inspect one new park before repeating the method for the others. Reuse the proven rendering machinery; give each park its own composition, material treatment, and focal movement.

Current site: https://postcardfolio.vercel.app/
Also served through: https://yash.kalani.name/postcardfolio/
Repository: https://github.com/ykalani/postcardfolio

If you have repository access, read the actual current files. This document explains the reasoning; source code remains the authority for exact implementation. Expect local edits from the user or other agents. Inspect `git status` and the diff before editing.

## 2. User decisions to preserve

- Only the landscape is shown on the landing page. The original postcard is stored in `archive/postcard/` and excluded from deployment. Do not restore it unasked.
- The browser tab says **Yash Kalani**.
- The park-name/coordinates slip was removed. Keep it removed.
- The bottom park/time/breeze controls and the heading “POSTCARDS FROM THE OUTSIDE” were removed. Do not bring them back.
- Mobile keeps the 160svh scrollable stage. Yosemite and Olympic open centered; Great Sand Dunes, Hawaiʻi Volcanoes and Sleeping Bear use documented scene-specific initial scroll fractions to keep their focal movement visible. Preserve the Home setting and verify each actual portrait crop.
- The original writing slip evolved, with user authorization, into one small paper navigation strip for home, projects, experience, writing, tech blog, and about. Keep it readable and reachable; do not restore removed park/time/breeze controls. Writing displays the supplied Banff scene; Tech Blog displays Beaumont Tower.
- In Yosemite, bird flight must be **left to right only**, with at least one visible bird for **75% or more of the cycle** when viewing the scene’s sky. Apply the same contract to new scenes that include sky birds; do not force birds into an enclosed forest or volcanic crater. Quantify this rather than claiming it by eye.
- Clouds should visibly travel; very slow, almost imperceptible cloud movement was rejected. Both cloud banks and cloud transitions need visible paint texture.
- Preserve existing motion-preference handling. The user explicitly asked to skip/remove reduced-motion tests. Do not run those tests or add them to the acceptance checklist.
- The old sibling portfolio can supply factual links if needed. Its UI and prose are not design inspiration. This task is about landscapes, not new biography copy.

## 3. What happened, and what to learn from it

### The first procedural prototype

We started with geometric mountain polygons, random texture strokes, repeated procedural pine shapes, and a river. It established the palette and interaction but looked too simple. Adding lots of random marks to a generic silhouette did not produce the reference’s detail.

**Lesson:** structural information matters more than a high stroke count. A national park must be recognizable from its actual landforms, edges, light planes, and vegetation.

### The detailed procedural pass

We added granite fissures, multiple tree depth bands, a waterfall, and bristled strokes. This improved the scene but still looked diagrammatic: straight polygon boundaries, repeated tree geometry, and scattered detail without an intentional hierarchy.

**Lesson:** preserve distinctive geometry and avoid uniform detail density. The focal landmarks need coherent shapes; details should follow their material and orientation.

### The photo-guided painting

The major improvement came from a verified CC0 Yosemite photograph used as a **geometry and color guide**. The visible painting is constructed from original multiscale brush marks. We do not simply draw the photograph as the website’s background.

This preserved real granite strata, tree masses, shadows, and distant formations. The source became a field to sample; the rendering remained a painting.

**Lesson:** do not force a weaker model to invent a geologically convincing landscape from polygons. Give it a good licensed reference and a deterministic painter.

### The animation pass

The user liked the detail but said it did not feel alive. Tiny floating particles, subtle scattered highlights, and nearly invisible motion did not solve that. We made movement belong to identifiable objects: clouds crossing the sky, the real canopy responding to a shared gust, water leaving a fixed lip, and birds travelling coherently.

**Lesson:** animate physical components, not decoration. Four well-directed moving systems beat hundreds of arbitrary specks.

### The foreground failure

A separately drawn procedural pine looked pasted onto the painting. Its trunk, sparse branches, simple shapes, and colors belonged to a different rendering style.

The fix was to lift the existing painted vegetation into masked layers, deepen the near shadows, retain warm needle highlights, and animate those actual painted cutouts.

**Lesson:** the foreground must share the same pigment and shape language as the terrain. Do not graft a generic SVG or procedural Christmas tree onto a textured painting.

### The waterfall failure and fix

A thin white line with descending particles was too small and stringy. Extra filaments alone made it look like hair. A soft blurred plume alone lost the structure of falling water.

The successful treatment combines a fixed bright lip, overlapping translucent washes that open into a wind-blown veil, accelerating short ribbons, broken longitudinal bristles, and chalk-like mist born at the foot of the fall.

**Lesson:** water needs a readable silhouette, interior flow, and an ending. Increase its presence through width, contrast, and layering before scaling it beyond the geography.

### The bird correction

A circling flock reversed direction, and simple full-width passes could leave long empty intervals. The current design uses staggered flocks, all moving east, with resets only after a flock has left the visible area. Occupancy must be checked after actual viewport and skyline clipping.

**Lesson:** a time-based animation is not automatically a good composition. Test whether people can actually see it.

## 4. Start each park with an art brief

Before coding, write a short brief containing:

1. One named park and one coherent viewpoint.
2. Two or three recognizable focal elements.
3. A foreground frame, middle ground, and distant ground.
4. The material palette and dominant stroke directions.
5. Two or three physical sources of movement.
6. How the landmarks survive a portrait crop.

Do not combine landmarks from incompatible viewpoints and call it an accurate scene. If an artistic rearrangement is needed, make it deliberate and avoid misrepresenting the geography. Verify which feature is which: Half Dome and El Capitan are not interchangeable labels.

Use the five linked scene briefs above. Earlier suggestions for Zion, Grand Teton, Glacier, Bryce Canyon, Arches, and Acadia are superseded by this selection. Great Sand Dunes is a daylight scene of dune ridges, the Sangre de Cristo backdrop, and seasonal Medano Creek. Sleeping Bear is a water-led Lake Michigan sunset. Keep these two dune destinations visually distinct.

Pick a real photograph for the chosen viewpoint before deciding exact landmark coordinates. Do not give every park the same clouds, pine tree, waterfall, lake, and pollen.

## 5. Source the geometry responsibly

Find a high-quality image with enough detail in the focal landmarks. Prefer explicit public-domain or CC0 status. NPS pages are useful research sources, but do not assume every image on an NPS page is public domain: individual credits can name outside photographers.

For each asset, record the exact source page, author, license, original download URL, viewpoint, and any crop. If the license is uncertain, choose another image. Store provenance alongside assets.

The Yosemite guide was derived from this CC0 image by EF5:

https://commons.wikimedia.org/wiki/File:%E2%80%9CTunnel_View%E2%80%9D_overlook_showing_famous_rock_formations_in_Yosemite_Valley_03.jpg

License details are in `assets/CREDITS.md`. The full original was used for preparation, then removed from the shipped assets; the browser uses a smaller guide image and a cached painting. Do not duplicate a multi-megabyte original into every scene’s runtime assets unnecessarily.

### Preserve Yosemite when adding a park

Do not overwrite the existing Yosemite guide, cache, credits or default scene. Give each new scene unique assets, for example `assets/great-sand-dunes/guide.jpg`, `assets/great-sand-dunes/painting.webp`, and `assets/great-sand-dunes/CREDITS.md`. Use the scene brief's filename stem for its asset directory. Store its implementation separately or select its configuration without changing the current default experience. Avoid copying one giant renderer five times unchanged, but do not build a generic framework before the second scene proves which code actually needs to be shared.

For each adaptation, explicitly revisit the hardcoded Yosemite assumptions:

- Guide and cached-painting asset URLs.
- `pigment()` material classification and top-connected skyline extraction.
- `foregroundDepth()` masks and source cutout regions.
- `fit()` portrait framing and the actual mobile stage height.
- Landmark positions, waterfall lip/base, and any water reflection boundaries.
- Cloud, foliage, mist and other scene-specific caches.
- Bird altitude, skyline clipping and measured visible duty cycle.
- Public-domain/CC0 provenance for the new guide.

Some current loose leaves originate from actual canopy pixels and follow its wind. Preserve that user-added behavior where appropriate; the warning about arbitrary particles is not an instruction to delete physically grounded leaf motion.

## 6. The rendering pipeline

Use the existing buildless Canvas 2D implementation unless the task genuinely requires something else. No framework, WebGL stack, shader package, or animation library is required for this style.

### Coordinates and fitting

Yosemite uses a 1600 × 1000 logical painting. The visible canvases use viewport dimensions with device pixel ratio capped at 2. A cover transform maps logical coordinates to the stage. The stage can be taller than the mobile viewport; use its actual height, not blindly `innerHeight`.

Store important coordinates in this logical system: skyline, landmark bounds, waterfall lip/base, foreground masks, and bird corridors. Portrait framing is an art decision, not just `background-size: cover`. Keep the main landmark and the physical moving element visible together.

### Reference sampling

Draw the guide into an offscreen canvas and read its pixel data once during preparation. Use it to classify sky, vegetation, rock, water, and other relevant materials. Derive landmark masks where color classification is insufficient.

Do not classify sky using only “blue pixel = sky.” The first version accidentally punched sky-colored holes into shaded granite. Yosemite now determines a top-connected skyline per column. A new park may need a different mask, especially with snow, water, fog, rock openings, or an interior forest scene.

### Pigment and brush marks

Build the painting from broad coats to fine marks. Yosemite’s passes use approximate grid steps 13, 6, and 3.6 logical pixels with progressively smaller brushes. These are starting values, not universal constants.

A useful dry brush is a bundle of 2–4 slightly different bristles. Vary their starting point, length, thickness, bow, opacity, and pigment value. Leave small paper gaps. Keep all random choices seeded while constructing an asset.

Direct the marks by material:

- Granite: vertical or locally curved strata, creases and ledges.
- Sandstone: follow its actual bedding, erosion and light planes.
- Foliage: short irregular clustered marks that preserve tree masses.
- Sky: broad, restrained, slightly diagonal strokes.
- Still water: broken horizontal reflections, interrupted by directional ripples.
- Surf or waterfalls: coherent flow and broken translucent layers.

A grain overlay is only a finishing layer. It cannot replace shape, lighting, or material structure. Preserve enough contrast to separate foreground, middle distance and far distance; do not wash the whole image into equal-value texture.

### Initial coat and runtime assets — current optimized loader

Do not download a reference photo on a normal page visit. It is an **authoring asset**, not runtime content. The initial loader did this and caused a 5–10 second wait. `assets/yosemite-guide.jpg` now stays in the repository for local asset preparation and is explicitly excluded from deployment.

Normal loading is now:

1. Preload `assets/yosemite-display-p2.webp`, the finished painting with its foreground color treatment. Show it immediately, without waiting for animation setup.
2. Load `assets/yosemite-live-p2.json` and the small common atlas for sky clouds, mist and pine-needle sprites. Set live readiness separately from visible readiness.
3. Load only the foreground atlases intersecting the actual horizontal crop: left, center or right. Portrait normally needs only the center atlas. Fetch additional groups after a resize only if needed.
4. Load `assets/cloud-curtain-p1.webp` only on section-link intent (hover, focus, pointer down), click, or flagged arrival. Do not generate or download navigation clouds at startup.

All brushwork and masks are prepared offline. During ordinary visits there is no `getImageData`, terrain classification, cloud sprite painting, or foreground pixel processing. The renderer reads saved coordinates and draws source rectangles from decoded image atlases. Loose falling leaves come only from the left pine and are capped at eight; other vegetation can rustle without shedding particles.

If a live atlas fails, retain the static painting. If the optimized display image fails, try the older cached terrain as a static fallback. Do **not** download the guide and attempt to repaint the scene on a visitor’s device.

For authoring, run the local dev server and use `?bake=1`. The guide is allowed only in this explicit local authoring path. `window.paintLandscape()` can rebuild the terrain; `window.exportPainting()` exports its cache. After changing art or animation masks, run `scripts/bake-assets.cjs` against the local server. Set `PLAYWRIGHT_MODULE` to an installed Playwright module if it is not installed in the project. The baker exports the display, common atlas, three foreground atlases, manifest and cloud curtain. No Playwright dependency is shipped to visitors.

Version the display, manifest and matching atlas filenames together before shipping a new set; current Yosemite assets use `p2`. HTML preload URLs and runtime URLs must match. Asset caching is one hour, so stale metadata must never be paired with new atlas coordinates.


### New scene live packs

The four new scenes follow the same authoring/runtime boundary. Normal visits load `painting.webp` immediately, then `live-v1.json` and `live-v1.webp`. The metadata records the actual painted cutout rectangles, fixed motion origins, source-derived masks, and seeded movement parameters. The loader restores cached canvas layers from the atlas without downloading a guide, reading pixel data, classifying terrain, or painting new sprites. If live assets fail, retain static art. If the primary painting fails, use the smaller `fallback.webp`; do not generate terrain on a visitor's device.

`?repaint=1` is the explicit local authoring path. `scripts/bake-landscapes.cjs` creates the original terrain painting, small fallback, live atlas, and matching metadata. Reference guides stay in Git and are excluded from Vercel deployment. Use new paired live-pack filenames after structural changes so cached metadata cannot reference an incompatible atlas. A guide failure during authoring is an error; a guide is never a normal visitor dependency.

## 7. Layering and art direction

The proven structure is:

1. A mostly stable terrain canvas.
2. Cached foreground masks using the terrain’s own painted pixels.
3. A live canvas for clouds, vegetation motion, water and birds.
4. A subtle paper-grain overlay.
5. Navigation paper slips and a separate full-screen transition canvas.

The physical landmarks stay still. Near vegetation has stronger contrast and more motion; distant vegetation stays quieter. Use the same shared wind field with spatial delay, not independent random movement for every patch.

Yosemite’s foreground treatment separates the left pine, bottom canopy and right trees using soft spatial masks, source-material masks, deeper cool shadows and warmer highlights. Keep masks feathered and overlapping. Hard rectangular crop edges and harsh binary pixel thresholds can produce visible patches or speckling.

The user may be editing foreground motion locally. Inspect existing diffs and preserve those changes; do not overwrite them by copying a clean Git version over the working file.

## 8. Make the scene alive in a physically coherent way

### Trees

Extract masked cutouts from the actual painted scene. Cache them once. Animate branch/leaf clusters with a common gust, a small traveling delay, and restrained faster rustling. Upper branches yield more than a trunk. Foreground motion should be visible but should not make the forest look like floating rectangles.

Do not regenerate leaf geometry or random color every frame. That produced shimmer and poor performance. Cache the geometry and move the resulting pigment.

### Clouds

Build cloud banks as overlapping painted volumes: cool shaded folds, warm upper highlights, broken bristle marks, fine pigment granulation, and sparse paper breaks. Avoid featureless white ellipses or purely blurred blobs.

Texture belongs inside the cloud’s mask. Random dots outside its silhouette look like noise, not pigment. Sky clouds may have transparent dry spots. Transition clouds must keep an opaque undercoat so text and the previous scene cannot leak through.

Bake texture into sprites once. Animate position and a small amount of scale/depth, not random texture. The user requested faster clouds: movement must be apparent over a few seconds without turning the sky into a conveyor belt.

### Birds: quantitative contract (where present)

Required for Yosemite and any new scene that deliberately includes sky birds. Record this check as not applicable when a scene omits birds; do not introduce birds just to satisfy a generic checklist.

All x motion is left to right. Use staggered passes and reset only outside the visible view. Vary flap phase and smoothly blend gliding; do not abruptly reverse heading. Preserve a consistent silhouette and scale.

At least one bird must actually be visible for ≥75% of the cycle when the sky is in view. Measure this after checking:

- The actual viewport’s horizontal crop.
- The mobile stage’s height and initial middle scroll position.
- The bird’s vertical position on-screen.
- The skyline or cliff mask.
- Complete exit before a wrapped flock re-enters.

A good starting design is two three-bird flocks, half a cycle apart, on a 32-second pass. The start/end margins and spacing must be tuned to the viewport. Do not assume this always meets the contract; sample the rendered placement over multiple cycles and several aspect ratios.

Current Yosemite verification sampled 128 seconds in 0.1-second increments at 320×700, 390×844, 1440×1000, 1920×1080, and 2560×1080. At least one bird was on-screen in **100%** of those samples, with no backward movement during a visible pass. These results use the normal initial view, including the centered mobile start; they are not a claim about every possible aspect ratio or a page scrolled so far down that its sky is off-screen. Repeat this check for a new park rather than inheriting the result.

### Waterfalls

Locate the lip and landing area from the guide. Keep the lip fixed. Use a combination of:

1. Thin overlapping, translucent brush washes for the continuous veil.
2. Uneven longitudinal bristles for the torn edge and internal structure.
3. Short ribbons accelerating downward (`position ≈ age^1.65` is a useful starting curve).
4. Increasing wind influence toward the bottom of the sheet.
5. Cached chalk-like mist born at the base, drifting with the same wind and thinning away.

Keep the foot connected to the geography. Do not scatter mist independently across the screen. Do not turn the fall into parallel white hairs, a solid SVG wedge, a generic particle emitter, or a giant airbrushed glow.

For Yosemite we compared the veil, ribbons and mist independently in magnified browser screenshots before combining them. Repeat that method when an important element is not reading well.

### Lakes, rivers and ocean

Only add water where the actual chosen view contains it. Reflect the colors and shapes above it. A convincing new scene needs different movement for a lake, a river and breaking surf. Use broken directionally coherent marks, not the same floating sparkles everywhere.

## 9. Painted cloud navigation

The reference for the conceal/reveal effect is the Clash of Clans matchmaking cloud screen:

https://www.clash.ninja/images/content/what-are-the-clouds-clouding-problems-2.jpg

The implementation uses original painted clouds, not extracted game assets. Study the big overlapping banks, pale blue-gray folds and near-opaque warm centers.

Current files are `cloud-transition.js`, `cloud-transition.css`, the shared navigation styles in `style.css`, and all six HTML pages. Links use relative clean URLs so they work beneath `/postcardfolio/`. The local server and Vercel map clean section URLs to their HTML pages. Keep this prefix-safe behavior. The arrival marker records the destination pathname and is consumed once, including on pages that also contain outgoing links.

Flow:

1. Ordinary click on the paper slip starts cached cloud banks moving in from staggered directions.
2. They completely cover the viewport.
3. Hold full coverage for about 130 ms.
4. Set a one-shot sessionStorage arrival marker and perform normal page navigation.
5. The destination starts covered and parts the clouds to reveal its own landscape.

Use a head-time arrival cover so slow script preparation does not flash the destination before the clouds are ready. Consume the arrival flag once. Direct visits show the requested scene without an arrival curtain. Respect modified clicks and native browser Back.

Reset an old overlay on persisted `pageshow`. Invalidate unfinished work on `pagehide`, and recheck the generation ticket after any asynchronous hold. We found and fixed a race where an interrupted covered hold could still navigate later.

Clouds should begin entering promptly; an early version spent half its animation traveling invisibly offscreen. Full coverage must include corners on both wide and portrait screens. Cached sprites plus `drawImage` are sufficient.

Do not add spinners, game graphics, search icons, or invented portfolio copy. All six destinations currently present landscapes and navigation.

## 10. Performance rules that came from real failures

An early animation repainted thousands of bristled leaves every frame. Playwright measured approximately 14fps with frequent 50–100ms tasks. Caching painted foliage clusters removed the bottleneck and the flicker.

- Pixel sampling and `getImageData` belong in preparation, not the frame loop.
- Seed randomness for cached marks. Do not re-randomize a leaf on every frame.
- Keep large static color treatments on the terrain canvas rather than re-compositing the entire foreground every frame.
- Rotating many small raster cutouts can cost more than simple translation. Add rotation only where it visibly improves the result, and measure it.
- Pause drawing in hidden tabs.
- Cap DPR. High-DPR giant canvases and transition textures can waste considerable memory.
- Cache mist, cloud texture and other repeatable marks.
- Frame smoothness must be measured in a browser; source-code guesses are not enough.

We observed median browser frame intervals near 16.7 ms after optimizing. This measures responsiveness of the browser, not proof that every animation layer is redrawn at 60fps: the scene itself intentionally throttles live repainting. State that distinction honestly.

## 11. Browser QA: do this, then stop

The built-in browser host was unavailable in the original session. Playwright worked and is required by repository instructions for browser automation, visual previews, and browser testing.

Scope browser checks to the change, as required by AGENTS.md. For a branch-only visual change, check Yosemite on desktop and portrait mobile with a short motion comparison; do not run the full 24-view suite. Use the broader suite for shared rendering, navigation, layout, or changes across multiple scenes. Test a new park at desktop, portrait mobile, and a wide screen. Inspect screenshots yourself; do not rely exclusively on numeric assertions. Also inspect a short time sequence or video, because a beautiful still can hide incoherent motion.

Minimum checks:

- The focal landmarks are recognizable and geographically coherent.
- Foreground, middle ground and background separate clearly.
- The portrait composition keeps its central landmark and primary moving feature in view.
- The mobile canvas uses the actual stage height, and its initial middle scroll still works.
- Where birds are present, they travel only left to right and meet the measured ≥75% visibility requirement.
- Where canopy is present, its motion belongs to the trees and does not flicker or reveal tile boundaries.
- The scene brief's primary movement is visible and physically anchored; water lips, banks, and shorelines stay connected to the terrain.
- Where clouds are present, their texture stays stable while they move.
- No JavaScript errors or missing scene assets.
- Missing cached painting rebuilds; missing guide retains a static painting.
- Every section link remains readable and reachable in the paper navigation strip.
- Transition coverage fully hides the scene before navigation, including all corners.
- Direct writing visit, browser Back, repeat click and double-click behave correctly.
- Other modified clicks are not intercepted.
- The production URL and the `/postcardfolio/` proxy path both work.

Do not run reduced-motion tests; the user explicitly excluded them. Preserve the existing preference support.

For a 130ms covered hold, ordinary screenshots can miss the exact coverage instant. An attribute MutationObserver in the test can read corner alpha immediately when the covered phase begins. Do not mistake a screenshot taken after navigation/reveal has already started for a coverage failure.

Once the relevant checks pass, do not rerun unrelated suites repeatedly. Fix an observed issue, then rerun the check that can establish the fix.

## 12. Build and deployment constraints

The app is plain HTML/CSS/JS. `npm run dev` serves the local site; `npm run check` validates JavaScript and local page resources. Add no runtime dependency for a few canvas operations. Preserve the current buildless setup.

The public repository is `ykalani/postcardfolio`. Production is Vercel project `yashs-projects-7874976b/postcardfolio`. Existing GitHub and Vercel authorization may already be configured. Do not print credentials. Deployment is normally:

```powershell
npm run check
git add <only-your-files>
git commit -m "Describe the completed scene"
git push
npm exec --yes --package vercel -- vercel deploy --prod --yes
```

Confirm deployment reaches READY and inspect the real production page. Keep the main domain’s proxy routing intact. Do not assume a local screenshot verifies publication.

`archive/`, the development server, and local check helpers are excluded from Vercel deployment. `.vercel/` and the locally retained résumé are ignored by Git. The archived postcard must not accidentally ship as the landing page.

If a remote README update or another agent’s changes arrive, integrate them without force-pushing or discarding local edits. An isolated worktree can reconcile commits while keeping an actively edited main working tree intact. Do not stage someone else’s unrelated changes just to get a clean status.

## 13. Execution plan for the next model

1. Inspect current source, local diffs, deployed scene, this guide, and asset credits.
2. Read the relevant scene brief. Resolve its proposed viewpoint against a real reference, research its focal geometry, and obtain a verified usable image. Record the selected asset and license before rendering.
3. Build one strong static painting. Compare it against the source and reference style.
4. Separate foreground, distant terrain and sky. Fix portrait framing before adding motion.
5. Implement the two or three physical movements that matter most to that park.
6. Inspect motion. Use close-up component comparisons if something reads as a line, particle effect or pasted-on illustration.
7. Check performance and, where birds are present, the bird occupancy contract. Cache expensive marks.
8. Integrate through the existing cloud curtain only where navigation has been requested. Do not invent a park selector or restore removed controls.
9. Validate the actual browser output, commit, push, deploy to Vercel production by default under AGENTS.md, and verify the live URLs. Respect an explicit user request for a different workflow.
10. Repeat for the remaining parks, keeping their art direction distinct. Reuse implementation patterns, not the same landscape with new colors.

## 14. Implementation model guidance

Use Sol as the default scene implementer, one bounded scene per task. Use Terra for difficult renderer, masking, or performance problems; use Luna for small follow-up tasks once the reference assets and rendering approach are proven. This is workflow guidance, not a measured model benchmark. Do not switch models or spawn additional agents without applicable user authorization.

For an explicitly requested parallel implementation, give each agent one scene's module, asset directory, credits, and brief. Keep shared renderer, HTML, navigation, integration checks, commits, and production publication with the coordinating agent. Preserve Yosemite as the baseline. Validate each scene in Playwright before integrating; parallel work is not a reason to skip visual review.

## 15. Copy-and-paste implementation handoff

> Read AGENTS.md, LANDSCAPE_PLAYBOOK.md, and landscapes/[SCENE].md; inspect current source and local diffs before editing. Implement only the requested scene from a verified licensed guide image as a detailed, living canvas painting in the established style. Resolve the brief's proposed viewpoint and record asset provenance first. Preserve actual landmark geometry, current navigation, and unrelated local work. Keep foreground, terrain, and atmospheric layers visually coherent. Animate the scene's meaningful physical elements; avoid arbitrary particles and pasted-on trees. Where sky birds are included, use left-to-right flight and measure at least 75% visible occupancy. Preserve the current mobile height and Home centered start; use the brief's documented portrait framing for other scenes. Cache expensive brushwork. Use Playwright to inspect desktop/mobile/wide stills and motion, check affected navigation and browser Back, and skip reduced-motion tests while retaining support. Finish one scene before repeating the approach. Run relevant checks, commit, push, deploy to Vercel production by default, and verify live URLs unless the user explicitly requests another workflow. Report what you built, what you checked, and any real limitation.

## 16. Current implementation checks

Run `npm run check` for all script syntax, five pages, unique IDs, section links, credits, guide/cache files, and Yosemite atlas metadata. Run `npm run check:browser` with `PLAYWRIGHT_MODULE` pointing to an existing Playwright installation when not locally installed; `PLAYWRIGHT_CHROMIUM_EXECUTABLE` can select an existing browser binary. `SCENE_URL` selects the local or production origin. The default QA origin is port 5178; `PORT=5178 npm run dev` serves there. Tests write screenshots/reports outside the repository by default.

The browser suite covers 20 landscape/viewport combinations, deterministic time-separated motion, actual mobile initial scroll, nav bounds, live-atlas/painting fallbacks, Home-to-section cloud opacity and Back, and bird direction/occupancy. Do not run the source-rebuild fallback checks against production for Yosemite, whose guide is deliberately local-only. For the four new scenes, missing live atlases preserve static art and missing primary paintings use the small baked fallback. Source-based repainting belongs only to explicit local authoring.

Local baking: `npm run bake:landscapes` regenerates all four new caches; append a section name to select one. `npm run bake:yosemite` regenerates Home's fine terrain and runtime atlases. Bake once after source, grading, or painter changes; do not regrade an already graded cache. Screenshots at multiple times are essential because a detailed still does not establish correct motion.

## Current six-scene revision

The user replaced Writing with the supplied Banff portrait and About with the supplied sandstone-arch/kayak photo. The About source depicts Pictured Rocks rather than Sleeping Bear; its legacy asset directory and module ID remain `sleeping-bear` for compatibility. The sixth destination is `tech-blog`, using the supplied Beaumont Tower photograph. Preserve the user originals and scene-specific canonical reference copies; never overwrite them during baking.

The upper Yosemite branch was restored and is part of Home. Preserve the existing landscape artwork and grain strength; branch refinements should retain its framing, pine needles, and wind motion. The latest foreground direction adds richer cool green shadows and warm sunlit tips to separate the near trees from the distant forest; retain this depth-feathered grade when rebaking Home. Do not apply it to the other scenes.

New scenes use `liveVersion:2`, `painting-v2.webp`, `fallback-v2.webp`, and matching `live-v2.json`/`live-v2.webp`. Existing Volcanoes and Great Sand Dunes retain their original v1 packs; Home retains its p2 atlas set. `sourceY` is an optional vertical crop anchor for local authoring, used by Banff to keep mountain walls, lake, and canoe foreground in one coherent full-bleed crop. No stretching or invented side-fill is used.

Rebake only the three new/replacement scenes with `node scripts/bake-landscapes.cjs writing about tech-blog`. Normal visits still do not fetch source guides. Browser checks cover all six destinations at four viewport sizes, including navigation, Back, live/static fallback, and unchanged Yosemite bird occupancy. Blog articles and publishing workflows are separate from the landscape destination.

## Foreground and distance

All six paintings distinguish near framing from distance with material-aware pigment grades, without photographic blur. Yosemite uses a cool, quieter valley behind its richer left pine and bottom brush. The upper bough is a separate live sprite over clean sky, never duplicated in the static painting; its stronger anchored sway shares its transform with bird occlusion. Banff's right-hand pines sway over fixed mountain and dock geometry, while source-masked lake pigment and brighter ripples travel within the lake only.
