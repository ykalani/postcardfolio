# Hawaiʻi Volcanoes — Experience

Read [the shared playbook](../LANDSCAPE_PLAYBOOK.md) and repository instructions first. Shared rendering, navigation, QA, and deployment requirements remain there.

## Status and intent

Implemented for Experience at `/experiences`. The selected guide is B. Carr's USGS public-domain photograph of Halemaʻumaʻu at dusk on October 10, 2021, viewed from the west rim. Asset provenance is recorded in [the scene credits](../assets/hawaii-volcanoes/CREDITS.md). Experience remains landscape-only until content is requested.

The scene should introduce charcoal, violet dusk, and concentrated orange light to the portfolio while retaining the same painted material language as Yosemite.

## Proposed viewpoint and composition

Use the documented October 10, 2021 west-rim view into Halemaʻumaʻu. The active western lake and west vent are surrounded by cooling crust and dark crater walls; no unrelated ocean entry or recent eruptive episode is composited into this scene.

- Foreground: dark, textured crater-rim rock anchoring the composition.
- Middle ground: the crater bowl and one geographically grounded incandescent focal area.
- Distance: the far rim, a restrained plume, and a limited dusk sky.

Keep enough reflected light to read the rocks without making every edge glow. Do not combine summit craters with unrelated lava entering the ocean. Avoid a spectacular fountain unless the selected dated reference supports that exact treatment.

## Palette and material

Charcoal and brown-black rock with violet-blue shadows; ember orange, muted red, and small pale-hot accents. Direct rock marks along actual fractures and terraces. Keep the bright region concentrated so the rest of the painting retains depth. Reserve a quieter area for eventual project content without building the content layout now.

## Live elements, in priority order

1. A continuous painted gas stem remains attached to the photographed west vent, while thirty overlapping textured wisps rise and drift left. Four smaller, lower-opacity gas sources follow the photographed crater margins. The texture is cached; it is not regenerated randomly each frame.
2. A per-pixel source-color mask confines incandescence to actual hot crust fractures. Fine segments follow the source heat gradient's tangent, with slow spatially traveling brightness variation rather than global flashing. Cold crust remains anchored.
3. A small, feathered cutout of painted crust creates restrained thermal shimmer above the vent. Its narrow strips move less than one logical pixel, leaving the vent and crater geometry fixed. No full-screen distortion or particle emitter is used.

Do not add generic sparks across the sky, floating rock, or compulsory birds. The composition should still read as a painting when paused.

## Time and activity

This is an artistic depiction of a documented scene, not a live eruption monitor. Record the reference date in asset provenance and do not imply the painted activity is occurring now. Live feeds, current-activity integrations, and continuously changing light are outside this brief.

## Mobile framing and completion

Keep the incandescent focal area, its plume origin, and enough inner crater wall to establish scale visible together. Avoid a portrait crop consisting mostly of dark foreground. The scene retains the shared 160svh mobile stage but starts at 86% of its scrollable range, an explicit scene-specific art-direction exception to the centered default. At 390×844, the earlier centered/.75 start placed the fixed vent too close to or behind the bottom navigation; the .86 start raises it clear while retaining the plume and lava crust above. The taller composition remains scrollable so the upper rim can be inspected.

Use the shared Playwright checks for stills, motion, and performance. Look for stable plume texture, a fixed emission origin, geographically bounded light, and no full-screen flashing. Implement only this requested scene and preserve the existing default landing.

## Research references and asset record

- [NPS summit webcams](https://www.nps.gov/havo/learn/photosmultimedia/webcams.htm): real camera viewpoints and links to USGS sources.

Webcams remain research references, not guide assets or runtime dependencies. The chosen [USGS dated still](https://www.usgs.gov/media/images/october-10-2021-kilauea-halemaumau-lava-lake-dusk) explicitly states Public Domain. Runtime assets are `assets/hawaii-volcanoes/guide.jpg` and the browser-baked `assets/hawaii-volcanoes/painting.webp`; exact source, author, license, date, viewpoint, and crop are in the scene credits. The fixed vent is near logical coordinates (1001, 842). Portrait framing favors its plume and surrounding crust at initial view; scrolling upward reveals the upper rim.


## Implementation and verification

- Module: `scenes/hawaii-volcanoes.js`, using the shared painter. Source-gradient-directed terrain bristles retain the actual fracture and terrace geometry. Cool shadow grading lifts the crater walls enough to preserve depth without making dusk uniformly gray.
- The guide remains offscreen; `painting.webp` is the exported browser painting cache, not the photograph displayed as a background.
- Playwright checks at 1600×1000, 390×844, and 2560×1080: scene ready, no JavaScript page errors, and live-layer pixel output changes over a 1.8-second sample at every size. Screenshots were inspected for vent/plume visibility and grounded crater geometry. The mobile start was adjusted after visual inspection to keep the bright vent clear of the navigation.
- The artistic gas and thermal motion do not reproduce measured flow rates and do not report current activity. Publication and integrated navigation/fallback checks are performed by the coordinating task.


### Runtime loading

Source sampling and live-mask construction run only during local authoring (`?repaint=1`). Visitors see the cached painting first, then load the prebuilt `live-v1.json`/`live-v1.webp` pair. A missing live pack retains the static painting; a missing primary painting uses `fallback.webp`. The guide is excluded from production. These optimized fallbacks supersede earlier brief descriptions of visitor-side source rebuilding.


## Current motion pass

The gray smoke ceiling now uses overlapping dry-brush banks with a 28-second drift/fade lifecycle. The banks move across the existing upper haze, while the incandescent vent and crater remain anchored. No blur or circular smoke particles are used.

Smoke emission is five times denser: 30 main-vent wisps, 15 per rim vent, and 25 ceiling banks. Lava has a stronger heat pulse and traveling incandescent brush strokes clipped to the baked heat mask, so the flow remains within the existing hot fractures and leaves cold crust fixed. Desktop and mobile stills and short motion sequences are checked with Playwright.
