# Postcardfolio

Six expressive brush paintings for Yash Kalani’s portfolio, with visible flat-brush marks and simplified colors:

- Home: Yosemite.
- Experience (`/experiences`): Hawaiʻi Volcanoes.
- Projects (`/projects`): Great Sand Dunes.
- Writing: Banff.
- Tech Blog: Beaumont Tower.
- About: Pictured Rocks, using the supplied arch-and-kayaks photo.

Plain HTML, CSS and JavaScript. Run `npm run dev` and `npm run check`. Playwright QA and baking commands are documented in [LANDSCAPE_PLAYBOOK.md](LANDSCAPE_PLAYBOOK.md), alongside the scene briefs and exact image credits.

Home opens through the painted clouds, then a wide, light, textured postcard loops across the scene and lands in the center. Small screens show only Yash Kalani’s name and the stamp area. Its stamp space is intentionally blank. On desktop, “Enjoy the view” puts the card away; the small postcard button brings it back. Run `node scripts/check-postcard.cjs` for the focused Playwright animation and interaction check.

Live at https://postcardfolio.vercel.app/ and https://yash.kalani.name/postcardfolio/. Preserve the main portfolio’s proxy routing. Normal visits load finished paintings and prebuilt live layers; photographic guides are local authoring assets.
