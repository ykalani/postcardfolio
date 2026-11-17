# Great Sand Dunes - Projects

Read [ART_DIRECTION.md](../ART_DIRECTION.md) and [the shared playbook](../LANDSCAPE_PLAYBOOK.md) before visual changes.

## Current reference and composition

The user replaced `assets/great-sand-dunes/fallback.webp` with a 990 x 742 photograph of sunlit orange dunes, snowy mountain faces, sparse clouds, and open brown grassland. The authoring copy is `guide.webp`; [credits](../assets/great-sand-dunes/CREDITS.md) distinguish this supplied reference from the older NPS photo. No exact peak identity, author, date, or license is inferred.

Use a centered cover crop into 1600 x 1000. Keep the warm light and deep violet dune shadows, cool mountain snow, and quiet sky. Reuse the shared flat-brush painter at its established stroke scale. Snow comes from this reference's color planes; the old snow refinement and old mountain coordinates do not apply.

## Motion

Yosemite's painted cloud banks travel only left to right, with recurring gaps between passes, against a pale blue sky. Their masks stop above the actual mountain silhouette. Six mapped dune crests shed short, broken-bristle sand veils. Six low foreground scrub cutouts sway around fixed roots. This reference has no visible river or tall cottonwoods, so the previous creek and mountain-foot fog layers are absent.

## Mobile and assets

Preserve the 160svh stage. Focus at .54 across the painting and start at .7 scroll to show the dunes and waving foreground together. Scrolling upward reveals the snowy peaks and more sky.

The scene uses the v12 painting, fallback, and paired live caches. Bake only Projects with `node scripts/bake-landscapes.cjs projects`. Test Projects at 1600 and 390 pixels, inspect stills and a short motion comparison, and verify that clouds stay behind the mountains. Normal visits use cached art, never the supplied photograph.

## Contrast and foreground brush (v9)

The user requested stronger separation between clouds, green foothills, snowy mountains, and sand, plus a foreground of waving brush. Sky blues sit behind warmer cloud highlights; cool mountain shadows recede behind richer green hills and orange dune faces. Color transitions follow mapped landforms and source light values. Five foreground shrub clumps use the shared broken-bristle painter and sway around fixed roots with a shared gust and smaller tip flutter. Mobile starts at .7 scroll so the moving foreground and dunes are visible together; scrolling upward reveals the peaks and clouds.

## Yosemite clouds and stronger sway (v10)

At the user's request, the sky is a richer blue field and the three cloud banks reuse the actual Yosemite cloud sprites from `yosemite-live-brush3.webp`. The authoring pass copies them into the dunes atlas, so normal visits need only the dunes live pack. Seven overlapping brush clumps frame the foreground; their stronger periodic sway visibly reverses direction while their bases remain fixed.


## Reference-matched scrub and paler sky (v11)

The user asked for a closer match to the supplied photograph and brush rather than leafy bushes. Tall invented shrub masses are removed. Low, irregular scrub is lifted from the actual painted foreground and accented with sparse dry bristle stalks in sampled ground colors. The sky is paler blue, foothills are muted brown-olive, and sand saturation is restrained. The scrub keeps its back-and-forth sway with fixed bases, and Yosemite cloud banks still pass left to right.


## Brush tips and middle-slope greenery (v12)

Short, ragged dry-bristle sprays give the foreground scrub fuller, brushy tips without creating leafy bushes. Small clusters of muted olive strokes sit only on the middle slopes, selected by their mapped position and subdued source colors. The greenery is baked into the terrain and stays fixed as cloud banks pass and low scrub sways. The pale sky and reference-based landscape palette remain in place.
