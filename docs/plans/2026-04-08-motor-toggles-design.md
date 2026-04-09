# Motor Toggles & Visual Disabled Treatment — Design

**Date:** 2026-04-08

## Goal

Add a separate toggle for "diesel 1.5 BlueHDi" engines alongside the existing PureTech toggle. Change the visual behavior from hiding matched listings to rendering them as visually "disabled" (dimmed, grayscale, strikethrough) — for both motor and website toggles.

---

## Data Shape

`AppState.motors` typed as:

```ts
{ title: string; active: boolean; pattern: string }[]
```

`initialState.motors` pre-populated (PureTech moves here from the hardcoded array):

```ts
motors: [
  { title: "PureTech",   active: true, pattern: "puretech|pure[- ]tech" },
  { title: "BlueHDi 1.5", active: true, pattern: "(?=.*1\\.5)(?=.*blue[- ]?hdi)" },
]
```

`pattern` is compiled at runtime with flag `i`. Each motor matches independently.

---

## `toggleAd()` Changes

**Old signature:** `toggleAd(hide: boolean)`
**New signature:** `toggleAd(hide: boolean, activeMotors: { pattern: string }[])`

An element matches if **any** active motor's regex matches its text content:

```ts
const regexes = activeMotors.map(m => new RegExp(m.pattern, "i"));
// match: regexes.some(r => r.test(child.textContent))
```

The hardcoded `motorsToHide` array is removed entirely.

---

## Visual Treatment

The content script injects a `<style>` tag once with:

```css
.hp-disabled {
  opacity: 0.35;
  filter: grayscale(100%);
  pointer-events: none;
}
.hp-disabled * {
  text-decoration: line-through;
}
```

`hideElementDOM` adds `.hp-disabled` to the matched parent card. The "show" path removes it. No more inline `display` style manipulation.

This applies to **all** toggles — both per-website and per-motor.

---

## Content Script Wiring

**On page load (`main()`):** reads both `websites` and `motors` from storage, filters motors to active ones, passes them to `toggleAd()`.

**On message (`onMessage`):** handles `{ websites?, motors? }`. If `motors` present, re-runs `toggleAd` with the updated active motors list.

**Storage key:** `motors` (already fetched in `App` constructor).

---

## Popup UI

New "Motors" section below the websites list, using the same `Switch` + `FormControlLabel` pattern iterating over `this.state.motors`.

`toggleMotorStatus()` mirrors `toggleWebsiteStatus()`: flips `active`, saves to `chrome.storage.sync`, sends the **full updated motors array** to tabs so the content script can recompute active patterns cleanly.
