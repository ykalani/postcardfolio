# Postcardfolio
A living, full screen brush painting of Yosemite Valley.

Plain HTML, CSS and JavaScript

See `assets/CREDITS.md` for image provenance and licensing.

Normal visits load a saved finished painting first, then prebuilt live-layer atlases for the visible crop. The reference photo stays local-authoring-only and is excluded from deployment. Cloud-curtain textures load only on writing-link intent. Asset preparation: run the local server, set PLAYWRIGHT_MODULE if needed, then run `node scripts/bake-assets.cjs`. See LANDSCAPE_PLAYBOOK.md for full details.
