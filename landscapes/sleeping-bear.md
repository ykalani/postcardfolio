# Sleeping Bear Dunes — About

Read [the shared playbook](../LANDSCAPE_PLAYBOOK.md) and repository instructions first. Shared rendering, navigation, accessibility, QA, and deployment rules live there.

## Status and intent

Implemented as a detailed cached brush painting with a live lake and source-masked dune vegetation, using Ddbaran67's licensed July 11, 2019 sunset photograph from the dune tops at Pierce Stocking Drive. This is Sleeping Bear Dunes National Lakeshore. The user's direction is a water sunset, with Lake Michigan and reflected light carrying the composition. About can eventually hold biography, interests, park visits, and profile/contact links; adding that content is separate work. See [asset and artwork credits](../assets/sleeping-bear/CREDITS.md) for the source and CC BY-SA 4.0 terms, which also apply to the derived painting.

This should feel like a personal, peaceful ending. Great Sand Dunes emphasizes daylight sand ridges, mountains, and a shallow creek. Here, sand is a framing element and the lake is the subject.

## Proposed viewpoint and composition

Use the selected elevated Lake Michigan view from Pierce Stocking Drive. The crop removes foreground visitors and the viewing-platform railing while retaining the photographed sun, reflection, horizon, and right-hand dune vegetation. The source metadata's camera-direction value is not treated as a verified compass bearing. Do not add islands or headlands absent from the photograph.

- Foreground: a small pale dune edge with a few beach-grass clusters framing the water.
- Middle ground: an expansive lake surface carrying a broken reflection toward the viewer.
- Distance: a clear lake horizon beneath a peach, rose, and lavender sky.

Choose an elevated bluff view as the initial composition. From that elevation, use distant wave bands rather than close-up surf at the viewer's feet. If a shoreline-level photograph proves better, revise this brief explicitly rather than mixing both perspectives. Keep sky and water dominant; avoid turning this into a second sand-ridge painting.

## Palette and material

Peach and muted rose near the sun, lavender-blue above, slate-blue water, warm pale sand, and dark olive grasses. Paint the lake with broken horizontal marks, perspective-scaled toward the horizon. Preserve real dune texture and a crisp enough horizon to anchor the soft sky.

## Live elements, in priority order

1. Three coherent wave trains displace thin strips of the painted lake by depth-scaled amounts. Cached source-color crest and trough strokes add fine movement. The shoreline mask keeps water motion off the land and the horizon stays fixed.
2. A tapered, discontinuous reflection path of 235 cached horizontal marks changes with the wave field beneath the photographed sun. It remains a reflection on moving water, rather than a solid glowing stripe or unrelated glitter.
3. Source-masked dune vegetation at the photographed far-right foreground shears gently from anchored bases in the shared breeze. Only actual dark vegetation inside the shoreline wedge is lifted; dark lake ripples are excluded. No grass or birds are invented.

Hold the overall sunset palette and sun position nearly steady. This is an atmosphere to linger in, not a rapid time-lapse. Sky birds are optional and, if included, must meet the playbook's direction and occupancy contract.

## Mobile framing and completion

Keep the real sun, horizon, and reflection visible together in portrait. The scene uses the shared 160svh stage and a scene-specific initial scroll fraction of .65, revealing more lake without changing the stage height. The source's dune vegetation is far to the right of the sun: desktop retains that shore anchor; the narrow portrait crop prioritizes the real sun and lake rather than moving landforms together artificially. Verify the sun does not clip at 320px width.

Use the shared Playwright checks. Inspect motion for a grounded horizon, perspective-correct wave scale, a reflection aligned with the sun, and grasses that do not slide at their roots. The scene must remain recognizably a freshwater dune coast rather than a tropical beach; do not add palms or ocean-scale breakers.

## Research references and asset record

- [NPS media footage](https://www.nps.gov/slbe/learn/photosmultimedia/mediafootage.htm): includes a sunset study from the Lake Michigan Overlook area.

The NPS footage remains a composition/motion research source, not a cleared download. The selected [Ddbaran67 still](https://commons.wikimedia.org/wiki/File:Sunset_at_Sleeping_Bear_Dunes.jpg) has explicit CC BY-SA 4.0 permission. Both the prepared guide and derived painted artwork carry that same license; retain an accessible attribution/credits link on the About scene. Source, author, license, download, viewpoint, and exact crop are recorded in `assets/sleeping-bear/CREDITS.md`. Runtime assets are `assets/sleeping-bear/guide.jpg` and the browser-baked `assets/sleeping-bear/painting.webp`.

## Implementation verification

Playwright inspection covered 1600×1000 desktop, 390×844 portrait, 320×700 small portrait, and 2560×1080 wide views. Desktop stills at animation times 0 and 8 seconds and each responsive screenshot were inspected. The narrow views keep the sun, horizon, and reflection visible and have no horizontal overflow. The live layer has zero alpha above logical y598, confirming that water animation does not move the sky or sun. A sampled 8-second comparison changed 124,552 water-region sample points. No JavaScript page errors occurred.

With the shared fourth fine-bristle pass and edge detail enabled, direct live-layer drawing measured a 16.1ms median and 25.2ms p95 across 30 desktop draws in the test environment. Runtime live repaint is intentionally throttled by the shared painter; these are draw costs, not a guarantee of 60 rendered frames per second. The painted cache was exported to `assets/sleeping-bear/painting.webp` (130,672 bytes at this verification).


### Runtime loading

Source sampling and live-mask construction run only during local authoring (`?repaint=1`). Visitors see the cached painting first, then load the prebuilt `live-v1.json`/`live-v1.webp` pair. A missing live pack retains the static painting; a missing primary painting uses `fallback.webp`. The guide is excluded from production. These optimized fallbacks supersede earlier brief descriptions of visitor-side source rebuilding.
