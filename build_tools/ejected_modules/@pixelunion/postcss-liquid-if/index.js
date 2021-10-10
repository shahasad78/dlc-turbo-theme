const postcss = require('postcss');

module.exports = postcss.plugin('postcss-liquid-if', () => {
  const sanitizeParams = params => params
    .replace(/^\(|\)$/g, '') // Strip brackets
    .replace(/^(["'])(.+?)\1$/, '$2'); // Strip single or double quotes

  const processNext = rule => {
    const node = rule.next();

    if (typeof node === 'undefined') return false;
    if (node.type !== 'atrule') return false;
    if (!['liquid-elsif', 'liquid-else'].includes(node.name)) return false;

    switch (node.name) {
      case 'liquid-elsif':
        node.prepend(`/*{%- elsif ${sanitizeParams(node.params)} -%}*/`);
        if (!processNext(node)) {
          node.append('/*{%- endif -%}*/');
        }
        node.replaceWith(node.nodes);
        break;
      case 'liquid-else':
        node.prepend('/*{%- else -%}*/');
        node.append('/*{%- endif -%}*/');
        node.replaceWith(node.nodes);
        break;
      default:
        break;
    }

    return true;
  };

  const processIf = parent => {
    parent.walkAtRules('liquid-if', rule => {
      // Recursively process any nested rules
      processIf(rule);
      rule.prepend(`/*{%- if ${sanitizeParams(rule.params)} -%}*/`);
      if (!processNext(rule)) {
        rule.append('/*{%- endif -%}*/');
      }
      rule.replaceWith(rule.nodes);
    });
  };

  return root => processIf(root);
});
