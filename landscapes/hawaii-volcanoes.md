# Hawaiʻi Volcanoes — Projects

Read [the shared playbook](../LANDSCAPE_PLAYBOOK.md) and repository instructions first. Shared rendering, navigation, QA, and deployment requirements remain there.

## Status and intent

Art brief only; an exact viewpoint, dated eruption reference, and licensed guide still need selection. This scene belongs to Projects, not a separate Playground destination. Existing project material can inform a future content task; do not add project copy or routes as part of the landscape implementation unasked.

The scene should introduce charcoal, violet dusk, and concentrated orange light to the portfolio while retaining the same painted material language as Yosemite.

## Proposed viewpoint and composition

Research one documented Kīlauea summit view looking into Halemaʻumaʻu. Select a dated reference showing the desired incandescent activity and verify its actual crater geometry and viewing angle. A research camera's view is not necessarily a publicly accessible overlook; identify the source accurately.

- Foreground: dark, textured crater-rim rock anchoring the composition.
- Middle ground: the crater bowl and one geographically grounded incandescent focal area.
- Distance: the far rim, a restrained plume, and a limited dusk sky.

Keep enough reflected light to read the rocks without making every edge glow. Do not combine summit craters with unrelated lava entering the ocean. Avoid a spectacular fountain unless the selected dated reference supports that exact treatment.

## Palette and material

Charcoal and brown-black rock with violet-blue shadows; ember orange, muted red, and small pale-hot accents. Direct rock marks along actual fractures and terraces. Keep the bright region concentrated so the rest of the painting retains depth. Reserve a quieter area for eventual project content without building the content layout now.

## Live elements, in priority order

1. A painted volcanic gas plume rising from a fixed origin, then drifting with the wind. Preserve its layered texture.
2. Restrained incandescent movement within the reference-supported vent or lava region, using stable masks and coherent flow rather than random flashing.
3. Localized heat distortion above the hot region, only if it can preserve the brush texture and perform smoothly in Canvas 2D. It is optional polish after the first two systems work.

Do not add generic sparks across the sky, floating rock, or compulsory birds. The composition should still read as a painting when paused.

## Time and activity

This is an artistic depiction of a documented scene, not a live eruption monitor. Record the reference date in asset provenance and do not imply the painted activity is occurring now. Live feeds, current-activity integrations, and continuously changing light are outside this brief.

## Mobile framing and completion

Keep the incandescent focal area, its plume origin, and enough crater rim to establish scale visible together. Avoid a portrait crop consisting mostly of dark foreground. Test dark-value separation and avoid clipping the plume at the initial centered scroll position.

Use the shared Playwright checks for stills, motion, and performance. Look for stable plume texture, a fixed emission origin, geographically bounded light, and no full-screen flashing. Implement only this requested scene and preserve the existing default landing.

## Research references and asset record

- [NPS summit webcams](https://www.nps.gov/havo/learn/photosmultimedia/webcams.htm): real camera viewpoints and links to USGS sources.

Webcams are research references, not automatically approved guide assets or runtime dependencies. Obtain a dated still with verified usage terms. Record the source page, author/agency, license, download URL, date, exact viewpoint, and crop in `assets/hawaii-volcanoes/CREDITS.md`. Planned runtime assets: `assets/hawaii-volcanoes/guide.jpg` and `assets/hawaii-volcanoes/painting.webp`; none is selected yet.
