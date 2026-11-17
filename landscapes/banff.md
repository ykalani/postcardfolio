# Banff � Writing, new wide reference (v6)

Read the shared landscape playbook and ART_DIRECTION.md. The user supplied a new reference on November 16, 2026, named `assets/banff/lake-lousie.avif`. It replaces the portrait reference as the current painting guide. The original source and the earlier WebP reference remain intact.

## Composition and palette

The supplied 3000 � 2021 image has orange-lit summits, cool shaded mountain walls and snow gullies, a turquoise lake reflecting the peaks, and a conifer shore with small canoes on the right. Keep this single coherent viewpoint. The user called the image Lake Louise; no narrower geographic identification or photographer attribution has been independently established.

Use proportional center-cover into 1600 � 1000, `sourceY: .5`: scale 1600/3000, crop 38.933 logical pixels from each vertical edge. Keep warm summit pigment against blue-gray rock, deep forest greens, cyan water and warm reflected light. Use the established discrete-pigment brush painter; normal visits never display or download the reference photograph.

## Movement and framing

The v6 lake silhouette follows the new shoreline, with the right-hand dock and stored canoes excluded. Displace the lake's own painted strokes, retaining the v5 continuous row movement and pulse without drawing extra wave lines. Four source-green masked conifer patches on the right sway from fixed lower attachments. Summits, snowfields, terrain, canoes and dock remain fixed.

Use `focusX: .55`, `focusY: .5`, `initialScroll: .5` so the portrait crop contains lit peaks, forest, and lake reflections. Preserve shared stage height and navigation. Check Writing on desktop, mobile, narrow mobile and wide screen, including t0/t6 screenshots, fixed landmarks, whole-water motion, and runtime fallbacks. No reduced-motion tests.

Current runtime assets: `painting-v6.webp`, `fallback-v6.webp`, `live-v6.json`, `live-v6.webp`. Authoring source: `lake-lousie.avif`, excluded from deployment. The foreground adds only the top of the supplied wooden trail post and the source pika, facing into the scene. Both are polygon cutouts from the actual photos, repainted through `paintBrushwork`; neither generated image is shipped. `scripts/bake-banff-companion.cjs` reproduces the painted alpha sprites. `banff.css` keeps the post emerging from the lower-left edge on desktop and immediately above the navigation ledge on mobile. The animal is static and its paws rest on the cap. Preserve transparency and avoid photographic surroundings or signage.

Previous source documentation follows for historical provenance.

---

# Banff — Writing

Read [the shared landscape playbook](../LANDSCAPE_PLAYBOOK.md) and repository instructions first. This scene replaces the earlier Olympic forest at the user's request, using the supplied Banff photograph rather than a substitute stock source.

## Source preservation and viewpoint

The original 2846 × 3794 user-supplied WebP is preserved byte-for-byte as `assets/banff/provided-reference.webp` and `assets/banff/guide.webp`. Preserve both when regenerating painted runtime assets. Exact photographer, capture date, and open-license terms were not supplied, so this brief does not invent them or identify a narrower named lake. The source shows mountain walls and snowfields, a turquoise lake, a near conifer shore, and canoes beside a dock.

The original is portrait. A full-bleed 1600 × 1000 landscape cannot contain the entire summit-to-canoe composition without stretching or inventing side scenery. The agreed lower crop uses `sourceY: .78`, retaining the mountain walls, turquoise water, right conifer shore, dock, and foreground canoes while accepting that the summit and most sky are outside the landscape crop. No landmarks are relocated or combined with another photograph.

Exact authoring transform: scale `1600 / 2846`, vertical translation `(1000 - 3794 × scale) × .78`; visible original-source vertical interval **1571.895–3350.645**. The input guide remains uncropped, so a future portrait composition can use the full original without recovering it from a derivative.

## Composition and palette

- Foreground: the source's stored canoes and dock, kept still and attached to the shoreline.
- Middle ground: bright turquoise water, with a source-following shoreline and dark near conifers on the right.
- Distance: the actual cliff faces, snowfields, and shaded lower mountain forest, softened by their real light and distance.

Keep clear rock strata, conifer groups, red/orange canoe accents, and horizontal lake marks. Use the shared brush painter with directional rock marks and horizontal water strokes. Near conifer cutouts retain the painting’s natural source colors after the source-derived foliage mask; do not add the dropped foreground-brightening or extra noise treatments.

## Live elements

1. Continuous displacement of actual painted lake pigment, with subpixel vertical changes and modest lateral drift. A lake-silhouette mask includes turquoise water plus pale and dark reflections, while excluding the shore, people/posts, canoes, dock, and mountain terrain. Motion retains a visible minimum strength at the distant shore.
2. The existing water brushstrokes gently stretch and contract in a coherent pulse, increasing toward the viewer. No extra traveling lines or synthetic crests are drawn.
3. Five actual-painted near-conifer patches, source-color masked and edge-feathered. Branch-tip sway increases away from each fixed lower attachment; trunks remain in the still painting.

Do not invent a waterfall, extra glacier, floating particle lights, or moving architecture. This is a fixed artistic scene, not current weather or water conditions.

## Mobile framing and acceptance

Use `focusX: .66`, a lower wide-screen vertical framing (`focusY: .63`), and a lower initial mobile scroll (`initialScroll: .82`) to keep the lake and foreground canoe/dock accents visible above navigation. The upper mountain walls must still establish the Banff setting. Preserve the existing shared mobile stage height; no portrait image stretching or side-fill generation.

Check in Playwright at desktop, portrait mobile, narrow mobile, and wide screen. Inspect the actual painted image and a time sequence, not only scene-ready flags. Verify water-mask edges around boats/dock, anchored tree motion, fixed terrain, and no JavaScript page errors. Test the exported runtime sprite state as well as authoring preparation. Reduced-motion tests remain excluded; preserve shared preference support.

## Files and provenance

- Implementation: `scenes/banff.js`.
- Preserved source: `assets/banff/provided-reference.webp`.
- Exact offscreen guide: `assets/banff/guide.webp`.
- Runtime painting/cache: `assets/banff/painting-v2.webp` and generated `fallback-v2.webp`.
- Runtime live assets: `assets/banff/live-v2.json` and `live-v2.webp`.
- [Credits and exact source hash](../assets/banff/CREDITS.md).

The coordinating agent owns page integration, shared painter options, final browser checks, commits, and deployment.


Authoring verification: the 1600 × 1000 painted crop was inspected in Playwright with no JavaScript page errors. The live preparation produced 526 source-bounded lake crests and five conifer cutouts. Final normal-runtime/mobile/wide checks belong to the coordinating agent after its version-2 asset alignment and latest natural-color style changes; these checks are not claimed complete here.


## Current visible motion (v5)

The lake’s existing paint strokes drift and pulse through continuous row displacement and gentle horizontal expansion/contraction. The previous traveling line overlays are removed. Rooted pine sway is preserved. Mountains, dock and stored canoes stay fixed. Use the v5 painting/fallback/live caches.
