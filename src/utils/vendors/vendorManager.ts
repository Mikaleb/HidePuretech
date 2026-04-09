import { Vendors } from "../../types/vendors";

export class Vendor {
  constructor(
    public name: Vendors,
    public parentClasses: string[] = [],
    public adClasses: string[] = [],
    public titleSelector: string = "",
  ) {
    switch (name) {
      case Vendors.LeBonCoin:
        this.parentClasses = ["li"];
        this.adClasses = ['[data-test-id="adcard-title"]', "a", "article"];
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
      case Vendors.AutoScout24:
        this.parentClasses = ["article.list-item", ".list-item", "article"];
        this.adClasses = ["article", "a"];
        this.titleSelector = "h2";
        break;
      default:
        this.parentClasses = [];
        this.adClasses = [];
        this.titleSelector = "";
    }
  }
}

export function getVendorFromUrl(url: string): Vendor {
  if (url.includes("lacentrale")) return new Vendor(Vendors.LaCentrale);
  if (url.includes("aramisauto")) return new Vendor(Vendors.AramisAuto);
  if (url.includes("leboncoin")) return new Vendor(Vendors.LeBonCoin);
  if (url.includes("autosphere")) return new Vendor(Vendors.AutoSphere);
  if (url.includes("autoscout24")) return new Vendor(Vendors.AutoScout24);
  return new Vendor(Vendors.LaCentrale);
}

export function getParentCard(vendor: Vendor, element: Element): HTMLElement | null {
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
