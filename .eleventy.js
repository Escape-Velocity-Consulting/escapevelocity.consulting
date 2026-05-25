module.exports = function(eleventyConfig) {
  // Global data — available in all templates as {{ gtmId }}
  eleventyConfig.addGlobalData("gtmId", "GTM-GNTWPNNL");

  eleventyConfig.addPassthroughCopy("styles");
  eleventyConfig.addPassthroughCopy("scripts");
  eleventyConfig.addPassthroughCopy("favicon.svg");
  eleventyConfig.addPassthroughCopy("vortrag.jpg");
  eleventyConfig.addPassthroughCopy("hi/*.vcf");
  eleventyConfig.addPassthroughCopy("qr.png");
  eleventyConfig.addPassthroughCopy("qr-lockscreen.png");

  // Brand System — consumed via git submodule at _brand/.
  // _brand/dist/site/ must exist before building (cd _brand && npm ci && npm run build:dist).
  // CI does this in .github/workflows/deploy.yml. See CLAUDE.md for details.
  eleventyConfig.addPassthroughCopy({ "_brand/dist/site":            "brand"             });
  eleventyConfig.addPassthroughCopy({ "_brand/dist/site/fonts":      "fonts"             });
  eleventyConfig.addPassthroughCopy({ "_brand/dist/site/tokens.css": "styles/tokens.css" });

  eleventyConfig.ignores.add("reference/**");
  eleventyConfig.ignores.add("_brand/**");

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes"
    },
    // Intentionally excludes "html" — the brand submodule contains many .html
    // files (templates/, dist/site/*.html) that are passed through, not rendered.
    // If a future website page wants .html, add the format and re-verify ignores.
    templateFormats: ["njk", "md"],
    htmlTemplateEngine: "njk"
  };
};
