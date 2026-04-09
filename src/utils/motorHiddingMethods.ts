import { Vendors } from "../types/vendors";
import { Motor } from "../types/state";

const HP_CLASS = "hp-disabled";
const HP_SPINNER_ID = "hp-loading-spinner";

function injectStyle(hideCompletely: boolean) {
  if (document.getElementById("hp-style")) {
    const existingStyle = document.getElementById("hp-style");
    if (existingStyle) existingStyle.remove();
  }
  const style = document.createElement("style");
  style.id = "hp-style";
  if (hideCompletely) {
    style.textContent = `
      .${HP_CLASS}, [data-hp-disabled="true"] {
        display: none !important;
      }
    `;
  } else {
    style.textContent = `
      .${HP_CLASS}, [data-hp-disabled="true"] {
        opacity: 0.35 !important;
        filter: grayscale(100%) !important;
        pointer-events: none !important;
      }
      .${HP_CLASS} *, [data-hp-disabled="true"] * {
        text-decoration: line-through !important;
      }
    `;
  }
  style.textContent += `
    #${HP_SPINNER_ID} {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 24px;
      height: 24px;
      border: 3px solid rgba(0,0,0,0.1);
      border-radius: 50%;
      border-top-color: #3498db;
      animation: hp-spin 0.8s linear infinite;
      z-index: 999999;
      pointer-events: none;
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      display: none;
    }
    @keyframes hp-spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  if (!document.getElementById(HP_SPINNER_ID)) {
    const spinner = document.createElement("div");
    spinner.id = HP_SPINNER_ID;
    document.body.appendChild(spinner);
  }
}

function showSpinner() {
  const spinner = document.getElementById(HP_SPINNER_ID);
  if (spinner) spinner.style.display = "block";
}

function hideSpinner() {
  const spinner = document.getElementById(HP_SPINNER_ID);
  if (spinner) spinner.style.display = "none";
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
    public adClasses: string[] = [],
  ) {
    switch (name) {
      case Vendors.LeBonCoin:
        this.parentClasses = ["li"]; // Target the overarching list item card
        this.adClasses = ['[data-test-id="adcard-title"]', "a", "article"]; // Any possible hook
        break;
      case Vendors.LaCentrale:
        this.parentClasses = [
          "searchCard",
          "listingContainer",
          "searchCardContainer",
        ];
        this.adClasses = [
          '[data-testid*="vehicleCard"]',
          "lien-fiche",
          "link_veh",
        ];
        break;
      case Vendors.AutoSphere:
        this.parentClasses = ["thumbnail_vehicle", "fiche-synth"];
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
  if (vendor.parentClasses.length === 0) return null;
  const selector = vendor.parentClasses
    .map((cls) =>
      cls.startsWith("[") || cls.includes(":")
        ? cls
        : cls === "li" || cls === "article"
          ? cls
          : `.${cls}`,
    )
    .join(", ");
  return element.closest(selector) as HTMLElement | null;
}

function disableElement(vendor: Vendor, element: Element) {
  if (!(element instanceof HTMLElement)) return;
  element.classList.add(HP_CLASS);
  element.setAttribute("data-hp-disabled", "true");
  const parent = getParentCard(vendor, element);
  if (parent) {
    parent.classList.add(HP_CLASS);
    parent.setAttribute("data-hp-disabled", "true");
  }
}

function enableElement(vendor: Vendor, element: HTMLElement) {
  element.classList.remove(HP_CLASS);
  element.removeAttribute("data-hp-disabled");
  const parent = getParentCard(vendor, element);
  if (parent) {
    parent.classList.remove(HP_CLASS);
    parent.removeAttribute("data-hp-disabled");
  }
}

let activeJobToken = 0;

/**
 * Toggle visibility of car ads matching any active motor pattern.
 * Processes elements in batches to avoid blocking the main thread.
 */
export async function toggleAd(hide: boolean, activeMotors: Motor[], hideCompletely: boolean) {
  const token = ++activeJobToken;
  injectStyle(hideCompletely);
  showSpinner();

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
        disableElement(vendor, parent);
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
