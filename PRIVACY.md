# Privacy Policy for Hide Puretech

Last updated: April 11, 2026

## 1. Overview
Hide Puretech (also known as "Le Cache Misère") is committed to protecting your privacy. This Privacy Policy explains how our browser extension handles data.

**The most important point: Hide Puretech does not collect, store, or transmit any of your personal data to external servers. All data processing happens locally on your computer.**

## 2. Data We Access
To provide its core functionality (hiding specific car advertisements), the extension requires access to:
- **Page Content**: The extension reads the text content of specific supported car classifieds websites (e.g., lacentrale.fr, leboncoin.fr, etc.) to identify vehicle ads that match your filter settings (e.g., "Puretech" engines).
- **Tabs/URLs**: The extension monitors which website you are visiting to determine if it should activate its filtering logic. This is limited to the websites explicitly listed in the extension's settings.

## 3. Data Storage
- **Local Storage**: Your preferences (which motors to hide, which websites are active, UI settings) are stored locally using the `chrome.storage.sync` API provided by your browser.
- **Syncing**: If you are signed into your browser with an account, your settings may be synchronized across your devices by the browser's own synchronization service. We do not have access to this data.

## 4. Third-Party Sharing
We **do not share** any information with third parties. No data is sent to any external server, analytics provider, or advertiser.

## 5. Security
The extension uses secure browser APIs to handle data. Since no data is transmitted externally, there is no risk of data interception during transmission.

## 6. Permissions Justification
- `storage`: Required to save your filtering preferences.
- `tabs`: Required to update the extension icon's badge with the number of hidden ads on the current page.
- `Content Scripts`: Required to read ad titles and hide them on supported websites.

## 7. Changes to This Policy
We may update this Privacy Policy from time to time. Any changes will be reflected in a new version of the extension and an update to this document.

## 8. Contact
If you have any questions about this Privacy Policy, you can open an issue on our [GitHub repository](https://github.com/Mikaleb/LeCacheMisere).
