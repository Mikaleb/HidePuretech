import { Vendors } from "../types/vendors";

const motorsToHide = ["puretech", "pure tech", "pure-tech", "PureTech"];

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
        this.parentClasses = [
          "searchCard",
          "listingContainer",
          "searchCardContainer",
        ];
        this.adClasses = ["lien-fiche", "link_veh"];
        break;
      case Vendors.AutoSphere:
        this.parentClasses = [
          "thumbnail_vehicle",
          "fiche-synth",
          "fiche-synth\n",
        ];
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

/**
 * Hide all motor item from the list of car ads
 */
export function toggleAd(hide: boolean) {
  const regex = new RegExp(motorsToHide.join("|"), "i");

  const hideElementDOM = (vendor: Vendor, element: Element) => {
    if (element instanceof HTMLElement) {
      element.style.display = "none";
      let parentElement = element.parentElement;

      while (
        parentElement &&
        !vendor.parentClasses.some((cls) =>
          parentElement?.classList.contains(cls)
        )
      ) {
        if (!parentElement) {
          break;
        }
        parentElement = parentElement.parentElement;
      }
      if (parentElement) {
        parentElement.style.display = "none";
      }
    }
  };

  const showElement = (vendor: Vendor, element: HTMLAnchorElement) => {
    const showForAramisauto = (element: HTMLAnchorElement) => {
      element.style.display = "block";
    };

    const showForParent = (
      parentClasses: string | string[],
      element: HTMLAnchorElement
    ) => {
      element.style.display = "flex";
      if (
        element.parentElement &&
        parentClasses.includes(element.parentElement.className)
      ) {
        element.parentElement.style.display = "flex";
      }
    };

    if (vendor.name === Vendors.AramisAuto) {
      showForAramisauto(element);
    }
    if (vendor.name === Vendors.LaCentrale) {
      showForParent(vendor.parentClasses, element);
    }
    if (vendor.name === Vendors.LeBonCoin) {
      showForParent(vendor.parentClasses, element);
    }
    if (vendor.name === Vendors.AutoSphere) {
      showForParent(vendor.parentClasses, element);
    }
  };

  if (window.location.href.includes("autosphere")) {
    const carAdsWithLinks = document.querySelectorAll(
      vendor.adClasses.map((className) => `a.${className}`).join(", ")
    );
    console.debug("🚀 ~ toggleAd ~ carAdsWithLinks:", carAdsWithLinks);

    carAdsWithLinks.forEach((element) => {
      element.childNodes.forEach((child) => {
        if (child.textContent && regex.test(child.textContent)) {
          hide
            ? hideElementDOM(new Vendor(Vendors.AutoSphere), element)
            : showElement(
                new Vendor(Vendors.AutoSphere),
                element as HTMLAnchorElement
              );
        }
      });
    });
  } else {
    const carAdsWithLinks = document.querySelectorAll("a");

    carAdsWithLinks.forEach((element) => {
      const childsDiv = element.querySelectorAll("div");
      childsDiv.forEach((child: HTMLDivElement) => {
        if (child.textContent && regex.test(child.textContent)) {
          hide
            ? hideElementDOM(new Vendor(Vendors.LaCentrale), element)
            : showElement(
                new Vendor(Vendors.LaCentrale),
                element as HTMLAnchorElement
              );
        }
      });
    });
  }
}
