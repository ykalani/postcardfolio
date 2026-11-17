# Great Sand Dunes - Projects

Read [ART_DIRECTION.md](../ART_DIRECTION.md) and [the shared playbook](../LANDSCAPE_PLAYBOOK.md) before visual changes.

## Current reference and composition

The user replaced `assets/great-sand-dunes/fallback.webp` with a 990 x 742 photograph of sunlit orange dunes, snowy mountain faces, sparse clouds, and open brown grassland. The authoring copy is `guide.webp`; [credits](../assets/great-sand-dunes/CREDITS.md) distinguish this supplied reference from the older NPS photo. No exact peak identity, author, date, or license is inferred.

Use a centered cover crop into 1600 x 1000. Keep the warm light and deep violet dune shadows, cool mountain snow, and quiet sky. Reuse the shared flat-brush painter at its established stroke scale. Snow comes from this reference's color planes; the old snow refinement and old mountain coordinates do not apply.

## Motion

Sparse painted sky cutouts travel only left to right, with recurring gaps between passes. Their masks stop above the actual mountain silhouette. Six mapped dune crests shed short, broken-bristle sand veils. Low grass pigment sways gently around the bottom edge. This reference has no visible river or tall cottonwoods, so the previous creek, foliage, and mountain-foot fog layers are absent.

## Mobile and assets

Preserve the 160svh stage. Focus at .54 across the painting and start at the centered .5 scroll position to show the dunes and mountain faces together. Scrolling upward reveals more sky.

The scene uses the v8 painting, fallback, and paired live caches. Bake only Projects with `node scripts/bake-landscapes.cjs projects`. Test Projects at 1600 and 390 pixels, inspect stills and a short motion comparison, and verify that cloud sprites contain no mountain pigment. Normal visits use cached art, never the supplied photograph.
