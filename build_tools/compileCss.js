const isCLI = require.main === module;

const process = require('process');
const fs = require('fs');
const path = require('path');
const autoprefixer = require('autoprefixer');
const postcss = require('postcss');
const postcssScss = require('postcss-scss');
const postcssEasyImport = require('postcss-easy-import');
const postcssFailOnWarn = require('postcss-fail-on-warn');
const postcssLiquidIf = require('./ejected_modules/@pixelunion/postcss-liquid-if');
const postcssLiquidObject = require('./ejected_modules/@pixelunion/postcss-liquid-object');
const postcssSass = require('@csstools/postcss-sass');
const postcssShopifyFonts = require('./ejected_modules/@pixelunion/postcss-shopify-fonts');
const postcssStripInlineComments = require('postcss-strip-inline-comments');
const liquidStringify = require('./ejected_modules/@pixelunion/liquid-stringify');

function compileCss(source, destination) {
  return new Promise((resolve, reject) => {
    const input = fs.readFileSync(source, 'utf8');

    const from = source;

    // Apply postCSS plugins
    postcss([
      postcssEasyImport({ prefix: '_', extensions: ['.css', '.scss'] }),
      postcssFailOnWarn,
      postcssStripInlineComments,
      postcssShopifyFonts,
      postcssSass({
        indentWidth: 2,
      }),
      autoprefixer({
        grid: false,
      }),
    ]).process(input, {
      from,
      syntax: postcssScss,
    })
      // then run postCSS with custom stringifier. postcss-sass takes
      // the stringified result so will only work with a scss compatible syntax.
      .then(({ css }) => postcss([
        postcssLiquidIf,
        postcssLiquidObject,
      ]).process(css, {
        from,
        parser: postcssScss.parse,
        stringifier: liquidStringify,
      }))
      .then(({ css }) => {
        const dir = path.dirname(destination);
        const file = Buffer.from(css);

        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }

        try {
          fs.writeFile(destination, file, resolve);
        } catch (error) {
          reject(error);
        }
      })
      .catch(error => {
        if (error.name === 'CssSyntaxError') {
          // Nice source formatting gets lost if we pass error directly
          reject(error.toString());
        } else if (error.formatted) {
          // Expose more verbose error details from postcss-node-sass.
          reject(error.formatted);
        } else {
          reject(error);
        }
      });
  });
}

if (isCLI) {
  compileCss(process.argv[2], process.argv[3]);
} else {
  module.exports = compileCss;
}
