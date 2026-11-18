# Postcardfolio

Six expressive brush paintings for Yash Kalani’s portfolio, with visible flat-brush marks and simplified colors:

- Home: Yosemite.
- Experience (`/experiences`): Hawaiʻi Volcanoes.
- Projects (`/projects`): Great Sand Dunes.
- Writing: Pictured Rocks, using the supplied arch-and-kayaks photo.
- Tech Blog: Beaumont Tower.
- About: Lake Louise (Banff).

Plain HTML, CSS and JavaScript. Run `npm run dev` and `npm run check`. Playwright QA and baking commands are documented in [LANDSCAPE_PLAYBOOK.md](LANDSCAPE_PLAYBOOK.md), alongside the scene briefs and exact image credits.

Home opens through the painted clouds onto Yosemite. Home shows the name-and-stamp postcard; About shows a postcard with the profile links. The top-left × puts it away; the compact portrait slip brings it back. Run `node scripts/check-postcard.cjs` to verify the Home and About postcards.

Live at https://postcardfolio.vercel.app/ and https://yash.kalani.name/postcardfolio/. Preserve the main portfolio’s proxy routing. Normal visits load finished paintings and prebuilt live layers; photographic guides are local authoring assets.

About opens with its postcard up after the clouds reveal the painting. Close it to show the compact portrait slip in the corner; use the slip to reopen it. Location and institution labels appear on that compact slip.

Experience, Projects, Writing, and Tech Blog have a small receipt-like paper slip peeking up from the bottom, below navigation. Press it to unfold a tall paper panel with the painting still visible on both sides; the down arrow stays above the independently scrolling content and folds it away again. Section content lives inside each page’s `.paper-content` container. Projects and experience come from the sibling portfolio’s `yashOS/content.js`; the tech blog includes `blog/hello-world.md`, and Writing links to Substack. About contains the profile links only. Escape also closes the paper and returns focus to the slip. About instead uses its corner postcard for all 15 profiles from https://yash.kalani.name/links, with a painted stamp and an independently scrolling link list on smaller screens. Run `node scripts/check-about.cjs` for the focused About postcard check.
