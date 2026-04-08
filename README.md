<p align="center"><img src="https://github.com/Mikaleb/HidePuretech/blob/main/public/icon128.png?raw=true" /></p>

# Hide PureTech

<div style="display: inline-flex;
  flex-wrap: wrap;gap: 0.2em;">

<a href="https://github.com/Mikaleb/HidePuretech"><img alt="GitHub Release" src="https://img.shields.io/github/v/release/Mikaleb/HidePuretech?style=flat-square&logo=github&logoColor=fff"></a>
<a href="https://chrome.google.com/webstore/detail/hide-puretech/jphlfplfmjdbbjnegonboddmfgdkdkgi"><img alt="Chrome Web Store Users" src="https://img.shields.io/chrome-web-store/users/jphlfplfmjdbbjnegonboddmfgdkdkgi?style=flat-square&logo=googlechrome&logoColor=fff&color=%234285F4"></a>
<a href="https://addons.mozilla.org/fr/firefox/addon/hide-puretech/"><img alt="Mozilla Add-on Users" src="https://img.shields.io/amo/users/hide-puretech?style=flat-square&logo=firefox&logoColor=%23FF7139&color=%23FF7139"></a>
![Static Badge](https://img.shields.io/badge/opera-awaiting-F78C40?style=flat-square&logo=opera&logoColor=red)

</div>

## Features

HidePuretech is a browser extension that visually disables car listings on supported websites that contain problematic engines (PureTech, BlueHDi 1.5). Matched listings are dimmed, grayscaled, and struck through — still visible but clearly marked.

### Supported websites

- <img src="https://lacentrale.fr/static/fragment-head/media/favicon-32.cc0580c7.png" style="width: 16px;">[LaCentrale](https://www.lacentrale.fr/)
- <img src="https://www.aramisauto.com/favicon.ico" style="width: 16px;">[AramisAuto](https://www.aramisauto.com/)
- <img src="https://www.leboncoin.fr/_next/static/media/favicon.2b8b94c9.ico" style="width: 16px;">[LeBonCoin](https://www.leboncoin.fr/)
- <img src="https://www.autosphere.fr/assets/ico/favicon.png?v=2" style="width: 16px;">[AutoSphere](https://www.autosphere.fr/)

### Settings

- Toggle filtering per website (on/off)
- Toggle filtering per motor type independently (PureTech, BlueHDi 1.5)

---

## Architecture

This is a **Manifest V3 browser extension** built with Vite + `@crxjs/vite-plugin`, React 18 (class components), MUI v6, and SCSS.

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
npm install
```

### Dev commands

| Command           | Description                                   |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Chrome dev mode — Vite with HMR on port 5173  |
| `npm run dev:ff`  | Firefox dev mode — Launches Firefox with auto-reload |
| `npm run watch`   | Watch build → updates `dist/` on every save   |
| `npm run build`   | TypeScript check + Vite build → `dist/`       |
| `npm run lint`    | ESLint (TypeScript + React rules)             |
| `npm run deploy`  | Build + zip → `hide-puretech.zip`             |
| `npm run release` | Bump version, build, zip, push GitHub release |

### Architecture

Two independent execution contexts:

| Context            | Entry point                | Purpose                                                                                |
| ------------------ | -------------------------- | -------------------------------------------------------------------------------------- |
| **Popup**          | `src/main.tsx` → `App.tsx` | Settings UI — reads/writes `chrome.storage.sync`, sends messages to content scripts    |
| **Content script** | `src/content.tsx`          | Runs on supported sites — applies/removes `.hp-disabled` CSS class on matched listings |

The popup communicates with live tabs via `browser.tabs.sendMessage`. The content script also reads `browser.storage.sync` directly on page load for its initial state.

### Storage schema (`chrome.storage.sync`)

```ts
{
  websites: {
    title: string;
    url: string;
    active: boolean;
  }
  [];
  motors: {
    title: string;
    active: boolean;
    pattern: string;
  }
  [];
}
```

Both keys are initialised on first load from `src/store/initialState.ts` if missing. `pattern` is a regex string compiled at runtime with flag `i`.

Default motors:

- `PureTech` — pattern: `puretech|pure[- ]tech`
- `BlueHDi 1.5` — pattern: `(?=.*1\.5)(?=.*blue[- ]?hdi)` (matches any order)

### How filtering works

1. On page load, the content script reads `websites` and `motors` from storage
2. If the current URL matches an active website, active motor patterns are compiled into regexes
3. All `<a>` elements (or vendor-specific selectors) are scanned — if any child `div` text matches a regex, the listing's parent card gets `.hp-disabled`
4. `.hp-disabled` applies: `opacity: 0.35`, `filter: grayscale(100%)`, `pointer-events: none`, `text-decoration: line-through` on children
5. Toggling from the popup sends a message with the full `websites` + `motors` state; the content script re-runs the filter

### Adding a new supported website

1. Add a URL pattern to `manifest.json` → `content_scripts[].matches`
2. Add the site entry to `src/store/initialState.ts` → `websites[]`
3. Add the vendor enum value to `src/types/vendors.ts` → `Vendors`
4. Add a `case` in the `Vendor` constructor in `src/utils/motorHiddingMethods.ts` with the correct `parentClasses` (CSS classes of the listing card container) and optionally `adClasses` (CSS classes of the `<a>` link element if vendor-specific querying is needed)

### Adding a new motor filter

Add an entry to `src/store/initialState.ts` → `motors[]`:

```ts
{ title: "My Engine", active: true, pattern: "my.?engine|myengine" }
```

`pattern` is a case-insensitive regex. Use lookaheads for multi-word AND matching:

```ts
pattern: "(?=.*word1)(?=.*word2)";
```

---

## Debugging

### Load the unpacked extension (Chrome)

1. Run `npm run build`
2. Open `chrome://extensions/`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** → select the `dist/` folder
5. After code changes, run `npm run build` again and click the refresh icon on the extension card

### Load the unpacked extension (Firefox)

1. In one terminal, run `npm run watch` to automatically rebuild the extension on changes.
2. In a second terminal, run `npm run dev:ff`.
3. Firefox will launch automatically with the extension loaded and will auto-reload whenever `dist/` is updated.

### Inspect the popup

- **Chrome:** `chrome://extensions/` → click **Inspect views: popup.html** under the extension
- **Firefox:** `about:debugging` → click **Inspect** next to the extension → open popup manually

### Inspect the content script

Open DevTools on any supported site (F12) → **Console** tab. The content script logs to the page's console, not the extension's background console.

Look for:

```
🚀 ~ toggleAd ~ carAdsWithLinks: NodeList [...]
```

### Inspect storage

In the extension's DevTools console (popup inspector):

```js
chrome.storage.sync.get(null, console.log);
```

To reset storage to defaults:

```js
chrome.storage.sync.clear();
```

Then reload the page — defaults from `initialState.ts` will be written on next load.

### Common issues

| Symptom                                                | Likely cause                                           | Fix                                                               |
| ------------------------------------------------------ | ------------------------------------------------------ | ----------------------------------------------------------------- |
| Nothing is hidden on a supported site                  | Website toggle is off, or no motors are active         | Open popup, check toggles                                         |
| Extension not reacting after code change               | `dist/` not rebuilt                                    | Run `npm run build`, then refresh extension                       |
| `Could not resolve "../types/vendors"` build error     | `vendors.ts` missing or renamed to `.d.ts`             | Ensure file is `src/types/vendors.ts` (not `.d.ts`)               |
| Storage shows old motor list after adding a new motor  | Storage was already initialised                        | Run `chrome.storage.sync.clear()` in popup inspector, then reload |
| Listings re-enable on motor toggle but not site toggle | Expected — site toggle also sends current motors state | No action needed                                                  |

---

### Roadmap

- [ ] Add support for more languages
- [ ] Add support for more engines
- [ ] i18n the "Motors" section label in the popup
