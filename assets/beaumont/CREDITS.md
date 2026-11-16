# Beaumont Tower guide and painted scene

- **Source:** The photograph supplied by the user as `assets/sleeping-bear/beaumont tower.webp`.
- **Subject:** Beaumont Tower framed by pink magnolia blossoms and evergreen branches, for the Tech Blog destination.
- **Photographer and original publication:** Not supplied. No photographer identity, outside source, or public-domain license is asserted.
- **Usage context:** Supplied by the user for this portfolio implementation. This record documents that provenance; it does not grant a separate license to third parties.
- **Preserved original:** The user-provided file remains untouched at its original path. `assets/beaumont/guide.webp` is an exact byte-for-byte copy for this scene's authoring pipeline.
- **Source dimensions:** 1000 × 563 pixels.
- **Logical preparation:** The shared painter center-cover scales by approximately 1.7762 to 1776.2 × 1000, then removes approximately 88.1 logical pixels from each horizontal edge (about 49.6 source pixels per side). There is no vertical crop or landmark relocation.

The guide supplies only offscreen geometry, color, and material samples. The displayed scene is reconstructed from seeded painterly bristles and cached as `painting-v2.webp`; `fallback-v2.webp` is its small static fallback. The actual painted magnolia petals and evergreen needles are lifted into masked cutouts for wind movement. Tower masonry, clock, windows, woody supports, and sky are excluded from those cutouts. No foliage from other photographs or invented falling blossoms are added.

The live atlas and metadata (`live-v2.webp`, `live-v2.json`) are exported during authoring so the source photograph and pixel-mask preparation do not need to run during normal viewing. Magnolia petals and needles retain their source-derived colors; no additional foreground saturation pass is applied.


Current expressive-paint edition: `painting-v3.webp`, `fallback-v3.webp`, and `live-v3.*` use a coarse color study and broad, discrete-pigment flat-brush marks. These replace the earlier dense photo-like reconstruction. Original source provenance and any applicable source license above remain unchanged; see the shared playbook for the current rendering direction.
