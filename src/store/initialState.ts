import { Motor } from "../types/state";

export const initialState = {
  loading: false,
  motors: [
    { title: "PureTech / VTi", active: true, pattern: "puretech|pure[- ]tech|vti" },
    { title: "BlueHDi 1.5",   active: true, pattern: "(?=.*1\\.5)(?=.*blue[- ]?hdi)" },
    { title: "1.6 THP",       active: true, pattern: "1\\.6\\s?thp|(?<![0-9])thp(?![0-9])" },
  ] as Motor[],
  websites: [
    { title: "lacentrale.fr",  url: "https://*.lacentrale.fr/*",  active: true },
    { title: "aramisauto.com", url: "https://*.aramisauto.com/*", active: true },
    { title: "leboncoin.fr",   url: "https://*.leboncoin.fr/*",   active: true },
    { title: "autosphere.fr",  url: "https://*.autosphere.fr/*",  active: true },
    { title: "autoscout24.fr", url: "https://*.autoscout24.fr/*", active: true },
  ],
  hideCompletely: true,
  showPlaceholderIcon: false,
  showBadgeCount: true,
};
