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

  // One entry out of a data file, matched on a key — e.g. the Cairns CBD row of
  // locations.json, so a hand-written page can read its own FAQs.
  //
  // ⚠️ NUNJUCKS' OWN `selectattr` DOES NOT FILTER IN THIS BUILD. Checked before writing
  // this: `locations | selectattr("slug","equalto","cairns-cbd")` returns the whole list,
  // so `| first` silently yields the FIRST suburb rather than the matching one. It fails
  // by showing the wrong data, not by erroring, which is the worst way to fail.
  //
  // Returns null rather than undefined when nothing matches, so `{% if %}` reads clearly
  // and `.faqs` on the result cannot throw mid-build.
  eleventyConfig.addFilter("findBy", (list, key, value) =>
    (Array.isArray(list) ? list : []).find((it) => it && it[key] === value) || null
  );

  // A heading, carrying the only two pieces of formatting this site's headings use.
  //
  // Every hero and section heading here is shaped like this:
  //
  //     <h1>Two-pack systems<br/>that <span class="high">hold up</span> to real work.</h1>
  //
  // The line break and the highlight are part of the writing, not decoration that can be
  // dropped. But storing headings as HTML and printing them raw would mean anything that
  // writes a heading can put arbitrary markup on the live site, and storing them as plain
  // text throws the break and the highlight away.
  //
  // So a stored heading is TEXT with a two-token vocabulary, and nothing else:
  //
  //     a line break   ->  <br/>
  //     [[phrase]]     ->  <span class="high">phrase</span>
  //
  // ⚠️ ESCAPE FIRST, THEN INJECT — the order is the whole safety argument. Everything is
  // HTML-escaped before the two tokens become tags, so a stored "<script>" ends up as
  // visible text and there is no input that produces any other element.
  //
  // ⚠️ CALL IT AS `{{ x | heading | safe }}`. The `safe` is not a shortcut: the escaping
  // has already happened inside the filter, and without it Nunjucks would escape the <br/>
  // and the span back into visible angle brackets. Never use `safe` here without `heading`.
  eleventyConfig.addFilter("heading", (v) => {
    if (v == null) return "";
    const escaped = String(v).trim()
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    return escaped
      .replace(/\[\[([\s\S]*?)\]\]/g, '<span class="high">$1</span>')
      .replace(/\r?\n/g, "<br/>");
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
