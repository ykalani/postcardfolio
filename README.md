# Postcardfolio

Six expressive brush paintings for Yash Kalani’s portfolio, with visible flat-brush marks and simplified colors:

- Home: Yosemite.
- Experience (`/experiences`): Hawaiʻi Volcanoes.
- Projects (`/projects`): Great Sand Dunes.
- Writing: Pictured Rocks, using the supplied arch-and-kayaks photo.
- Tech Blog: Beaumont Tower.
- About: Lake Louise (Banff).

Plain HTML, CSS and JavaScript. Run `npm run dev` and `npm run check`. Playwright QA and baking commands are documented in [LANDSCAPE_PLAYBOOK.md](LANDSCAPE_PLAYBOOK.md), alongside the scene briefs and exact image credits.

Home opens through the painted clouds, then a wide, light, textured postcard slides smoothly across the scene and lands in the center. Small screens show Yash Kalani’s name and portrait stamp, using `assets/pfp_stamp.webp`. The top-left × puts the card away on desktop and mobile; a compact light postcard with a PFP thumbnail brings it back. Run `node scripts/check-postcard.cjs` for the focused Playwright animation and interaction check.

Live at https://postcardfolio.vercel.app/ and https://yash.kalani.name/postcardfolio/. Preserve the main portfolio’s proxy routing. Normal visits load finished paintings and prebuilt live layers; photographic guides are local authoring assets.

Every section except home has a postcard-width paper slip above navigation. Press it to unfold a full-screen paper; the down arrow stays above the independently scrolling content and folds it away again. Add section content inside that page's `.paper-content` container. Escape also closes the paper and returns focus to the slip. Run `node scripts/check-paper.cjs` for the desktop/mobile interaction check.
