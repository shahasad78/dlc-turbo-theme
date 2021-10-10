const fs = require('fs');
const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve: resolve } = require('@rollup/plugin-node-resolve');
const uglify = require('uglify-js');
const pkg = require('./package.json');

const banner = `
/*!
 * ${pkg.name} v${pkg.version}
 * (c) ${new Date().getFullYear()} ${pkg.author}
 */
`;

const outputOptions = {
  es: {
    output: {
      file: pkg.module,
    },
    format: 'es',
    banner,
    exports: 'default',
  },
  cjs: {
    format: 'cjs',
    file: pkg.main,
    banner,
    exports: 'default',
  },
  umd: {
    format: 'umd',
    file: pkg.umd,
    name: pkg.umdName,
    banner,
    exports: 'default',
  },
};

rollup.rollup({
  input: 'src/scripts/index.js',
  plugins: [
    babel(),
    commonjs(),
    resolve(),
  ],
}).then(bundle => {
  bundle.write(outputOptions.es);
  bundle.write(outputOptions.cjs);

  bundle.generate(outputOptions.umd).then(code => {
    const minified = uglify.minify(code.code);

    fs.writeFileSync(outputOptions.umd.file, code.code);
    fs.writeFileSync(
      outputOptions.umd.file.replace('.js', '.min.js'),
      minified.code,
    );
  });
});
