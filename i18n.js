module.exports = {
  locales: ["en", "vi"],
  defaultLocale: "en",
  pages: {
    "*": ["common"],
  },
  loadLocaleFrom: (lang, ns) =>
    // You can use a dynamic import, fetch, whatever. You should
    // return a Promise with the JSON file.
    import(`./locales/${lang}.json`).then((m) => m.default),
};
