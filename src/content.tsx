declare const chrome: any;

// I want to hide all the elements on the page that have the word "PURETECH" in them

const url = location.href;

const getCurrentUrlSetting = (websites: any) => {
  const pattern = websites
    .map((website: { url: string }) => {
      return website.url.replace(/\*/g, ".*");
    })
    .join("|");

  const regex = new RegExp(pattern);
  const website = websites.find((website: { url: string }) => regex.test(url));

  return website;
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle the message
  console.debug("🚀 ~ message", message);

  const isCurrentUrlActive = getCurrentUrlSetting(message.websites).active;

  if (message.isOn === true && isCurrentUrlActive) {
    hideElements();
  } else if (message.isOn === false || !isCurrentUrlActive) {
    showElements();
  }

  // if any website is not active, check that it's within the current url
  if (message.websites) {
    const website = message.websites.find(
      (website: { url: string; active: boolean }) => url.includes(website.url)
    );
    if (!website.active) {
      showElements();
    } else {
      hideElements();
    }
  }

  sendResponse({ status: "received", message, sender, sendResponse });
});

const hideElements = () => {
  // skip if location.href contain a website url that is not active in the state

  const elements = document.querySelectorAll("a");

  // chrome.storage.sync.get("isOn", (results: { isOn: any }) => {
  //   console.debug("🚀 ~ results.isOn", results.isOn);
  // });

  elements.forEach((element) => {
    // if in the a, there is a div with any child that has PURETECH in it, hide the a

    const childsDiv = element.querySelectorAll("div");

    childsDiv.forEach((child) => {
      if (child.textContent.includes("PURETECH")) {
        element.style.display = "none";
        // fix for lacentrale : if parent div with class "searchCard", hide too
        if (element.parentElement.className === "searchCard") {
          element.parentElement.style.display = "none";
        }
      }
    });
  });
};

const showElements = () => {
  const elements = document.querySelectorAll("a");

  elements.forEach((element) => {
    // element.style.display = "block";
    if (element.textContent.includes("PURETECH")) {
      element.style.display = "flex";
      // fix for lacentrale : if parent div with class "searchCard", hide too
      if (element.parentElement.className === "searchCard") {
        element.parentElement.style.display = "flex";
      }
    }
  });
};

chrome.storage.sync.get("isOn", (results: { isOn: any }) => {
  chrome.storage.sync.get("websites", (resultsWebsites: { websites: any }) => {
    const websites = resultsWebsites.websites;

    const website = getCurrentUrlSetting(websites);

    if (results.isOn && website.active) {
      hideElements();
    } else {
      showElements();
    }
  });
});
