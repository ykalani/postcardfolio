# Yosemite — Home

Read [the shared playbook](../LANDSCAPE_PLAYBOOK.md) and repository instructions first. This brief contains scene-specific decisions; rendering, navigation, QA, and deployment rules live in the playbook.

## Status and scope

Implemented Home scene, retained and refined alongside the four new destinations. Added a fourth fine foliage/rock coat and source-gradient-aligned granite fissure bristles beyond the earlier baseline. Home remains a landscape-led arrival; do not restore the archived postcard, removed labels, or controls. All five destinations now share the paper navigation and cloud curtain; biography copy remains separate work.

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

## Current runtime and verification

The finished display painting and common/foreground atlases are prebuilt; normal visits do not load the Yosemite reference guide. Local authoring still uses the CC0 guide and `?bake=1`. `scripts/bake-assets.cjs` regenerates the detailed terrain, display cache,90 painted canopy patches, pine-only loose leaves, common live atlas, three foreground atlases, and transition-cloud atlas. Keep the source image authoring-only in Vercel exclusions.

Portrait focus was adjusted to58.5% across the logical canvas so Bridalveil Fall clears the right edge; the160svh height and centered initial scroll remain. The deterministic QA hook measures actual visible birds against skyline and viewport clipping. Recheck occupancy after framing changes; never inherit a previous100% result as a guarantee for new crops.


## Upper branch and foreground highlights

Home uses matching `brush2` display, live manifest, and foreground atlases. The upper pine bough, left pine, and bottom bushes form the foreground with richer green shadows, warm tips, and stronger contrast against the quieter cool valley. The bough sways visibly over clean painted sky; never bake a fixed duplicate into the display. Its cached mask follows that same rotation for bird visibility.

The upper bough uses the transparent painted source `assets/yosemite-pine-bough.png`, with connected irregular forks, coarse layered pine fans, open gaps, and a muted palette referenced from the existing pine. Keep its aspect ratio, modest scale, and attachment beyond the right edge; regenerate the bird-occlusion mask when rebaking. Normal visits use the baked atlas and do not load this authoring source.

Use `node scripts/bake-assets.cjs --foreground-only` to regenerate these layers from the existing terrain painting without repainting the granite. The normal bake command still rebuilds the complete painting. Verify desktop, portrait, wide crops, motion, and bird occupancy after changing branch geometry.

Background foliage receives a cool atmospheric glaze that fades out toward the near trees. Bake it into the display and canopy layers; retain the ungraded terrain cache so repeated bakes cannot compound the grade. Preserve the warm foreground highlights and the granite and sky values.

For branch refinements, follow the focused desktop/mobile Playwright workflow in AGENTS.md and inspect the complete composition as well as the branch close-up.
