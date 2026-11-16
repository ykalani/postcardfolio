# Olympic — Writing

Read [the shared playbook](../LANDSCAPE_PLAYBOOK.md) and repository instructions first. Follow its shared rendering, accessibility, QA, and deployment rules.

## Status and intent

Implemented as the Writing landscape under the user's request for parallel scene work, with a fine-detail brush pass and separate cached motion layers. The selected guide is a public-domain NPS/Fagerlund Hoh forest-floor view with moss-covered nurse logs, foreground ferns, and a receding conifer background. Its source establishes Hoh Rain Forest, not an exact Hall of Mosses trail location. Source details and crop are recorded in [the scene credits](../assets/olympic/CREDITS.md).

Use a Hoh Rain Forest interior, rather than Olympic's coast or alpine country. Its enclosed, green composition should feel quieter than the other four destinations.

## Proposed viewpoint and composition

The selected coherent view looks across moss-covered nurse logs into a softer conifer background. Hall of Mosses was a research starting point, not a verified identification of this photograph. No features from other viewpoints are combined.

- Foreground: a diagonal fallen log and distinct fern clusters.
- Middle ground: irregular moss-covered nurse-log forms and standing trunks.
- Distance: cooler, softly lit conifer foliage, with enough open intervals to retain depth.

Do not combine a coastal sea stack, alpine summit, or invented waterfall with the forest interior. Keep enough separation between trunks that the painting does not become uniform green noise. Reserve a calm visual area for a future writing list without implementing that list now.

## Palette and material

Deep cool greens, olive moss, warm bark, muted brown earth, and restrained pale canopy light. Use vertical and curved marks for trunks, hanging strokes for moss, and clustered marks for ferns. Maintain darker near values and softer distant edges. Avoid a broad glowing fog wash that erases structure.

## Live elements, in priority order

1. Thirteen separate painted fern/moss groups responding to shared gusts with spatial delay and smaller tip flutter. Ferns shear around their stem bases; hanging moss is anchored at its upper attachment. Source-color masks keep trunks and nurse logs still.
2. Five independent drip cycles: a bead gathers on a photographed moss fringe, accelerates downward, and ends in a tiny fixed-surface impact. There is no invented puddle or floating rain field.
3. Two cached mist bands masked into darker forest recesses, leaving lit moss and the near log readable.
4. Four small source-masked patches of glancing light on real moss. Their pigment is stable while intensity changes gently; they are small cached layers rather than an expensive screen blend over the full canvas.

Use actual painted cutouts for moving vegetation. No compulsory sky birds, open-sky cloud banks, or waterfall. Avoid generic floating lights and heavy rain that would compete with reading.

## Mobile framing and completion

Retain a near fern or moss cluster and the receding lit opening in the portrait crop. Do not let one trunk occupy most of the screen. Inspect the centered initial view at the current stage height, with particular attention to dark areas merging on small screens.

Use Playwright to inspect stills and motion at the shared sizes. Check moss attachments, drip origins, stable mist texture, readable depth, and the absence of rectangular foliage seams. When navigation integration is requested, preserve prefix-safe URLs, the cloud curtain, direct visits, and browser Back.

## Research references and asset record

- [NPS Hoh Rain Forest](https://www.nps.gov/olym/planyourvisit/visiting-the-hoh.htm): moss, ferns, canopy, and geographic context.

The NPS page includes individually credited photographs; it does not establish blanket permission to reuse them. The selected asset has its own verified public-domain record, documented in [assets/olympic/CREDITS.md](../assets/olympic/CREDITS.md). Runtime guide: `assets/olympic/guide.jpg`; terrain cache: `assets/olympic/painting.webp`, exported from the shared painter. Implementation: `scenes/olympic.js`. The fine-detail terrain cache is baked from the shared painter; integration and publication remain the coordinating agent’s responsibility.


## Implementation verification

Playwright inspected the ordinary animated scene at 1600×1000, 390×844, 320×700, and 2560×1080. The initial mobile scroll was centered (253 px and 210 px respectively); the forest opening and foreground moss remain together. No JavaScript page errors occurred, and the live canvas changed over a 2.2-second sequence in every size. Desktop and both portrait views sampled median browser frame intervals of 16.7 ms. The wide view sampled 33.4 ms after removing a costly full-canvas light blend; repeat that performance check serially during integrated QA because other scene work was running concurrently. These are browser frame intervals, not a claim that every live layer repaints at 60 fps.

The terrain cache was regenerated after the shared fine brush pass. Motion pigment, frond masks, mist texture, and light patches are cached during preparation; no new random brushwork or pixel reads run in the animation loop. No reduced-motion tests were run; shared preference handling remains intact.


### Runtime loading

Source sampling and live-mask construction run only during local authoring (`?repaint=1`). Visitors see the cached painting first, then load the prebuilt `live-v1.json`/`live-v1.webp` pair. A missing live pack retains the static painting; a missing primary painting uses `fallback.webp`. The guide is excluded from production. These optimized fallbacks supersede earlier brief descriptions of visitor-side source rebuilding.
