module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-recess-order',
    'stylelint-config-recommended-scss',
  ],
  rules: {
    'at-rule-no-unknown': null,
    'scss/at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'liquid-if',
          'liquid-elsif',
          'liquid-else',
        ],
      },
    ],
    'no-descending-specificity': null,
    'declaration-empty-line-before': null,
    'custom-property-empty-line-before': null,
    'string-quotes': 'double',
    'selector-attribute-quotes': 'always',
    'declaration-block-single-line-max-declarations': 0,
  },
};
