# About: user-provided sandstone arch reference

## Current reference

- **Source:** photograph supplied by the user for this scene. The original creator, exposure date, and license terms were not supplied; no public-domain or photographer attribution is inferred.
- **Preserved input:** `provided-arch-reference.webp`, an exact byte-for-byte copy of the supplied 800 × 599 WebP. SHA-256: `13a8ff4cea5b9dd23e1c3d1a90604f7c36744f45a862d33771445c0ae736ec7d`.
- **Authoring guide:** `guide.webp`, the same exact bytes. The user explicitly directed use of this newly supplied reference.
- **Visible subject:** a daylight sandstone arch above a Michigan lakeshore, with tree canopy, green-blue water, several kayaks, and a distant shore visible through the opening. The photograph does not establish an exact capture location or photographer. Geographic labeling is verified separately by the coordinating task.
- **Compatibility path:** the directory and renderer ID remain `sleeping-bear` so existing About routes and asset-loading code keep working. That filename is not evidence that the new photograph depicts Sleeping Bear Dunes.

## Painting and motion

The shared painter center-cover scales the 800 × 599 source by 2 to 1600 × 1198, then crops 99 logical pixels from the top and bottom into a 1600 × 1000 painting. The arch, negative-space opening, tree positions, horizon, kayaks, and cliff strata are not relocated or assembled from other photographs. Original directional brush marks reconstruct the visible terrain; the reference photograph is sampled offscreen, not drawn as the visible site background.

A manually traced shore boundary near logical y667–711 confines motion to actual water. The sky visible through the arch stays fixed. Small moving strips of the painted water retain the real cool and warm reflected colors, while cached source-color crest and trough strokes add low lake chop. Kayaks and people remain fixed inside mapped exclusion regions. Six alpha-masked cutouts of actual painted canopy retain the source palette and bend around fixed woody attachments. No sunset, sun, artificial reflection column, new grass, or extra birds are added.

The finished painting, smaller fallback, and prebuilt motion atlas/metadata are exported during integration. Visitors load these cached painted assets; the source reference and guide are local authoring material. Animation is an artistic interpretation, not a claim about measured wind or wave speeds.

## Superseded sunset source

The old `guide.jpg` and historical sunset artwork used “Sunset at Sleeping Bear Dunes” by Ddbaran67, July 11, 2019, under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), from [the original Commons source page](https://commons.wikimedia.org/wiki/File:Sunset_at_Sleeping_Bear_Dunes.jpg). That credit and license continue to describe that older source and its derivatives only. They do not identify or license this replacement user-provided arch photograph. Preserve the old attribution if distributing the old guide or historical sunset artwork.


Current expressive-paint edition: `painting-v3.webp`, `fallback-v3.webp`, and `live-v3.*` use a coarse color study and broad, discrete-pigment flat-brush marks. These replace the earlier dense photo-like reconstruction. Original source provenance and any applicable source license above remain unchanged; see the shared playbook for the current rendering direction.

Current half-size brush edition: `painting-v4.webp`, `fallback-v4.webp`, and `live-v4.*` use marks half the previous edition’s length and breadth. Source provenance remains unchanged.

Current motion/detail edition uses `painting-v5.webp`, `fallback-v5.webp`, and `live-v5.*`. Local painted refinements and motion cutouts retain the same source provenance; no new photographic sources are introduced.

## Gouache reinterpretation (v8)

The user requested a new artistic direction after rejecting the procedural painting. `gouache-master.png` is an AI-generated gouache/oil-pastel interpretation made with OpenAI image generation, using the supplied arch photograph and previous crop as references. `kayak-study.png` contains four matching AI-generated transparent painted kayak studies. These are illustrative interpretations, not human-authored physical paintings or photographs of the place. Original source provenance above remains unchanged.

The landscape was directed toward large warm sandstone planes, cool indigo shadows, dark foliage, a quiet sky and broad teal lake strokes. Kayak studies were generated separately to animate without stationary copies. The source masters are retained for authoring; `painting-v8.webp`, `fallback-v8.webp` and `live-v8.*` contain the production painting and motion layers.
