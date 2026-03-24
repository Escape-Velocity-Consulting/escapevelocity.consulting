module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("styles");
  eleventyConfig.addPassthroughCopy("scripts");
  eleventyConfig.addPassthroughCopy("fonts");
  eleventyConfig.addPassthroughCopy("favicon.svg");
  eleventyConfig.addPassthroughCopy("vortrag.jpg");
  eleventyConfig.addPassthroughCopy("hi/*.vcf");
  eleventyConfig.addPassthroughCopy("qr.png");
  eleventyConfig.addPassthroughCopy("qr-lockscreen.png");
  eleventyConfig.addPassthroughCopy("brand");

  eleventyConfig.ignores.add("reference/**");

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes"
    },
    templateFormats: ["njk", "html", "md"],
    htmlTemplateEngine: "njk"
  };
};
