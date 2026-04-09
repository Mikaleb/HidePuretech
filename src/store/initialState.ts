import { Motor } from "../types/state";

export const initialState = {
  loading: false,
  motors: [
    { title: "PureTech",    active: true, pattern: "puretech|pure[- ]tech" },
    { title: "BlueHDi 1.5", active: true, pattern: "(?=.*1\\.5)(?=.*blue[- ]?hdi)" },
  ] as Motor[],
  websites: [
    { title: "lacentrale.fr",  url: "https://*.lacentrale.fr/*",  active: true },
    { title: "aramisauto.com", url: "https://*.aramisauto.com/*", active: true },
    { title: "leboncoin.fr",   url: "https://*.leboncoin.fr/*",   active: true },
    { title: "autosphere.fr",  url: "https://*.autosphere.fr/*",  active: true },
  ],
  hideCompletely: false,
};
