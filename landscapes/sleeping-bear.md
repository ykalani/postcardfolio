# About — user-provided sandstone arch scene

## Current requested motion

The latest user direction replaces the earlier fixed-kayak behavior. The top trees release seeded green/gold painted leaves. Water pigment flows inside the mapped shoreline, with wavelets sampled from the cleaned painting. Three manually traced painted kayak/people cutouts drift gently back and forth, bob, roll slightly, and leave restrained wakes. Their original silhouettes are replaced with neighboring painted cliff above the shoreline and water below, so no stationary copy remains underneath. All reconstruction occurs during authoring; normal visitors load the v4 painting and prebuilt cutouts. The arch, distant island, and sky stay fixed.

`scripts/check-petals-kayaks.cjs` verifies leaves, water, and each kayak separately at deterministic times, checks that the underlying painting stays fixed, and captures desktop/mobile screenshots.


Read [the shared playbook](../LANDSCAPE_PLAYBOOK.md) and repository instructions first. Shared renderer, navigation, QA, and deployment instructions remain there.

## Current direction and status

The user replaced the original sunset reference with a daylight photograph showing a sandstone arch, kayaks, tree canopy, and Michigan lakeshore water. This latest supplied arch image is the authoritative About reference. Earlier beach-path and sunset instructions are superseded for this scene. The existing `sleeping-bear` directory/renderer ID is retained for route compatibility; it is not a geographic claim about the replacement photograph. The coordinating task verifies the public-facing location label separately.

The scene is implemented in `scenes/sleeping-bear.js` and is ready for integrated cache baking and browser inspection. Exact source bytes are preserved in `assets/sleeping-bear/provided-arch-reference.webp` and `guide.webp`. See [the current source record](../assets/sleeping-bear/CREDITS.md). No creator or license has been invented for the user-provided image.

## Viewpoint and composition

Use the single supplied view without moving or combining landforms. The 800 × 599 image becomes a 1600 × 1198 center-cover guide, cropped by 99 pixels at top and bottom into the 1600 × 1000 logical painting.

- Foreground: green-blue lake water with warm reflected sandstone colors and small wavelets.
- Middle ground: the actual arch and shoreline, with separately animated kayaks and people.
- Upper frame: the real leafy canopy above the rock, with visible warm strata and shadowed ledges below.
- Distance: blue sky and the small far shore visible through the negative-space opening.

The lake begins along a traced irregular boundary near logical y667–711. The negative-space opening remains sky; never animate that blue region as water merely because its pixels are blue. Do not invent a sunset, move the horizon, add a sun/reflection path, or animate the architecture of the arch.

## Palette and material

Warm sandstone ochres, rust, and gray ledges; cool clear blue sky; green-blue water carrying broken gold cliff reflections; vibrant near greens. Rock marks follow the bedding and near-vertical right face; water marks remain mostly horizontal. Source-masked painted canopy receives the shared `liftForeground` treatment after alpha masking, so foliage gains contrast and color while rock and sky stay untouched.

## Live elements

1. Thin strips of actual painted lake water move with two coherent depth-scaled wave fields. This retains real gold and green reflections instead of adding an unrelated glow or glitter effect. Maximum displacement stays small enough for a lake at this viewing distance.
2. Cached source-color crest/trough marks add fine, broken lake chop inside the same shore mask. The edge mask fades gently at the fixed shore boundary. Separate painted kayak cutouts drift over cleaned water rather than being distorted by the water strips.
3. Six cutouts of the real painted canopy bend from fixed woody anchors. Shared gusts arrive with a spatial delay and restrained higher-frequency leaf rustle. The cutouts use source-green material masks and feathered boundaries; no procedural tree is pasted over the scene.

No clouds are invented in the mostly clear sky, and the arch, cliffs, distant shore, and horizon remain fixed.

## Mobile framing

The shared 160svh stage remains unchanged. Horizontal focus `.645` favors the actual arch opening, distant shore, and water. The initial scroll fraction `.54` retains the lower cliff, water, and part of the canopy rather than moving landforms together artificially. Check both 320px and 390px portrait crops; the fixed navigation must not hide the primary water motion or key arch shape.

## Integration and verification

The coordinating task bakes the static painting, fallback, and prebuilt live atlas/metadata, then runs the shared Playwright desktop/mobile/wide and normal navigation checks. The source/guide stay authoring-only; normal visits must not sample or download them. Confirm source-masked water never appears in the blue sky opening, canopy roots stay attached, the kayak silhouettes move without leaving fixed duplicates, and live output changes over a short sequence. Preserve support for motion preferences without adding the excluded reduced-motion tests.

The earlier sunset-specific performance measurements and reflection assertions do not describe this replacement and have been removed. Re-measure the integrated current scene rather than carrying those results forward.


### Historical verification before the requested kayak animation

Playwright authoring visits (`/about?repaint=1`) were inspected at 1600×1000, 390×844, 320×700, and 2560×1080. All four reached the live state with no page errors and different live-layer output at deterministic times 0 and 6 seconds. Desktop and portrait screenshots were visually inspected for the arch opening, actual cliff edges, fixed kayaks, and moving water.

At the 1600×1000 logical view, a 160×170 sample inside the blue arch opening had **zero nontransparent live pixels**; an 80×25 sample over the fixed central kayak also had **zero nontransparent live pixels**. These checks confirm that this scene's animated water mask does not move sky or that kayak. Mobile starts were 273px at 390×844 and 227px at 320×700, keeping the opening and lake visible. The shared canopy lift is applied only after source-green alpha masking. Integrated packed-asset and publication checks remain with the coordinating task.

The active About reference is the Pictured Rocks sandstone-arch view; the legacy filename does not identify it as Sleeping Bear. Extra foreground saturation and global noise changes were withdrawn; use the ordinary source-derived palette.
