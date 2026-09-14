module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy({ "public": "/" });

  eleventyConfig.addCollection("posts", (api) =>
    api.getFilteredByGlob("blog/*.md").sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addFilter("isoDate", (d) =>
    d instanceof Date ? d.toISOString().slice(0, 10) : d
  );

  eleventyConfig.addFilter("countBy", (arr, key, value) =>
    Array.isArray(arr) ? arr.filter((it) => it && it[key] === value).length : 0
  );

  // A list of short phrases, printed as one sentence of prose.
  //
  // `common_jobs` in _data/locations.json exists in two shapes. Every row today holds one
  // sentence, and api/admin/terminal.js asks its writer for the same ("1-2 sentences"). Other
  // writers produce a list of short phrases instead. Printing a list straight gives
  // "Exterior repaints,Eaves and fascia" with no spaces — JavaScript's default stringification.
  // Nunjucks' own `join` cannot be used: it throws a hard TypeError on a string and on
  // undefined, which fails the build rather than rendering oddly.
  //
  // The full stop is added only when missing. Every hand-written row already ends in one; a
  // joined list has no terminal punctuation, and this fills a <p> of prose.
  eleventyConfig.addFilter("commaList", (v) => {
    const text = Array.isArray(v)
      ? v.filter(Boolean).map((s) => String(s).trim()).filter(Boolean).join(", ")
      : v == null ? "" : String(v).trim();
    if (!text) return "";
    return /[.!?]$/.test(text) ? text : `${text}.`;
  });

  return {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
