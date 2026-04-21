<p align="center"><img src="https://github.com/Mikaleb/LeCacheMisere/blob/main/public/favicon-128.png?raw=true" /></p>

# Le Cache Misère (LCM)

<div style="display: inline-flex;
  flex-wrap: wrap;gap: 0.2em;">

<a href="https://github.com/Mikaleb/LeCacheMisere"><img alt="GitHub Release" src="https://img.shields.io/github/v/release/Mikaleb/LeCacheMisere?style=flat-square&logo=github&logoColor=fff"></a>
<a href="https://chrome.google.com/webstore/detail/le-cache-misere/jphlfplfmjdbbjnegonboddmfgdkdkgi"><img alt="Chrome Web Store Users" src="https://img.shields.io/chrome-web-store/users/jphlfplfmjdbbjnegonboddmfgdkdkgi?style=flat-square&logo=googlechrome&logoColor=fff&color=%234285F4"></a>
<a href="https://addons.mozilla.org/en-US/firefox/addon/le-cache-mis%C3%A8re-lcm/"><img alt="Mozilla Add-on Users" src="https://img.shields.io/amo/users/le-cache-mis%C3%A8re-lcm?style=flat-square&logo=firefox&logoColor=%23FF7139&color=%23FF7139"></a>
![Static Badge](https://img.shields.io/badge/opera-awaiting-F78C40?style=flat-square&logo=opera&logoColor=red)

</div>

## Features

**Le Cache Misère (LCM)** is a browser extension that filters car listings on supported websites containing problematic engines (PureTech, BlueHDi 1.5, etc.). Two hiding modes:

- **Grey-out mode** — listings are dimmed, grayscaled, and struck through; still visible but clearly marked
- **Hide completely** — listings are fully removed and replaced by a slim placeholder bar showing the vehicle title; clicking the bar reveals the listing in a faded "reviewed" state with a re-hide button

### Supported websites

- <img src="https://lacentrale.fr/static/fragment-head/media/favicon-32.cc0580c7.png" style="width: 16px;">[LaCentrale](https://www.lacentrale.fr/)
- <img src="https://www.aramisauto.com/favicon.ico" style="width: 16px;">[AramisAuto](https://www.aramisauto.com/)
- <img src="https://www.leboncoin.fr/_next/static/media/favicon.2b8b94c9.ico" style="width: 16px;">[LeBonCoin](https://www.leboncoin.fr/)
- <img src="https://www.autosphere.fr/assets/ico/favicon.png?v=2" style="width: 16px;">[AutoSphere](https://www.autosphere.fr/)

### Settings

- Toggle filtering per website (on/off)
- Toggle filtering per motor type independently (PureTech, BlueHDi 1.5, THP, etc.)
- **Hide completely** — remove listings entirely and show a placeholder (default: on)
- **Show placeholder icon** — display the extension icon inside the placeholder bar

---

## Architecture

This is a **Manifest V3 browser extension** built with Vite + `@crxjs/vite-plugin`, React 18, MUI v6, and SCSS.

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
npm install
```

### Dev commands

| Command            | Description                                                      |
| ------------------ | ---------------------------------------------------------------- |
| `npm run dev`      | Chrome dev mode — Vite with HMR on port 5173                     |
| `npm run start:ff` | Firefox dev mode — watch build + auto-launch Firefox with reload |
| `npm run watch`    | Watch build → updates `dist/` on every save (no browser launch)  |
| `npm run build`    | TypeScript check + Vite build → `dist/`                          |
| `npm run lint`     | ESLint (TypeScript + React rules)                                |
| `npm run deploy`   | Build + zip → `le-cache-misere.zip`                              |
| `npm run release`  | Bump version, build, zip, push GitHub release                    |

### Contexts

| Context            | Entry point                | Purpose                                                                                 |
| ------------------ | -------------------------- | --------------------------------------------------------------------------------------- |
| **Popup**          | `src/main.tsx` → `App.tsx` | Settings UI — reads/writes `chrome.storage.sync`, sends messages to content scripts     |
| **Content script** | `src/content.tsx`          | Runs on supported sites — applies/removes `.lcm-disabled` CSS class on matched listings |

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
  hideCompletely: boolean; // default: true
  showPlaceholderIcon: boolean; // default: false
}
```

All keys are initialised on first load from `src/store/initialState.ts` if missing. `pattern` is a case-insensitive regex string compiled at runtime.

Default motors:

- `PureTech` — pattern: `puretech|pure[- ]tech`
- `BlueHDi 1.5` — pattern: `(?=.*1\.5)(?=.*blue[- ]?hdi)` (matches any order)

### How filtering works

1. On page load, the content script reads all storage keys and uses `initialState.ts` defaults for any that are missing
2. If the current URL matches an active website, active motor patterns are compiled into regexes
3. Vendor-specific selectors identify listing card containers; each card's full text + ARIA attributes are tested against the regexes
4. Matched cards either get `.lcm-disabled` (grey-out) or `.lcm-hide-completely` + a placeholder bar (hide mode), depending on the `hideCompletely` setting
5. Clicking a placeholder sets `data-lcm-user-show="true"` on the card — it reappears dimmed with a "Re-hide" button overlay
6. The popup sends partial state updates via `browser.tabs.sendMessage`; the content script also stays in sync via `browser.storage.onChanged` for cross-tab reactivity
7. A debounced `MutationObserver` re-runs filtering automatically when the page DOM changes (e.g. infinite scroll)

---

## Debugging

### Load the unpacked extension (Chrome)

1. Run `npm run build`
2. Open `chrome://extensions/`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** → select the `dist/` folder
5. After code changes, run `npm run build` again and click the refresh icon on the extension card

### Load the unpacked extension (Firefox)

Run `npm run start:ff` — this concurrently starts the watch build and launches Firefox with the extension auto-loaded and auto-reloaded on every `dist/` change.

### Inspect the popup

- **Chrome:** `chrome://extensions/` → click **Inspect views: popup.html** under the extension
- **Firefox:** `about:debugging` → click **Inspect** next to the extension → open popup manually

### Inspect the content script

Open DevTools on any supported site (F12) → **Console** tab. The content script runs in the page context, not the extension background.

### Inspect storage

In the extension's DevTools console (popup inspector):

```js
chrome.storage.sync.get(null, console.log);
```

To reset storage to defaults:

```js
chrome.storage.sync.clear();
```

---

## License

This project is licensed under the **PolyForm Noncommercial License 1.0.0**.

> [!IMPORTANT]
> **Commercial use is strictly prohibited without prior written permission from the author.**
> This includes using this code in any project intended for commercial advantage or monetary compensation.

For more details, see the [LICENSE](LICENSE) file.
