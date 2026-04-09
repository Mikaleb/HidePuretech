/* global chrome */
declare const chrome: any;
declare const browser: any;

chrome.runtime.onMessage.addListener((message: any, sender: any, sendResponse: any) => {
  if (message.action === "updateBadge") {
    const tabId = sender.tab?.id;
    if (tabId) {
      const count = message.count || 0;
      const showBadgeCount = message.showBadgeCount !== undefined ? message.showBadgeCount : true;

      if (showBadgeCount && count > 0) {
        chrome.action.setBadgeText({
          text: count.toString(),
          tabId: tabId
        });
        chrome.action.setBadgeBackgroundColor({
          color: "#d32f2f", // Error red color
          tabId: tabId
        });
      } else {
        chrome.action.setBadgeText({
          text: "",
          tabId: tabId
        });
      }
    }
    sendResponse({ status: "badgeUpdated" });
  }
});
