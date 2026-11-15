# Yosemite — Home

Read [the shared playbook](../LANDSCAPE_PLAYBOOK.md) and repository instructions first. This brief contains scene-specific decisions; rendering, navigation, QA, and deployment rules live in the playbook.

## Status and scope

Existing implemented scene and visual baseline for the portfolio. Preserve it while building the four new scenes. Home remains a landscape-led arrival; do not restore the archived postcard, removed labels, or controls. Future biography and navigation changes are separate work.

## Viewpoint and composition

Use the existing Tunnel View photographic guide. Preserve the valley's actual geometry: Half Dome in the distance, Bridalveil Fall beneath Cathedral Rocks, forest masses below, and the painted foreground pine. Do not confuse Half Dome with El Capitan or move landmarks to invent a better view.

- Foreground: darker left pine, bottom canopy, and right trees, with warm needle highlights.
- Middle ground: forest and granite walls, including the fixed waterfall lip and landing area.
- Distance: Half Dome and the valley opening beneath the sky.

Keep the waterfall readable without enlarging it beyond the geography. Use the current scene as the cross-scene standard for pigment density and brush texture, not a template for every park's objects.

## Palette and material

Cool blue-gray granite, warm rock highlights, forest greens, muted blue sky, and chalk-white water. Follow granite strata with directed marks; cluster foliage marks. Animate cutouts of the painted vegetation rather than drawing a new procedural tree over it.

## Live elements

1. Bridalveil Fall: fixed lip, layered veil, accelerating ribbons, and wind-carried mist born at its foot.
2. Foreground vegetation and existing canopy leaves: shared wind with spatial delay, stable cached pigment.
3. Textured cloud banks: visible lateral movement without texture flicker.
4. Existing sky birds: left to right only; measure the playbook's minimum 75% visible occupancy after crop and skyline clipping.

## Mobile framing and completion

Preserve the current CSS stage height and centered initial scroll. Inspect the actual portrait crop rather than guessing from logical coordinates. Retain a recognizable valley landmark and the waterfall together; avoid a crop dominated by the pine. Check sky-bird occupancy at the initial mobile position, not only at the top of the stage.

Use the shared Playwright checks for stills, a motion sequence, performance, and affected navigation. In close-up, the waterfall must read as water rather than parallel hairs; foliage must not expose rectangular cutouts. Existing measurements in the playbook are historical results, not substitutes for checking a modified scene.

## References and assets

- Existing guide: `assets/yosemite-guide.jpg`.
- Existing terrain cache: `assets/yosemite-painting.webp`.
- Existing implementation: `scene.js`; framing: `style.css`.
- [Asset credits](../assets/CREDITS.md): EF5's CC0 Tunnel View photograph and its exact source/license links.

Retain these existing paths. Do not migrate Yosemite into a new asset directory merely to match new scenes, and do not overwrite uncommitted scene or painting edits.
