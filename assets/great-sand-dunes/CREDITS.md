# Great Sand Dunes - current supplied reference

## Verified source

The supplied reference matches the park-entrance photograph on https://www.nps.gov/grsa/index.htm , credited there to NPS/Patrick Myers. Verified visually November 16, 2026 (same dune ridges, snow patterns, clouds, and lighting, with a different crop). Image: https://www.nps.gov/common/uploads/structured_data/BC4ACB4C-0A6D-0188-E9A6AA1217827461.jpg . This identifies the current reference, superseding the initial unknown-photographer note below.

The user supplied the new 990 x 742 landscape by replacing `fallback.webp`. Its bytes are preserved as `guide.webp` for local authoring. The image shows orange dune ridges, snow-covered mountain faces in warm light, sparse clouds, and low grassland. No river is visible. Photographer, date, and license were not supplied; the earlier NPS attribution does not apply to this replacement.

The scene center-cover crops the supplied reference into a 1600 x 1000 original brush painting. Runtime assets are `painting-v8.webp`, `fallback-v8.webp`, and the paired `live-v8.json` / `live-v8.webp`. Neither the supplied photograph nor an authoring guide is downloaded during normal visits.

## Previous reference - historical attribution

# Great Sand Dunes painting guide

- Photograph: Gold Aspens and Cottonwoods, Dunes, and Snow-Dusted Cleveland Peak.
- Creator: NPS / Patrick Myers, individually credited on the source page.
- Source: https://www.nps.gov/grsa/planyourvisit/photography.htm
- Download: https://www.nps.gov/grsa/planyourvisit/images/grsa-gold-aspens-clouds-snow-2022-final-jpg_2.jpg?maxwidth=1600&autorotate=false
- Usage: public-domain federal NPS photograph; credited NPS/Patrick Myers without outside copyright. NPS policy: https://www.nps.gov/aboutus/disclaimer.htm . Item-specific credit checked November 15, 2026.
- Viewpoint: just north of the visitor center, across foreground grasslands, cottonwoods and Medano Creek toward dune ridges and Cleveland Peak in the Sangre de Cristo Mountains. The source describes all these features in one October view. No unrelated viewpoints are combined.
- Date/season: October; 2022 is identified by the source filename. This is a fixed autumn scene with creek water and fresh mountain snow, not a claim of typical year-round flow or current conditions.
- Preparation: source downloaded at1600x1067, proportional JPEG guide. Renderer center-cover crops33.5px from top and bottom into1600x1000 logical canvas. No landmarks moved. Fine multiscale bristles preserve dune contours, mountain joints, ripples and near vegetation.
- Motion: shallow source-masked channel ripples and downstream wave bands; short sand veils on specific crests; actual painted cottonwood/scrub cutouts anchored at their bases; drifting low cloud pigment from the source's own cloud band.
- Mobile: a scene-specific62% initial scroll keeps the narrow creek and dune middle ground visible together; Yosemite retains its centered start. The160svh stage is unchanged.

`guide.jpg` supplies offscreen geometry and pigments. `painting.webp` is the cached original Canvas painting. The source photograph is never drawn as the visible background.


Runtime assets: `painting.webp` is the finished original brush painting; `fallback.webp` is its smaller static fallback. `live-v1.webp` contains the painted motion cutouts and masks; `live-v1.json` records their source rectangles and movement parameters. The photographic guide remains local authoring material and is excluded from production. Normal visits do not download or sample it.


Current expressive-paint edition: `painting-v3.webp`, `fallback-v3.webp`, and `live-v3.*` use a coarse color study and broad, discrete-pigment flat-brush marks. These replace the earlier dense photo-like reconstruction. Original source provenance and any applicable source license above remain unchanged; see the shared playbook for the current rendering direction.

Current half-size brush edition: `painting-v4.webp`, `fallback-v4.webp`, and `live-v4.*` use marks half the previous edition’s length and breadth. Source provenance remains unchanged.

Current motion/detail edition uses `painting-v5.webp`, `fallback-v5.webp`, and `live-v5.*`. Local painted refinements and motion cutouts retain the same source provenance; no new photographic sources are introduced.
