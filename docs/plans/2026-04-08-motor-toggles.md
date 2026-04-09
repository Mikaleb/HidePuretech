# Motor Toggles & Visual Disabled Treatment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a per-motor toggle system (PureTech + BlueHDi 1.5) and replace the hide-from-DOM behavior with a visual "disabled" treatment (dimmed, grayscale, strikethrough) across all toggles.

**Architecture:** Motors are stored as `{ title, active, pattern }[]` in `chrome.storage.sync`. The content script compiles each active motor's regex pattern at runtime and applies/removes a `.hp-disabled` CSS class on matched listing cards. The popup renders motor toggles alongside the existing website toggles.

**Tech Stack:** TypeScript, React 18 (class components), MUI v6, Manifest V3, Vite + @crxjs/vite-plugin. No test suite exists — verification is manual via `npm run dev` + loading the unpacked extension.

---

### Task 1: Type the `motors[]` array

**Files:**
- Modify: `src/types/state.d.ts`

**Step 1: Replace the `motors: any[]` line**

```ts
// src/types/state.d.ts
export type Motor = {
  title: string;
  active: boolean;
  pattern: string;
};

export type AppState = {
  loading: boolean;
  newMotor?: { title: string };
  newWebsite?: {
    title: string;
    url: string;
    active: boolean;
  };
  motors: Motor[];
  websites: {
    title: string;
    url: string;
    active: boolean;
  }[];
};
```

**Step 2: Verify TypeScript is happy**

```bash
npm run build
```
Expected: no type errors related to `motors`.

**Step 3: Commit**

```bash
git add src/types/state.d.ts
git commit -m "feat(types): type motors array as Motor[]"
```

---

### Task 2: Populate `initialState.motors`

**Files:**
- Modify: `src/store/initialState.ts`

**Step 1: Replace the empty `motors: []`**

```ts
// src/store/initialState.ts
import { Motor } from "../types/state";

export const initialState = {
  loading: false,
  motors: [
    { title: "PureTech",    active: true, pattern: "puretech|pure[- ]tech" },
    { title: "BlueHDi 1.5", active: true, pattern: "(?=.*1\\.5)(?=.*blue[- ]?hdi)" },
  ] as Motor[],
  websites: [
    { title: "lacentrale.fr",  url: "https://*.lacentrale.fr/*",  active: true },
    { title: "aramisauto.com", url: "https://*.aramisauto.com/*", active: true },
    { title: "leboncoin.fr",   url: "https://*.leboncoin.fr/*",   active: true },
    { title: "autosphere.fr",  url: "https://*.autosphere.fr/*",  active: true },
  ],
};
```

**Step 2: Build to verify**

```bash
npm run build
```
Expected: clean build.

**Step 3: Commit**

```bash
git add src/store/initialState.ts
git commit -m "feat(store): populate motors with PureTech and BlueHDi 1.5 defaults"
```

---

### Task 3: Rewrite `motorHiddingMethods.ts`

This is the core change. Remove the hardcoded `motorsToHide` array, inject the `.hp-disabled` style once, and accept `activeMotors` as a parameter.

**Files:**
- Modify: `src/utils/motorHiddingMethods.ts`

**Step 1: Replace the entire file**

```ts
import { Vendors } from "../types/vendors";
import { Motor } from "../types/state";

const HP_CLASS = "hp-disabled";

function injectStyle() {
  if (document.getElementById("hp-style")) return;
  const style = document.createElement("style");
  style.id = "hp-style";
  style.textContent = `
    .${HP_CLASS} {
      opacity: 0.35;
      filter: grayscale(100%);
      pointer-events: none;
    }
    .${HP_CLASS} * {
      text-decoration: line-through;
    }
  `;
  document.head.appendChild(style);
}

function getVendorFromUrl(url: string): Vendor {
  if (url.includes("lacentrale")) return new Vendor(Vendors.LaCentrale);
  if (url.includes("aramisauto")) return new Vendor(Vendors.AramisAuto);
  if (url.includes("leboncoin")) return new Vendor(Vendors.LeBonCoin);
  if (url.includes("autosphere")) return new Vendor(Vendors.AutoSphere);
  return new Vendor(Vendors.LaCentrale);
}

class Vendor {
  constructor(
    public name: Vendors,
    public parentClasses: string[] = [],
    public adClasses: string[] = []
  ) {
    switch (name) {
      case Vendors.LeBonCoin:
        this.parentClasses = ["mb-lg"];
        break;
      case Vendors.LaCentrale:
        this.parentClasses = ["searchCard", "listingContainer", "searchCardContainer"];
        this.adClasses = ["lien-fiche", "link_veh"];
        break;
      case Vendors.AutoSphere:
        this.parentClasses = ["thumbnail_vehicle", "fiche-synth", "fiche-synth\n"];
        break;
      case Vendors.AramisAuto:
        this.parentClasses = [];
        break;
      default:
        this.parentClasses = [];
        this.adClasses = [];
    }
  }
}

function getParentCard(vendor: Vendor, element: Element): HTMLElement | null {
  let parent = element.parentElement;
  while (
    parent &&
    !vendor.parentClasses.some((cls) => parent?.classList.contains(cls))
  ) {
    parent = parent.parentElement;
  }
  return parent;
}

function disableElement(vendor: Vendor, element: Element) {
  if (!(element instanceof HTMLElement)) return;
  element.classList.add(HP_CLASS);
  const parent = getParentCard(vendor, element);
  if (parent) parent.classList.add(HP_CLASS);
}

function enableElement(vendor: Vendor, element: HTMLElement) {
  element.classList.remove(HP_CLASS);
  const parent = getParentCard(vendor, element);
  if (parent) parent.classList.remove(HP_CLASS);
}

/**
 * Toggle visibility of car ads matching any active motor pattern.
 */
export function toggleAd(hide: boolean, activeMotors: Motor[]) {
  injectStyle();

  const regexes = activeMotors.map((m) => new RegExp(m.pattern, "i"));
  const matches = (text: string) => regexes.some((r) => r.test(text));

  const vendor = getVendorFromUrl(window.location.href);

  if (vendor.name === Vendors.AutoSphere) {
    const carAdsWithLinks = document.querySelectorAll(
      vendor.adClasses.map((cls) => `a.${cls}`).join(", ")
    );
    carAdsWithLinks.forEach((element) => {
      element.childNodes.forEach((child) => {
        if (child.textContent && matches(child.textContent)) {
          hide
            ? disableElement(vendor, element)
            : enableElement(vendor, element as HTMLElement);
        }
      });
    });
  } else {
    document.querySelectorAll("a").forEach((element) => {
      element.querySelectorAll("div").forEach((child) => {
        if (child.textContent && matches(child.textContent)) {
          hide
            ? disableElement(vendor, element)
            : enableElement(vendor, element as HTMLElement);
        }
      });
    });
  }
}
```

**Step 2: Build to verify**

```bash
npm run build
```
Expected: clean build, no TypeScript errors.

**Step 3: Commit**

```bash
git add src/utils/motorHiddingMethods.ts
git commit -m "feat(motor): replace hide with hp-disabled CSS class, accept activeMotors param"
```

---

### Task 4: Wire motors in the content script

**Files:**
- Modify: `src/content.tsx`

**Step 1: Update `main()` to read and pass `motors`**

```tsx
import { initialState } from "./store/initialState";
import { AppState, Motor } from "./types/state";
import { toggleAd } from "./utils/motorHiddingMethods";

declare const browser: any;

const url = location.href;

function findUrlSettings(websites: any, url: string): any {
  const convertWildcardToRegex = (pattern: string) =>
    new RegExp("^" + pattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$");
  return websites.find((website: { url: string }) =>
    convertWildcardToRegex(website.url).test(url)
  );
}

browser.runtime.onMessage.addListener(
  (
    message: Partial<AppState>,
    sender: any,
    sendResponse: (arg0: {
      status: string;
      message: Partial<AppState>;
      sender: any;
      sendResponse: any;
    }) => void
  ) => {
    if (message.websites || message.motors) {
      const websites = message.websites ?? initialState.websites;
      const motors: Motor[] = message.motors ?? initialState.motors;

      const matchedSite = findUrlSettings(websites, url);
      if (!matchedSite) return;

      const activeMotors = matchedSite.active
        ? motors.filter((m) => m.active)
        : [];

      toggleAd(matchedSite.active && activeMotors.length > 0, activeMotors);
    }

    sendResponse({ status: "received", message, sender, sendResponse });
  }
);

function main() {
  browser.storage.sync.get(
    ["websites", "motors"],
    (results: { websites?: any; motors?: Motor[] }) => {
      let { websites, motors } = results;

      if (!websites) {
        websites = initialState.websites;
        browser.storage.sync.set({ websites });
      }
      if (!motors) {
        motors = initialState.motors;
        browser.storage.sync.set({ motors });
      }

      const matchedWebsite = findUrlSettings(websites, url);
      if (!matchedWebsite) return;

      const activeMotors = matchedWebsite.active
        ? motors.filter((m: Motor) => m.active)
        : [];

      toggleAd(matchedWebsite.active && activeMotors.length > 0, activeMotors);
    }
  );
}

main();
```

**Step 2: Build to verify**

```bash
npm run build
```
Expected: clean build.

**Step 3: Commit**

```bash
git add src/content.tsx
git commit -m "feat(content): wire motors into toggleAd on load and message receive"
```

---

### Task 5: Add motor toggles to the popup UI

**Files:**
- Modify: `src/App.tsx`

**Step 1: Add `toggleMotorStatus` method and motors section to render**

Below `toggleWebsiteStatus`, add:

```tsx
toggleMotorStatus = (motor: AppState["motors"][0]) => {
  this.setState((prevState) => {
    const motors = prevState.motors.map((m) =>
      m.title === motor.title ? { ...m, active: !m.active } : m
    );
    chrome.storage.sync.set({ motors });
    this.sendMessageToContentScript({ motors });
    return { motors };
  });
};
```

In `sendMessageToContentScript`, the existing `newState.websites` query handles tab targeting. When sending only `motors`, we need tabs — update the method to also accept motors-only messages by querying all content-script tabs when `websites` is absent:

```tsx
sendMessageToContentScript = async (newState: Partial<AppState>) => {
  const urlPatterns = newState.websites
    ? newState.websites.map((website) => website.url)
    : this.state.websites.map((website) => website.url);

  const tabs = await chrome.tabs.query({ url: urlPatterns });

  tabs.forEach((tab: any) => {
    if (!tab.id || tab.id === undefined) return;
    browser.tabs
      .sendMessage(tab.id, newState)
      .then((response: { title: any; url: any }) => {
        console.info(
          "Popup received response from tab with title '%s' and url %s",
          response.title,
          response.url
        );
      })
      .catch((error: any) => {
        console.warn("Popup could not send message to tab %d", tab.id, error);
      });
  });
};
```

In the `render()` method, add a motors section after the websites `Container`:

```tsx
<Container
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  }}
  maxWidth="xs"
>
  <Typography
    align="left"
    variant="subtitle2"
    style={{ padding: "0.8em 1em" }}
    className="info"
  >
    Motors
  </Typography>

  {this.state.motors.map((motor) => (
    <Container key={motor.title}>
      <FormGroup>
        <FormControlLabel
          label={motor.title}
          control={
            <Switch
              value={motor.active ? "on" : "off"}
              checked={motor.active}
              disabled={this.state.loading !== false}
              onClick={() => {
                if (this.state.loading === false) {
                  this.toggleMotorStatus(motor);
                }
              }}
            />
          }
        />
      </FormGroup>
    </Container>
  ))}
</Container>
```

**Step 2: Build to verify**

```bash
npm run build
```
Expected: clean build.

**Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat(popup): add per-motor toggle UI and toggleMotorStatus handler"
```

---

### Task 6: Manual end-to-end verification

**Step 1: Build and load**

```bash
npm run build
```

Load `dist/` as unpacked extension in `chrome://extensions` (Developer Mode on). If already loaded, click the refresh icon.

**Step 2: Test motor toggle on a supported site**

1. Open `lacentrale.fr` (or any supported site) and search for cars.
2. Listings mentioning "PureTech" or "1.5 BlueHDi" should appear dimmed (opacity 0.35, grayscale, strikethrough).
3. Open the extension popup. Disable "PureTech" — those listings should restore to normal.
4. Disable "BlueHDi 1.5" — those listings should restore. Re-enable — they go dim again.
5. Disable a website toggle — all listings on that site should restore.

**Step 3: Commit if any tweaks were made**

```bash
git add -p
git commit -m "fix: adjust visual treatment based on manual testing"
```

---

### Task 7: Release

```bash
npm run release
```

Follow `release-it` prompts to bump version, build, zip, and push GitHub release.
