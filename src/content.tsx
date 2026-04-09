import { initialState } from "./store/initialState";
import { AppState, Motor } from "./types/state";
import { toggleAd } from "./utils/motorHiddingMethods";

declare const browser: any;

const url = location.href;

let currentWebsites = initialState.websites;
let currentMotors = initialState.motors;
let hideCompletely = initialState.hideCompletely;
let showPlaceholderIcon = initialState.showPlaceholderIcon;
let showBadgeCount = initialState.showBadgeCount;

function findUrlSettings(websites: any, url: string): any {
  const convertWildcardToRegex = (pattern: string) =>
    new RegExp("^" + pattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$");
  return websites.find((website: { url: string }) =>
    convertWildcardToRegex(website.url).test(url)
  );
}

const runToggle = async () => {
  const matchedWebsite = findUrlSettings(currentWebsites, url);
  if (!matchedWebsite) return;

  const activeMotors = matchedWebsite.active
    ? currentMotors.filter((m: Motor) => m.active)
    : [];
  
  await toggleAd(matchedWebsite.active && activeMotors.length > 0, activeMotors, hideCompletely, showPlaceholderIcon);

  const count = document.querySelectorAll('[data-lcm-disabled="true"]').length;
  browser.runtime.sendMessage({ action: "updateBadge", count, showBadgeCount }).catch(() => {});
};

const debouncedToggle = debounce(runToggle, 300);
let observer: MutationObserver | null = null;

function setupObserver() {
  if (observer) observer.disconnect();
  observer = new MutationObserver(debouncedToggle);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [
      "class", 
      "data-lcm-disabled", 
      "aria-label", 
      "title", 
      "alt"
    ],
  });
}

browser.runtime.onMessage.addListener(
  (
    message: Partial<AppState>,
    _sender: any,
    sendResponse: (arg0: { status: string; count?: number }) => void
  ) => {
    if (message.websites) {
      // If it's a full list, replace. If it's a partial list (one site), we might want to merge,
      // but App.tsx currently sends the specific site for that tab.
      // For simplicity and robustness, we'll favor storage.onChanged for full sync.
      if (Array.isArray(message.websites) && message.websites.length === 1) {
        const site = message.websites[0];
        currentWebsites = currentWebsites.map(w => w.title === site.title ? site : w);
      } else if (Array.isArray(message.websites)) {
        currentWebsites = message.websites;
      }
    }
    if (message.motors) currentMotors = message.motors;
    if (message.hideCompletely !== undefined) hideCompletely = message.hideCompletely;
    if (message.showPlaceholderIcon !== undefined) showPlaceholderIcon = message.showPlaceholderIcon;
    if (message.showBadgeCount !== undefined) showBadgeCount = message.showBadgeCount;

    if ((message as any).action === "getHiddenCount") {
      const count = document.querySelectorAll('[data-lcm-disabled="true"]').length;
      sendResponse({ status: "received", count });
      return;
    }

    runToggle();
    sendResponse({ status: "received" });
  }
);

// High-fidelity reactivity via storage changes
browser.storage.onChanged.addListener((changes: any, area: string) => {
  if (area === "sync") {
    if (changes.websites) currentWebsites = changes.websites.newValue;
    if (changes.motors) currentMotors = changes.motors.newValue;
    if (changes.hideCompletely) hideCompletely = changes.hideCompletely.newValue;
    if (changes.showPlaceholderIcon) showPlaceholderIcon = changes.showPlaceholderIcon.newValue;
    if (changes.showBadgeCount) showBadgeCount = changes.showBadgeCount.newValue;
    runToggle();
  }
});

function debounce(func: Function, wait: number) {
  let timeout: number | null = null;
  return (...args: any[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), wait);
  };
}

function main() {
  browser.storage.sync.get(
    ["websites", "motors", "hideCompletely", "showPlaceholderIcon", "showBadgeCount"],
    (results: { websites?: any; motors?: Motor[]; hideCompletely?: boolean; showPlaceholderIcon?: boolean; showBadgeCount?: boolean }) => {
      if (results.websites) currentWebsites = results.websites;
      if (results.motors) currentMotors = results.motors;
      if (results.hideCompletely !== undefined) hideCompletely = results.hideCompletely;
      if (results.showPlaceholderIcon !== undefined) showPlaceholderIcon = results.showPlaceholderIcon;
      if (results.showBadgeCount !== undefined) showBadgeCount = results.showBadgeCount;

      runToggle();
      setupObserver();
    }
  );
}

main();

