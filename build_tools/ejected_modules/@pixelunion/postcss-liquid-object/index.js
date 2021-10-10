const postcss = require('postcss');

const process = value => {
  // parse values passed to any liquid-object functions.
  const liquidSettingRegex = /liquid-object\("?([^)"]+)"?\)/g;
  const injectSettings = (match, $1) => `{{ ${$1} }}`;
  return value.replace(liquidSettingRegex, injectSettings);
};

module.exports = postcss.plugin('postcss-liquid-object', () => root => {
  root.walkDecls(decl => {
    if (decl.value.includes('liquid-object(')) {
      decl.value = process(decl.value);
    }
  });

  root.walkAtRules(rule => {
    if (rule.params.includes('liquid-object(')) {
      rule.params = process(rule.params);
    }
  });
});
