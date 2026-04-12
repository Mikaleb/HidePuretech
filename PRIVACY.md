# Privacy Policy for Hide Puretech (Le Cache Misère)

Last updated: April 12, 2026

## 1. Overview
Hide Puretech (also known as "Le Cache Misère" or "LCM") is committed to protecting your privacy. This Privacy Policy explains how our browser extension handles data.

**The most important point: Hide Puretech does not collect, store, or transmit any of your personal data to external servers. All data processing happens locally on your computer.**

## 2. Data We Access (Prominent Disclosure)
To provide its core functionality (hiding advertisements for cars with unreliable engines), the extension requires access to:
- **Page Content**: The extension reads the text content (specifically vehicle titles and descriptions) of supported car classifieds websites. This is strictly necessary to identify and hide ads that match your engine filter settings (e.g., "Puretech", "THP", "BlueHDi").
- **Tabs/URLs**: The extension monitors the URL of the tab you are visiting to determine if it should activate its filtering logic.

### Supported Websites
The extension only processes data on the following domains:
- `lacentrale.fr`
- `aramisauto.com`
- `leboncoin.fr`
- `autosphere.fr`
- `autoscout24.fr`

## 3. Data Storage
- **Local Storage**: Your preferences (which motors to hide, which websites are active, UI settings) and your consent status are stored locally using the `chrome.storage.sync` API.
- **Syncing**: If you are signed into your browser, these settings may be synchronized across your devices. We do not have access to this data.

## 4. Third-Party Sharing
We **do not share** any information with third parties. **No data is sent to any external server**, analytics provider, or advertiser.

## 5. Security
The extension uses secure browser APIs. Since no data is transmitted externally, there is no risk of data interception.

## 6. Permissions Justification
- `storage`: Required to save your filtering preferences locally.
- `tabs`: Required to update the extension icon's badge with the number of hidden ads on the current page.
- `Content Scripts`: Required to read ad titles and hide them on supported car listing websites.

## 7. User Consent
By clicking "Accept and Continue" in the extension popup, you consent to the local processing of page content as described above. You can revoke this consent at any time by uninstalling the extension or clearing its data.

## 8. Changes to This Policy
We may update this Privacy Policy. Any changes will be reflected here and in the extension update notes.

## 9. Contact
If you have any questions, you can open an issue on our [GitHub repository](https://github.com/Mikaleb/LeCacheMisere).
