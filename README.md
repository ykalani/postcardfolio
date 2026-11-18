# Postcardfolio
- Home: Yosemite.
- Experience (`/experiences`): Hawaiʻi Volcanoes.
- Projects (`/projects`): Great Sand Dunes.
- Writing: Pictured Rocks, using the supplied arch-and-kayaks photo.
- Tech Blog: Beaumont Tower.
- About: Lake Louise (Banff).

Plain HTML, CSS and JavaScript. 

## Repository layout

- Root HTML files are the public routes. They share styles and navigation scripts.
- `scenes/` contains landscape renderers. `assets/` holds the active art, references, and credits.
- `scripts/` contains artwork baking tools and browser checks. `landscapes/` contains scene briefs.
- `archive/` contains the original postcard prototype and superseded landscape exports. Vercel excludes it. Local comparisons can still load archived artwork.

Keep both ignore files in Git. `.gitignore` filters local files before staging. `.vercelignore` excludes development files and archived artwork from deployment.
