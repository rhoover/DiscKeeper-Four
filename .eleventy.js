////////////////////////////////////////////////////
// Declare All The Things
////////////////////////////////////////////////////

// Plugins
const pluginRev = require("eleventy-plugin-rev");
const eleventySass = require("eleventy-sass");

// Filters
const jsMinifier = require("./src/_eleventy/filters/minify-javascript.js");

// Shortcodes

// Utilities
const sassOptions = require("./src/_eleventy/utilities/sassOptions.js");
const minifyProduction = require("./src/_eleventy/utilities/minify-html.js");
const serviceWorkerData = require("./src/_eleventy/utilities/serviceWorkerData.js");

////////////////////////////////////////////////////
// Let Eleventy Do Its Thing
////////////////////////////////////////////////////

module.exports = function(eleventyConfig) {

  ////////////////////////////////////////////////////
  // Pass Throughs
  ////////////////////////////////////////////////////

  ['src/img', 'src/js/packages', {"src/fonts": "fonts"}].forEach(path =>
    eleventyConfig.addPassthroughCopy(path)
    );
  eleventyConfig.addPassthroughCopy('robots.txt');
  eleventyConfig.addPassthroughCopy('favicon.ico');
  eleventyConfig.addPassthroughCopy('manifest.webmanifest');
  eleventyConfig.addPassthroughCopy('disckeeper-service-worker-min.js');
  
  ////////////////////////////////////////////////////
  // Plugins
  ////////////////////////////////////////////////////

  // revision the css filename
  eleventyConfig.addPlugin(pluginRev);

  // let eleventy handle compiling sass
  eleventyConfig.addPlugin(eleventySass, sassOptions);

  ////////////////////////////////////////////////////
  // Shortcodes
  ////////////////////////////////////////////////////
  
  ////////////////////////////////////////////////////
  // Filters
  ////////////////////////////////////////////////////

  // minify inline js codes on the fly, which can happern because of the sym-link between js/inline and _includes
  eleventyConfig.addNunjucksAsyncFilter("jsmin", jsMinifier);
  
  ////////////////////////////////////////////////////
  // Utilities
  ////////////////////////////////////////////////////

  // minify html for production build
  eleventyConfig.addTransform("htmlmin", minifyProduction);

  //create json file for service worker
  eleventyConfig.on('eleventy.after', serviceWorkerData);

  
  
  return {
    dir: {
      input: "src",
      output: "dist"
    }
  };
};
