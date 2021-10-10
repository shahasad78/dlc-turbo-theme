const postcss = require('postcss');
const { liquidVars, liquidObject, liquidFontTemplate } = require('./liquidHelpers');

/**
 * parseArgs
 *
 * Parses a subset of SCSS style arguments
 * All arguments are assumed to be in the in the form
 * function-name($id, [optional keyword arguments])
 * @param {String} input
 *
 */
const parseArgs = input => {
  const args = input
    .match(/^[^(]+\(([^)]+)\)$/)[1]
    .split(',');

  const [rawId, ...rest] = args;
  const id = rawId.replace('$', '').replace(/-/g, '_');

  const params = rest.map(param => {
    const [key, value] = param.split(':').map(s => s.trim());

    // Map string values to booleans
    const mapper = {
      true: true,
      false: false,
    };

    return { key: key.replace('$', ''), value: value in mapper ? mapper[value] : value };
  })
    .reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {});

  return { id, params };
};

/**
 * Checks that config exists (is truthy)
 * @param {string} param.config Configuration to reference
 * @param {postcss.node} param.node Postcss decl node for error reference
 *
 */
const checkConfig = ({ config, node }) => {
  if (!config) {
    throw node.error('Missing postcss-shopify-fonts configuration');
  }
};

/**
 * Checks that config includes a given font id
 * @param {string} param.id Font setting ID to reference
 * @param {string} param.config Configuration to reference
 * @param {postcss.node} param.node Postcss decl node for error reference
 *
 */
const checkId = ({ id, config, node }) => {
  checkConfig({ config, node });
  const valid = config.fonts.some(v => v.id === id);
  if (!valid) {
    throw node.error(`${id} missing from configuration`, { word: id, source: node.source });
  }
};

/**
 * Checks that config includes a font weight for a given font id
 * @param {string} param.id Font setting ID to reference
 * @param {string} param.weight Font weight
 * @param {string} param.config Configuration to reference
 * @param {postcss.node} param.node Postcss decl node for error reference
 *
 */
const checkWeight = ({
  id,
  config,
  node,
  weight,
}) => {
  if (!weight) return;

  checkId({ id, config, node });

  const valid = config.fonts
    .filter(v => v.id === id)[0]
    .variants.includes(weight);

  if (!valid) {
    throw node.error(`${id} variant ${weight} missing from configuration`, { word: weight, source: node.source });
  }
};

/**
 * Generates a CSS font-weight declaration string;
 * @param {string} param.id Font setting ID to reference
 * @param {string} [param.weight=initial] Font weight
 * @param {string} param.config Configuration to reference
 * @param {postcss.node} param.node Postcss decl node for error reference
 *
 * @returns {string} font-weight declaration string
 */
const generateFontWeight = ({
  id,
  config,
  node,
  weight = 'initial',
}) => {
  const mapper = {
    initial: liquidVars.fontWeight,
    lighter: liquidVars.fontWeightLighter,
    bolder: liquidVars.fontWeightBolder,
  };

  if (!(weight in mapper)) {
    throw node.error(
      `${weight} is not a valid weight. Should be one of ${Object.keys(mapper)}`,
      { word: weight },
    );
  }

  checkWeight({
    id,
    weight,
    config,
    node,
  });

  return `${node.prop || 'font-weight'}: ${liquidObject(mapper[weight](id))}`;
};

/**
 * Generates a CSS font-style declaration string;
 * @param {string} param.id Font setting ID to reference
 * @param {string} [param.style=initial] Font style
 * @param {postcss.node} param.node Postcss decl node for error reference
 *
 * @returns {string} font-style declaration string
 */
const generateFontStyle = ({
  id,
  config,
  node,
  style = 'initial',
}) => {
  const mapper = {
    initial: liquidVars.fontStyle,
    italic: liquidVars.fontStyleItalic,
  };

  if (!(style in mapper)) {
    throw node.error(
      `${style} is not a valid style. Should be one of ${Object.keys(mapper)}`,
      { word: style, source: node.source },
    );
  }

  checkId({ id, config, node });

  return `${node.prop || 'font-style'}: ${liquidObject(mapper[style](id))}`;
};

/**
 * Generates a CSS font-family declaration string;
 * @param {string} param.id Font setting ID to reference
 * @param {postcss.node} param.node Postcss decl node for error reference
 *
 * @returns {string} font-style declaration string
 */
const generateFontFamily = ({ id, config, node }) => {
  checkId({ id, config, node });

  return `${node.prop || 'font-family'}: ${liquidObject(liquidVars.fontFamily(id))}`;
};

const handleFontWeight = ({ node, config }) => {
  if (!(node.type === 'decl' && node.value.includes('font-weight('))) return false;

  const { id, params } = parseArgs(node.value);
  const newNodeString = generateFontWeight({
    id,
    weight: params['font-weight'],
    config,
    node,
  });

  node.replaceWith(newNodeString);

  return true;
};

const handleFontStyle = ({ node, config }) => {
  if (!(node.type === 'decl' && node.value.includes('font-style('))) return false;
  const { id, params } = parseArgs(node.value);
  checkId({ id, config, node });

  const newNodeString = generateFontStyle({
    id,
    config,
    node,
    style: params['font-style'],
  });

  node.replaceWith(newNodeString);

  return true;
};

const handleFontFamily = ({ node, config }) => {
  if (!(node.type === 'decl' && node.value.includes('font-family('))) return false;
  const { id } = parseArgs(node.value);

  const newNodeString = generateFontFamily({ id, config, node });

  node.replaceWith(newNodeString);

  return true;
};

const handleFont = ({ node, config }) => {
  if (!(node.type === 'atrule' && node.params.includes('font('))) return false;

  const { id, params } = parseArgs(node.params);

  if (params['font-family'] !== false) {
    if (params['font-family'] !== undefined && typeof params['font-family'] !== 'boolean') {
      throw node.error(`$font-family must be true or false: ${params['font-family']} is not valid`);
    }

    const newNodeString = generateFontFamily({ id, config, node });

    node.before(newNodeString);
  }

  if (params['font-size']) {
    node.before(`font-size: ${params['font-size']}`);
  }

  if (params['font-style'] !== false) {
    const newNodeString = generateFontStyle({
      id,
      config,
      node,
      style: params['font-style'],
    });

    node.before(newNodeString);
  }

  if (params['font-weight'] !== false) {
    const newNodeString = generateFontWeight({
      id,
      config,
      node,
      weight: params['font-weight'],
    });

    node.before(newNodeString);
  }

  node.remove();

  return true;
};

const handleConfig = node => {
  if (!(node.type === 'decl' && node.prop === '--postcss-shopify-fonts-config')) return null;

  // JSON needs to be wrapped in single quotes to be a valid properly value
  // so we need to remove them before parsing.
  let config;
  try {
    config = JSON.parse(node.value.replace(/'/gm, ''));
  } catch (error) {
    throw node.error(`Unable to parse config: ${error.message}`);
  }

  // Add 'initial' weights, to make future validation easier.
  config.fonts = config.fonts.map(font => {
    const variants = font.variants || [];
    return { ...font, variants: ['initial', ...variants] };
  });

  // Generate liquid variables
  const liquid = config.fonts
    .map(font => {
      // these settings can be font-specific, or global.
      const fontDisplay = font.font_display || config.font_display;
      const fontFamily = font.font_family || config.font_family;
      const allowCustom = font.allow_custom || config.allow_custom;
      return liquidFontTemplate({
        ...font,
        fontDisplay,
        fontFamily,
        allowCustom,
      });
    }).join('\n');
  node.replaceWith(postcss.comment({ text: liquid }));

  return config;
};

module.exports = postcss.plugin('postcss-shopify-fonts', () => root => {
  let config = null;

  const handlers = [
    handleFont,
    handleFontWeight,
    handleFontStyle,
    handleFontFamily,
  ];

  root.walk(node => {
    if (!config) {
      config = handleConfig(node);
    }

    for (let i = 0; i < handlers.length; i++) {
      const handler = handlers[i];
      // As soon as we find a valid handler, break out of the loop
      if (handler({ node, config })) break;
    }
  });
});
