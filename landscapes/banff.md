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
