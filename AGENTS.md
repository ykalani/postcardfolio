---
type: instructions
---

# Repository Instructions

Read [ART_DIRECTION.md](ART_DIRECTION.md) before making visual changes. All additions must match the project's established brush-painted style, including animated effects.

After changing any files in this repository, run the relevant checks, commit the changes, and deploy to Vercel production by default. Do not ask for confirmation unless the user explicitly requests a different workflow.

Use Playwright for browser automation, visual previews, and browser testing.


Scope browser tests to the change. Use Playwright only for the affected pages and viewport sizes needed to verify it, and inspect the resulting screenshots. For a branch-only visual change, check Yosemite on desktop and mobile, including a short motion comparison; do not run the full 24-view landscape suite. Run the broader suite when shared rendering, navigation, layout, or multiple landscapes change. For this focused check, set `SCENE_ROUTES=home` and `SCENE_WIDTHS=1600,390`, then run `npm run check:browser`. After deployment, verify the affected production page with Playwright.

Before deploying from a worktree, fetch `origin` and merge the completed work into the latest `origin/main`; push the integrated commit to `main` without force. Deploy that integrated commit, never a stale detached worktree. Preserve uncommitted work in other worktrees; use an isolated integration worktree when needed. Confirm the release contains both the previous `origin/main` and the completed feature commits.
