import { Vendors } from "../types/vendors";
import { Motor } from "../types/state";

declare const chrome: any;

const HP_CLASS = "hp-disabled";
const HP_SPINNER_ID = "hp-loading-spinner";
const HP_HIDE_CLASS = "hp-hide-completely";
const HP_PLACEHOLDER_CLASS = "hp-hidden-placeholder";
const HP_REHIDE_BTN_CLASS = "hp-rehide-btn";

function injectStyle(hideCompletely: boolean) {
  if (document.getElementById("hp-style")) {
    const existingStyle = document.getElementById("hp-style");
    if (existingStyle) existingStyle.remove();
  }
  const style = document.createElement("style");
  style.id = "hp-style";
  
  // Grey-out style should ALWAYS be available if disabled
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

  if (hideCompletely) {
    style.textContent += `
      .${HP_HIDE_CLASS}:not([data-hp-user-show="true"]) {
        display: none !important;
      }
    `;
  }
  style.textContent += `
    .${HP_PLACEHOLDER_CLASS} {
      display: flex !important;
      align-items: center !important;
      height: 28px !important;
      padding: 0 12px !important;
      margin: 8px 0 !important;
      background: rgba(242, 69, 53, 0.03) !important;
      border: 1px dashed rgba(242, 69, 53, 0.3) !important;
      border-radius: 6px !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
      color: #666 !important;
      font-size: 11px !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      user-select: none !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }
    .${HP_PLACEHOLDER_CLASS}:hover {
      background: rgba(242, 69, 53, 0.08) !important;
      border-color: rgba(242, 69, 53, 0.5) !important;
    }
    .${HP_PLACEHOLDER_CLASS} img {
      width: 14px !important;
      height: 14px !important;
      margin-right: 8px !important;
      opacity: 0.7 !important;
    }
    .hp-placeholder-line {
      flex-grow: 1 !important;
      height: 1px !important;
      background: linear-gradient(90deg, rgba(242, 69, 53, 0.2) 0%, rgba(242, 69, 53, 0) 100%) !important;
      margin: 0 12px !important;
    }
    .hp-placeholder-btn {
      color: #f24535 !important;
      font-weight: 600 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.5px !important;
      font-size: 10px !important;
      padding: 2px 6px !important;
      border-radius: 4px !important;
    }
    .hp-placeholder-btn:hover {
      background: rgba(242, 69, 53, 0.1) !important;
    }
    .${HP_REHIDE_BTN_CLASS} {
      position: absolute !important;
      top: 8px !important;
      right: 8px !important;
      z-index: 9999 !important;
      background: #f24535 !important;
      color: white !important;
      padding: 4px 12px !important;
      border-radius: 6px !important;
      font-size: 11px !important;
      font-weight: 700 !important;
      cursor: pointer !important;
      border: none !important;
      box-shadow: 0 4px 12px rgba(242, 69, 53, 0.3) !important;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      opacity: 0 !important;
      pointer-events: none !important;
      text-transform: uppercase !important;
      letter-spacing: 0.5px !important;
    }
    /* Show on hover of any parent with revealed status */
    [data-hp-user-show="true"]:hover {
      position: relative !important;
    }
    [data-hp-user-show="true"]:hover .${HP_REHIDE_BTN_CLASS} {
      opacity: 1 !important;
      pointer-events: auto !important;
    }
    .${HP_REHIDE_BTN_CLASS}:hover {
      background: #d43224 !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 6px 16px rgba(242, 69, 53, 0.4) !important;
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
    public titleSelector: string = "",
  ) {
    switch (name) {
      case Vendors.LeBonCoin:
        this.parentClasses = ["li"]; // Target the overarching list item card
        this.adClasses = ['[data-test-id="adcard-title"]', "a", "article"]; // Any possible hook
        this.titleSelector = '[data-test-id="adcard-title"]';
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
        this.titleSelector = 'h2[class*="title"], h2[class*="vehiclecardV2_title"], h3[class*="title"], [class*="searchCard__title"]';
        break;
      case Vendors.AutoSphere:
        this.parentClasses = ["thumbnail_vehicle", "fiche-synth"];
        this.titleSelector = ".title, h2, h3";
        break;
      case Vendors.AramisAuto:
        this.parentClasses = ["vehicle-card"];
        this.titleSelector = ".vehicle-card__title, h3";
        break;
      default:
        this.parentClasses = [];
        this.adClasses = [];
        this.titleSelector = "";
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

function disableElement(vendor: Vendor, element: HTMLElement, hideCompletely: boolean) {
  const parent = getParentCard(vendor, element) || element;
  
  // ADD THIS FIX: Check if the user has already expanded this ad
  if (parent.getAttribute("data-hp-user-show") === "true") {
    parent.classList.add(HP_CLASS); // Still keep it greyed out
    parent.classList.remove(HP_HIDE_CLASS); // Remove hiding
    parent.setAttribute("data-hp-disabled", "true");
    
    // Ensure placeholder is gone if it somehow stayed
    if (parent.previousElementSibling?.classList.contains(HP_PLACEHOLDER_CLASS)) {
      parent.previousElementSibling.remove();
    }
    
    // Inject "Re-hide" button if not present
    if (!parent.querySelector(`.${HP_REHIDE_BTN_CLASS}`)) {
      const rehideBtn = document.createElement("button");
      rehideBtn.className = HP_REHIDE_BTN_CLASS;
      rehideBtn.textContent = "Hide ad";
      rehideBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        parent.removeAttribute("data-hp-user-show");
        parent.classList.add(HP_HIDE_CLASS);
        // Force a re-run of disable logic to recreate placeholder
        disableElement(vendor, element, hideCompletely);
      };
      parent.appendChild(rehideBtn);
    }
    return;
  }

  element.classList.add(HP_CLASS);
  element.setAttribute("data-hp-disabled", "true");
  
  parent.classList.add(HP_CLASS);
  parent.setAttribute("data-hp-disabled", "true");

  if (hideCompletely) {
    parent.classList.add(HP_HIDE_CLASS);
    
    // Create placeholder if it doesn't exist
    if (!parent.previousElementSibling?.classList.contains(HP_PLACEHOLDER_CLASS)) {
      const placeholder = document.createElement("div");
      placeholder.className = HP_PLACEHOLDER_CLASS;
      
      const iconUrl = typeof chrome !== 'undefined' && chrome.runtime 
        ? chrome.runtime.getURL("public/icon16.png") 
        : "";
        
      // VEHICLE TITLE EXTRACTION
      let adTitle = "Vehicle";
      if (vendor.titleSelector) {
        const titleEl = parent.querySelector(vendor.titleSelector);
        if (titleEl && titleEl.textContent) {
          adTitle = titleEl.textContent.trim().split('\n')[0]; // Get first line of title
        }
      }
      
      const motorName = parent.getAttribute('data-hp-motor') || '';
      const displayTitle = adTitle !== "Vehicle" 
        ? `${adTitle}${motorName ? ` (${motorName})` : ''}`
        : `${motorName || 'Ad'} hidden`;

      placeholder.innerHTML = `
        <img src="${iconUrl}" alt="icon">
        <span>${displayTitle}</span>
        <div class="hp-placeholder-line"></div>
        <div class="hp-placeholder-btn">Show</div>
      `;
      
      placeholder.onclick = (e) => {
        e.stopPropagation();
        parent.setAttribute("data-hp-user-show", "true");
        parent.classList.remove(HP_HIDE_CLASS);
        placeholder.remove();
      };
      
      parent.parentNode?.insertBefore(placeholder, parent);
    }
  }
}

function enableElement(vendor: Vendor, element: HTMLElement) {
  element.classList.remove(HP_CLASS);
  element.removeAttribute("data-hp-disabled");
  element.removeAttribute("data-hp-user-show");
  
  const parent = getParentCard(vendor, element) || element;
  parent.classList.remove(HP_CLASS);
  parent.classList.remove(HP_HIDE_CLASS);
  parent.removeAttribute("data-hp-disabled");
  parent.removeAttribute("data-hp-user-show");
  
  // Remove placeholder if it exists
  if (parent.previousElementSibling?.classList.contains(HP_PLACEHOLDER_CLASS)) {
    parent.previousElementSibling.remove();
  }
  
  // Remove "Re-hide" button if it exists
  const rehideBtn = parent.querySelector(`.${HP_REHIDE_BTN_CLASS}`);
  if (rehideBtn) {
    rehideBtn.remove();
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
        // Find which motor matched for the placeholder label
        const matchedMotor = activeMotors.find(m => new RegExp(m.pattern, "i").test(fullText));
        if (matchedMotor) {
          parent.setAttribute('data-hp-motor', matchedMotor.title);
        }
        disableElement(vendor, parent, hideCompletely);
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
