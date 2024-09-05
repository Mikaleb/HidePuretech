export const initialState = {
  isOn: true,
  motors: [],
  websites: [
    {
      title: "lacentrale.fr",
      url: "https://*.lacentrale.fr/listing?*",
      active: true,
    },
    {
      title: "aramisauto.com",
      url: "https://*.aramisauto.com/*",
      active: true,
    },
  ],
};
