import { Vendors } from "../types/vendors";
import { Motor } from "../types/state";

const HP_CLASS = "hp-disabled";
const HP_SPINNER_ID = "hp-loading-spinner";

function injectStyle() {
  if (document.getElementById("hp-style")) return;
  const style = document.createElement("style");
  style.id = "hp-style";
  style.textContent = `
    .${HP_CLASS} {
      opacity: 0.35 !important;
      filter: grayscale(100%) !important;
      pointer-events: none !important;
    }
    .${HP_CLASS} * {
      text-decoration: line-through !important;
    }
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
        this.parentClasses = ["mb-lg"];
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
  const selector = vendor.parentClasses.map((cls) => `.${cls}`).join(", ");
  return element.closest(selector) as HTMLElement | null;
}

function disableElement(vendor: Vendor, element: Element) {
  if (!(element instanceof HTMLElement)) return;
  element.classList.add(HP_CLASS);
  const parent = getParentCard(vendor, element);
  if (parent) {
    parent.classList.add(HP_CLASS);
  }
}

function enableElement(vendor: Vendor, element: HTMLElement) {
  element.classList.remove(HP_CLASS);
  const parent = getParentCard(vendor, element);
  if (parent) parent.classList.remove(HP_CLASS);
}

let activeJobToken = 0;

/**
 * Toggle visibility of car ads matching any active motor pattern.
 * Processes elements in batches to avoid blocking the main thread.
 */
export async function toggleAd(hide: boolean, activeMotors: Motor[]) {
  const token = ++activeJobToken;
  injectStyle();
  showSpinner();

  const regexes = activeMotors.map((m) => new RegExp(m.pattern, "i"));
  const matches = (text: string) => regexes.some((r) => r.test(text));

  const vendor = getVendorFromUrl(window.location.href);

  const adSelector =
    vendor.adClasses.length > 0
      ? vendor.adClasses
          .map((cls) => (cls.startsWith("[") ? cls : `.${cls}`))
          .join(", ")
      : "a";

  const elements = Array.from(document.querySelectorAll(adSelector));

  const batchSize = 50;
  for (let i = 0; i < elements.length; i += batchSize) {
    // Check if a newer job has started
    if (token !== activeJobToken) return;

    const batch = elements.slice(i, i + batchSize);
    batch.forEach((element) => {
      const text = element.textContent || "";
      if (hide && text && matches(text)) {
        disableElement(vendor, element);
      } else {
        enableElement(vendor, element as HTMLElement);
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
