# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Chrome dev mode (Vite HMR on port 5173)
npm run dev-ff     # Firefox dev mode (watch build, no HMR)
npm run build      # TypeScript check + Vite build → dist/
npm run lint       # ESLint (TypeScript + React rules)
npm run deploy     # build + zip → hide-puretech.zip
npm run release    # Bump version, build, zip, push GitHub release
```

No test suite exists yet.

## Architecture

This is a **Manifest V3 browser extension** built with Vite + `@crxjs/vite-plugin`, React 18 (class components), MUI v6, and SCSS.

### Two independent execution contexts

| Context | Entry point | Purpose |
|---|---|---|
| **Popup** | `src/main.tsx` → `App.tsx` | Settings UI; reads/writes `chrome.storage.sync`, sends messages to content scripts |
| **Content script** | `src/content.tsx` | Runs on supported car-listing sites; hides PureTech ads in the DOM |

The popup communicates with live tabs via `browser.tabs.sendMessage`. The content script also reads `browser.storage.sync` directly on page load for its initial state.

### Adding a new supported website

1. Add a URL pattern to `manifest.json` → `content_scripts[].matches`
2. Add the site entry to `src/store/initialState.ts` → `websites[]`
3. Add the vendor enum value to `src/types/vendors.d.ts` → `Vendors`
4. Add a `case` in the `Vendor` constructor in `src/utils/motorHiddingMethods.ts` with the correct `parentClasses` (and optionally `adClasses`) for that site's DOM structure
5. Handle `show`/`hide` logic in `toggleAd()` if the site needs custom display restoration

### Key design notes

- `browser` global is `declare`d as `any` for cross-browser compatibility (Chrome uses `chrome`, Firefox uses `browser`). The popup uses `chrome.*` APIs for storage/tabs and `browser.*` for messaging — this is intentional.
- `motorHiddingMethods.ts` contains `Vendor` class (local to the file, not exported) that maps vendor names to DOM class names used to identify ad containers.
- Version is managed by `release-it` + `@release-it/bumper`, which bumps `manifest.json` directly. Do **not** manually edit the `version` field in `manifest.json` or `package.json` — run `npm run release` instead.
- The `dist/` folder is the unpacked extension. Load it in `chrome://extensions` with Developer Mode enabled.
