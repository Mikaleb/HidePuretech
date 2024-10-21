import { AppState } from "../types/state";

/**
 * Hide all motor item from the list of car ads
 */
export function toggleAd(hide: boolean) {
  const motorsToHide = ["puretech", "pure tech", "pure-tech", "PureTech"];
  const regex = new RegExp(motorsToHide.join("|"), "i");

  const carAdsWithLinks = document.querySelectorAll("a");

  const laCentrale_ParentsClass = [
    "searchCard",
    "listingContainer",
    "searchCardContainer",
  ];

  const lbc_ParentsClass = ["mb-lg"];

  const hideElement = (element: HTMLAnchorElement) => {
    element.style.display = "none";
    if (
      element.parentElement &&
      (laCentrale_ParentsClass.includes(element.parentElement.className) ||
        lbc_ParentsClass.includes(element.parentElement.className))
    ) {
      element.parentElement.style.display = "none";
    }
  };

  const showElement = (element: HTMLAnchorElement) => {
    const showForAramisauto = (element: HTMLAnchorElement) => {
      element.style.display = "block";
    };

    const showForLaCentrale = (element: HTMLAnchorElement) => {
      element.style.display = "flex";
      if (
        element.parentElement &&
        laCentrale_ParentsClass.includes(element.parentElement.className)
      ) {
        element.parentElement.style.display = "flex";
      }
    };

    const showForLbc = (element: HTMLAnchorElement) => {
      element.style.display = "flex";
      if (
        element.parentElement &&
        lbc_ParentsClass.includes(element.parentElement.className)
      ) {
        element.parentElement.style.display = "flex";
      }
    };

    if (element.href.includes("aramisauto")) {
      showForAramisauto(element);
    }
    if (element.href.includes("lacentrale")) {
      showForLaCentrale(element);
    }
    if (element.href.includes("leboncoin")) {
      showForLbc(element);
    }
  };

  //   let nbOfAdsChanged = 0;

  carAdsWithLinks.forEach((element) => {
    const childsDiv = element.querySelectorAll("div");

    childsDiv.forEach((child: HTMLDivElement) => {
      if (child.textContent && regex.test(child.textContent)) {
        // nbOfAdsChanged++;
        hide ? hideElement(element) : showElement(element);
      }
    });
  });

  //   TODO : later
  //   // add a little text line to listingContainer div to show how many ads have been hidden
  //   const resultList = document.querySelector(".resultList");
  //   const hidePureTechResult = document.getElementById("hide-puretech-result");

  //   if (hidePureTechResult) {
  //     hidePureTechResult.textContent = `${nbOfAdsChanged} ads have been hidden`;
  //   } else {
  //     const nbOfAdsChangedText = document.createElement("p");
  //     nbOfAdsChangedText.id = "hide-puretech-result";
  //     nbOfAdsChangedText.textContent = `${nbOfAdsChanged} ads have been hidden`;
  //     // add nbOfAdsChangedText as first child of resultList
  //     if (resultList) {
  //       resultList.insertBefore(nbOfAdsChangedText, resultList.firstChild);
  //     }
  //   }
}
