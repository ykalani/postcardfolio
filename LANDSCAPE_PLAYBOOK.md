# National Park Landscape Playbook

A self-contained handoff for Luna or another coding model. Read this before building the next six or seven landscapes. This records the actual implementation, the user’s feedback, the failed approaches, and the acceptance criteria—not just an aesthetic prompt.

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
- Mobile has a taller, scrollable composition and opens halfway through its scrollable range. Read the current CSS for the height; it has been adjusted locally after the initial 125svh version. Do not reset the user’s current value.
- A paper slip at bottom right says **writing**. It opens a plain page containing only **writing**, through a painted cloud curtain.
- Bird flight must be **left to right only**, with at least one visible bird for **75% or more of the cycle** when viewing the scene’s sky. Quantify this rather than claiming it by eye.
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

For six or seven additional parks, these are useful **creative starting briefs**, not researched asset selections or promises that all features share one viewpoint:

| Park | Possible composition | Motion to explore | Research starting point |
| --- | --- | --- | --- |
| Zion | A clearly recognizable sandstone formation framed by canyon vegetation | Near leaves, drifting clouds, river movement if the chosen view actually includes water | https://www.nps.gov/zion/index.htm |
| Grand Teton | Distinct peaks, lake or valley, foreground conifers/aspen | Water reflections, near branches, wind through grasses | https://www.nps.gov/grte/index.htm |
| Glacier | A specific carved valley or lake beneath alpine terrain | Broken lake reflections, low clouds, nearby meadow plants | https://www.nps.gov/glac/index.htm |
| Olympic | Choose one setting: rain forest, coast, or alpine country | Ferns and mist in a forest; or surf and coastal branches in a coastal view | https://www.nps.gov/olym/index.htm |
| Bryce Canyon | Recognizable hoodoo masses with a near rim or tree frame | Cloud shadows and restrained near-branch movement | https://www.nps.gov/brca/index.htm |
| Arches | One correctly shaped arch or rock formation with a convincing opening | Cloud passage, a little near scrub movement, restrained atmospheric shimmer | https://www.nps.gov/arch/index.htm |
| Acadia | A coherent rocky coast or headland view with a near tree frame | Surf, distant water glints, wind in coastal vegetation | https://www.nps.gov/acad/index.htm |

Pick a real photograph for the chosen viewpoint before deciding exact landmark coordinates. Do not give every park the same clouds, pine tree, waterfall, lake, and pollen.

## 5. Source the geometry responsibly

Find a high-quality image with enough detail in the focal landmarks. Prefer explicit public-domain or CC0 status. NPS pages are useful research sources, but do not assume every image on an NPS page is public domain: individual credits can name outside photographers.

For each asset, record the exact source page, author, license, original download URL, viewpoint, and any crop. If the license is uncertain, choose another image. Store provenance alongside assets.

The Yosemite guide was derived from this CC0 image by EF5:

https://commons.wikimedia.org/wiki/File:%E2%80%9CTunnel_View%E2%80%9D_overlook_showing_famous_rock_formations_in_Yosemite_Valley_03.jpg

License details are in `assets/CREDITS.md`. The full original was used for preparation, then removed from the shipped assets; the browser uses a smaller guide image and a cached painting. Do not duplicate a multi-megabyte original into every scene’s runtime assets unnecessarily.

### Preserve Yosemite when adding a park

Do not overwrite the existing Yosemite guide, cache, credits or default scene. Give each park unique assets, for example `assets/zion/guide.jpg`, `assets/zion/painting.webp`, and `assets/zion/CREDITS.md`. Store its implementation separately or select its configuration without changing the current default experience. Avoid copying one giant renderer seven times unchanged, but do not build a generic framework before the second scene proves which code actually needs to be shared.

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

### Initial coat and runtime assets

Each scene should have a small guide and a cached painted WebP. Load the cached painting quickly; use the guide to prepare live masks and cutouts. If the cached painting is missing, rebuild it. If the guide fails, keep the cached painting visible as a static fallback.

The existing `window.paintLandscape()` rebuilds the terrain. `window.exportPainting()` returns a WebP data URL for saving the cached coat. It exports the terrain canvas, not a screenshot containing UI or the transition curtain.

Do not repeatedly apply foreground color grading to an already graded cached image. Keep the cached base and live foreground treatment separate, or record which stage the cache represents.

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

### Birds: quantitative contract

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

Current files are `cloud-transition.js`, `cloud-transition.css`, and `writing.html`. The writing anchor uses the relative clean URL `writing`, so it also works beneath `/postcardfolio/`. The local server maps `/writing` to `writing.html`. Keep this prefix-safe behavior.

Flow:

1. Ordinary click on the paper slip starts cached cloud banks moving in from staggered directions.
2. They completely cover the viewport.
3. Hold full coverage for about 130 ms.
4. Set a one-shot sessionStorage arrival marker and perform normal page navigation.
5. The writing page starts covered and parts the clouds to reveal only its heading.

Use a head-time arrival cover so slow script preparation does not flash the destination before the clouds are ready. Consume the arrival flag once. Direct visits should simply show the writing page. Respect modified clicks and native browser Back.

Reset an old overlay on persisted `pageshow`. Invalidate unfinished work on `pagehide`, and recheck the generation ticket after any asynchronous hold. We found and fixed a race where an interrupted covered hold could still navigate later.

Clouds should begin entering promptly; an early version spent half its animation traveling invisibly offscreen. Full coverage must include corners on both wide and portrait screens. Cached sprites plus `drawImage` are sufficient.

Do not add a spinner, loading copy, game graphics, a search icon, or extra writing-page content. The current request is intentionally just one word.

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

The built-in browser host was unavailable in the original session. The user explicitly authorized Playwright, which worked. Use available browser automation; do not report visual QA as unavailable without checking the authorized alternative.

Test the new park at desktop, portrait mobile, and a wide screen. Inspect screenshots yourself; do not rely exclusively on numeric assertions. Also inspect a short time sequence or video, because a beautiful still can hide incoherent motion.

Minimum checks:

- The focal landmarks are recognizable and geographically coherent.
- Foreground, middle ground and background separate clearly.
- The portrait composition keeps its central landmark and primary moving feature in view.
- The mobile canvas uses the actual stage height, and its initial middle scroll still works.
- Birds travel only left to right and meet the measured ≥75% visibility requirement.
- Canopy motion belongs to the trees and does not flicker or reveal tile boundaries.
- The focal water motion is visible; its lip/shoreline stays fixed.
- Cloud texture stays stable while the cloud moves.
- No JavaScript errors or missing scene assets.
- Missing cached painting rebuilds; missing guide retains a static painting.
- The writing slip remains readable and reachable at bottom right.
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
2. Confirm the first new park/viewpoint. Research its focal geometry and obtain a verified usable image.
3. Build one strong static painting. Compare it against the source and reference style.
4. Separate foreground, distant terrain and sky. Fix portrait framing before adding motion.
5. Implement the two or three physical movements that matter most to that park.
6. Inspect motion. Use close-up component comparisons if something reads as a line, particle effect or pasted-on illustration.
7. Check performance and the bird occupancy contract. Cache expensive marks.
8. Integrate through the existing cloud curtain only where navigation has been requested. Do not invent a park selector or restore removed controls.
9. Validate the actual browser output, push and deploy when authorized, and verify the live URLs.
10. Repeat for the remaining parks, keeping their art direction distinct. Reuse implementation patterns, not the same landscape with new colors.

## 14. Copy-and-paste brief for Luna

> Read LANDSCAPE_PLAYBOOK.md and inspect the current repository before editing. Build [PARK] from a verified licensed guide image as a detailed, living canvas painting in the established style. Preserve actual landmark geometry and the current website navigation. Keep the foreground, terrain and atmospheric layers visually coherent. Animate the park’s meaningful physical elements; do not add arbitrary particles or generic pasted-on trees. Birds travel left to right only and must be visible at least 75% of the sky-viewing cycle. Preserve the user’s current mobile height and centered start. Cache expensive brushwork, visually inspect desktop/mobile/wide views, test normal navigation and browser Back, and skip reduced-motion tests. Finish one park fully before multiplying the approach across the remaining six or seven. Do not overwrite unrelated local work or restore the archived postcard. Report what you built, what you checked, and any real limitation.
