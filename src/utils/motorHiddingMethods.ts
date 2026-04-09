import { Motor } from "../types/state";
import {
  LCM_CLASS,
  LCM_HIDE_CLASS,
  LCM_PLACEHOLDER_CLASS,
  LCM_REHIDE_BTN_CLASS,
} from "./constants";
import { injectStyle, showSpinner, hideSpinner } from "./domUtils";
import {
  getVendorFromUrl,
  getParentCard,
  Vendor,
} from "./vendors/vendorManager";

declare const chrome: any;

function disableElement(
  vendor: Vendor,
  element: HTMLElement,
  hideCompletely: boolean,
  showPlaceholderIcon: boolean,
) {
  const parent = getParentCard(vendor, element) || element;

  // If we are NOT in hideCompletely mode anymore, ensure any leftover placeholders are removed
  if (!hideCompletely) {
    if (
      parent.previousElementSibling?.classList.contains(LCM_PLACEHOLDER_CLASS)
    ) {
      parent.previousElementSibling.remove();
    }
    // Also remove re-hide button if switching back to grey-out mode
    const rehideBtn = parent.querySelector(`.${LCM_REHIDE_BTN_CLASS}`);
    if (rehideBtn) rehideBtn.remove();
  }

  // Check if the user has already expanded this ad
  if (parent.getAttribute("data-lcm-user-show") === "true") {
    parent.classList.add(LCM_CLASS); // Still keep it greyed out
    parent.classList.remove(LCM_HIDE_CLASS); // Remove hiding
    parent.setAttribute("data-lcm-disabled", "true");

    // Ensure placeholder is gone if it somehow stayed
    if (
      parent.previousElementSibling?.classList.contains(LCM_PLACEHOLDER_CLASS)
    ) {
      parent.previousElementSibling.remove();
    }

    // Inject "Re-hide" button if not present
    if (!parent.querySelector(`.${LCM_REHIDE_BTN_CLASS}`)) {
      const rehideBtn = document.createElement("button");
      rehideBtn.className = LCM_REHIDE_BTN_CLASS;
      rehideBtn.textContent = "Hide ad";
      rehideBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        parent.removeAttribute("data-lcm-user-show");
        parent.classList.add(LCM_HIDE_CLASS);
        // Force a re-run of disable logic to recreate placeholder
        disableElement(vendor, element, hideCompletely, showPlaceholderIcon);
      };
      parent.appendChild(rehideBtn);
    }
    return;
  }

  element.classList.add(LCM_CLASS);
  element.setAttribute("data-lcm-disabled", "true");

  parent.classList.add(LCM_CLASS);
  parent.setAttribute("data-lcm-disabled", "true");

  if (hideCompletely) {
    parent.classList.add(LCM_HIDE_CLASS);

    // Create placeholder if it doesn't exist
    if (
      !parent.previousElementSibling?.classList.contains(LCM_PLACEHOLDER_CLASS)
    ) {
      const placeholder = document.createElement("div");
      placeholder.className = LCM_PLACEHOLDER_CLASS;

      const iconUrl =
        typeof chrome !== "undefined" && chrome.runtime
          ? chrome.runtime.getURL("public/favicon-16x16.png")
          : "";

      // VEHICLE TITLE EXTRACTION
      let adTitle = "Vehicle";
      if (vendor.titleSelector) {
        const titleEl = parent.querySelector(vendor.titleSelector);
        if (titleEl && titleEl.textContent) {
          adTitle = titleEl.textContent.trim().split("\n")[0]; // Get first line of title
        }
      }

      const motorName = parent.getAttribute("data-lcm-motor") || "";
      const displayTitle =
        adTitle !== "Vehicle"
          ? `${adTitle}${motorName ? ` (${motorName})` : ""}`
          : `${motorName || "Ad"} hidden`;

      placeholder.innerHTML = `
        ${showPlaceholderIcon ? `<img src="${iconUrl}" alt="icon">` : ""}
        <span>${displayTitle}</span>
        <div class="lcm-placeholder-line"></div>
        <div class="lcm-placeholder-btn">Show</div>
      `;

      placeholder.onclick = (e) => {
        e.stopPropagation();
        parent.setAttribute("data-lcm-user-show", "true");
        parent.classList.remove(LCM_HIDE_CLASS);
        placeholder.remove();
      };

      parent.parentNode?.insertBefore(placeholder, parent);
    }
  }
}

function enableElement(vendor: Vendor, element: HTMLElement) {
  element.classList.remove(LCM_CLASS);
  element.removeAttribute("data-lcm-disabled");
  element.removeAttribute("data-lcm-user-show");

  const parent = getParentCard(vendor, element) || element;
  parent.classList.remove(LCM_CLASS);
  parent.classList.remove(LCM_HIDE_CLASS);
  parent.removeAttribute("data-lcm-disabled");
  parent.removeAttribute("data-lcm-user-show");

  // Remove placeholder if it exists
  if (parent.previousElementSibling?.classList.contains(LCM_PLACEHOLDER_CLASS)) {
    parent.previousElementSibling.remove();
  }

  // Remove "Re-hide" button if it exists
  const rehideBtn = parent.querySelector(`.${LCM_REHIDE_BTN_CLASS}`);
  if (rehideBtn) {
    rehideBtn.remove();
  }
}

let activeJobToken = 0;
let lastHideCompletely: boolean | null = null;
let lastShowPlaceholderIcon: boolean | null = null;

/**
 * Toggle visibility of car ads matching any active motor pattern.
 * Processes elements in batches to avoid blocking the main thread.
 */
export async function toggleAd(
  hide: boolean,
  activeMotors: Motor[],
  hideCompletely: boolean,
  showPlaceholderIcon: boolean,
) {
  const token = ++activeJobToken;
  injectStyle(hideCompletely);
  showSpinner();

  // If the hiding mode or icon preference changed, clear all existing placeholders
  if (
    (lastHideCompletely !== null && lastHideCompletely !== hideCompletely) ||
    (lastShowPlaceholderIcon !== null &&
      lastShowPlaceholderIcon !== showPlaceholderIcon)
  ) {
    document
      .querySelectorAll(`.${LCM_PLACEHOLDER_CLASS}`)
      .forEach((p) => p.remove());
    // Also clear user-show attributes if we are switching modes to ensure a clean state
    if (lastHideCompletely !== hideCompletely) {
      document
        .querySelectorAll("[data-lcm-user-show]")
        .forEach((el) => el.removeAttribute("data-lcm-user-show"));
    }
  }
  lastHideCompletely = hideCompletely;
  lastShowPlaceholderIcon = showPlaceholderIcon;

  const regexes = activeMotors.map((m) => new RegExp(m.pattern, "i"));
  const matches = (text: string) => regexes.some((r) => r.test(text));

  const vendor = getVendorFromUrl(window.location.href);

  const adSelector =
    vendor.adClasses.length > 0
      ? vendor.adClasses
          .map((cls) =>
            cls.startsWith("[") ||
            cls.includes(":") ||
            cls === "article" ||
            cls === "a"
              ? cls
              : `.${cls}`,
          )
          .join(", ")
      : "a";

  const elements = Array.from(document.querySelectorAll(adSelector));

  const parentsToProcess = new Set<HTMLElement>();
  elements.forEach((el) => {
    const parent = getParentCard(vendor, el);
    if (parent) {
      parentsToProcess.add(parent);
    }
  });

  const parentsArray = Array.from(parentsToProcess);

  const batchSize = 50;
  for (let i = 0; i < parentsArray.length; i += batchSize) {
    if (token !== activeJobToken) return;

    const batch = parentsArray.slice(i, i + batchSize);
    batch.forEach((parent) => {
      let fullText =
        (parent.textContent || "") +
        " " +
        (parent.getAttribute("aria-label") || "") +
        " " +
        (parent.getAttribute("title") || "") +
        " " +
        (parent.getAttribute("alt") || "");

      const elementsWithAttrs = parent.querySelectorAll(
        "[aria-label], [title], [alt]",
      );
      elementsWithAttrs.forEach((el) => {
        fullText +=
          " " +
          (el.getAttribute("aria-label") || "") +
          " " +
          (el.getAttribute("title") || "") +
          " " +
          (el.getAttribute("alt") || "");
      });

      const isMatch = hide && fullText && matches(fullText);
      if (isMatch) {
        // Find which motor matched for the placeholder label
        const matchedMotor = activeMotors.find((m) =>
          new RegExp(m.pattern, "i").test(fullText),
        );
        if (matchedMotor) {
          parent.setAttribute("data-lcm-motor", matchedMotor.title);
        }
        disableElement(vendor, parent, hideCompletely, showPlaceholderIcon);
      } else {
        enableElement(vendor, parent);
      }
    });

    // Yield to the main thread
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }

  // Only hide spinner if this job is still the active one
  if (token === activeJobToken) {
    hideSpinner();
  }
}
