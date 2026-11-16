# Beaumont Tower — Tech Blog

Read [the shared playbook](../LANDSCAPE_PLAYBOOK.md) and repository instructions first. Shared rendering, cache loading, navigation, accessibility, verification, and deployment remain there.

## Source and intent

The user supplied the Beaumont Tower photograph at `assets/sleeping-bear/beaumont tower.webp` for a sixth destination, Tech Blog. Use that image rather than browsing for a replacement. Preserve its original file. Its dedicated authoring copy and truthful provenance are recorded in [asset credits](../assets/beaumont/CREDITS.md); no photographer or general reuse license was supplied.

This is a landscape-only implementation. Root owns the Tech Blog page and section navigation; no posts, biography, labels over the painting, or extra interface are part of this scene task.

## Composition and material

The 1000 × 563 source center-cover crops to the shared 1600 × 1000 logical stage, removing about 49.6 source pixels at each horizontal edge and no vertical pixels. Preserve the original architecture and its naturally interlocking flowering branches:

- Foreground: large pink magnolia clusters at upper left, upper right, and the near-right edge; evergreen branches and low greenery frame the tower.
- Middle ground: Beaumont Tower's brick masonry, light stone carving and trim, arched openings, and clock remain structurally still.
- Distance: the pale sky and finer branches recede through the foreground frame.

Brush direction follows upright masonry in the tower zone and irregular branch/petal directions in the surrounding foliage. Keep the foreground vibrant and defined with source-material color masks; avoid flattening the entire photograph into equally sharp noise. The shared painter supplies stable coarse pigment and fine structural bristles.

## Living elements

Twelve source-masked painted cutouts cover seven magnolia clusters and five evergreen branch masses. Pink-petal masks reject warm brick and woody stems; green-needle masks reject stone, clock, and sky. Feathered edges avoid rectangular patches. Each cluster shears and rotates gently around a fixed photographed woody attachment with a shared gust and small spatial delay, plus restrained tip rustle. The building and its supports stay fixed.

Current requested motion adds 64 seeded pink petals released from source-masked flowering branches and three small chalk-colored wind curls. Petals flutter, turn edge-on, and fade at cycle boundaries. The clock and tower remain fixed; no pollen or clock-hand animation is added.

## Portrait framing

The initial configuration favors logical x≈712 (`focusX:.445`) so the tower clock and left flowering frame remain together. A scene-specific initial scroll fraction of .25 favors the tower crown and clock over excess lower greenery while preserving the shared 160svh mobile stage. Verify the actual 320px and 390px crops during integration; adjust this framing instead of moving architecture or inventing new flowers.

## Runtime assets and verification

The scene module is `scenes/beaumont.js`, using the shared `startScene` pipeline. Root bakes `assets/beaumont/painting-v4.webp`, `fallback-v4.webp`, `live-v4.webp`, and `live-v4.json` from the authoring route before deployment. Normal viewing loads those caches and does not process the source image.

Check source/copy byte equality, scene syntax, exact center-cover crop, and that the motion cutout alpha stays zero over the clock and masonry. Root owns integrated Playwright desktop, portrait, wide, temporal, fallback, and navigation checks, and the final commit/deployment.

Current runtime caches are the half-size-brush `painting-v4.webp`, `fallback-v4.webp`, and `live-v4.*` edition. `scripts/check-petals-kayaks.cjs` checks petal-flight and wind-curl regions on desktop plus portrait screenshots.
