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

  if (vendor.name === Vendors.AutoSphere && vendor.adClasses.length > 0) {
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
