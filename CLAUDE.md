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
3. Add the vendor enum value to `src/types/vendors.ts` → `Vendors`
4. Add a `case` in the `Vendor` constructor in `src/utils/vendors/vendorManager.ts` with `parentClasses`, `adClasses`, and `titleSelector` for the site's DOM
5. Add the URL substring to `getVendorFromUrl()` in the same file

### Storage schema (`chrome.storage.sync`)

Keys: `websites`, `motors`, `hideCompletely`, `showPlaceholderIcon`. Defined in `src/store/initialState.ts`. The content script listens to `browser.storage.onChanged` for live updates and also receives partial state via `browser.runtime.onMessage`.

### Content script state flow

`content.tsx` initializes from storage on load, then stays reactive via two channels:
- `browser.storage.onChanged` — authoritative, handles cross-tab sync
- `browser.runtime.onMessage` — used by the popup for immediate tab-level updates

`toggleAd()` is debounced (300 ms) and re-runs on every DOM mutation via `MutationObserver`.

### DOM class naming

All injected classes and IDs use the `hp-` prefix (constants in `src/utils/constants.ts`): `hp-disabled`, `hp-hide-completely`, `hp-hidden-placeholder`, `hp-rehide-btn`, `hp-style`, `hp-loading-spinner`. Data attributes: `data-hp-disabled`, `data-hp-user-show`, `data-hp-motor`.

### Key design notes

- `browser` global is `declare`d as `any` for cross-browser compatibility. The popup uses `chrome.*` for storage/tabs and `browser.*` for messaging — intentional.
- `hideCompletely` mode inserts a thin placeholder row before each hidden card; clicking it sets `data-hp-user-show="true"` to reveal and dim the card with a "Re-hide" button overlay.
- Version is managed by `release-it` + `@release-it/bumper`, which bumps `manifest.json` directly. Do **not** manually edit the `version` field in `manifest.json` or `package.json` — run `npm run release` instead.
- The `dist/` folder is the unpacked extension. Load it in `chrome://extensions` with Developer Mode enabled.
