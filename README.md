# Postcardfolio — Yosemite

A living, full-screen brush painting of Yosemite Valley. The current build focuses on the landscape: clouds drift above Half Dome, Bridalveil Fall flows, and a foreground pine moves in a shared breeze.

Plain HTML, CSS and JavaScript. No runtime dependencies or build step. Run `npm run dev` and open http://localhost:5173. Run `npm run check` for syntax, assets and resource references.

The original postcard is preserved in `archive/postcard/`, excluded from Vercel deployment. The résumé is retained locally in that archive and ignored by Git.

The terrain is painted with multiscale bristle strokes sampled from a CC0 photographic guide. `assets/yosemite-painting.webp` caches the initial coat. Separate cached cloud and pine brushwork provides stable animation. Reduced motion is supported; hidden tabs stop drawing.

To regenerate the terrain cache after changes, call `await window.paintLandscape()` in the browser and save the data URL from `window.exportPainting()` to `assets/yosemite-painting.webp`. If the cache is missing, the browser rebuilds it automatically. If the guide fails to load, the cached painting remains available.

See `assets/CREDITS.md` for image provenance and licensing.
