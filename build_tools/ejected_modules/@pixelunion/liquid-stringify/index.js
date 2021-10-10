const Stringifier = require('postcss/lib/stringifier');

class LiquidStringifier extends Stringifier {
  comment(node) {
    // Alternative option - only unwraps if comment starts and ends with a liquid tag,
    // or starts with !liquid identifier. Makes it less likely we'll unwrap comments
    // that shouldn't be.
    // const liquidComment = /(^!liquid)|(^\s*(\{\{.+\}\}|\{%.+%\})\s*$)/.test(node.text);

    // Check for any liquid tags within the string.
    // Liquid tags are any matched pairs of {{ }}, {% %} or {%- -%}
    const liquidComment = /\{\{(.|\n)+\}\}|\{%(.|\n)+%\}/.test(node.text);
    if (!liquidComment) {
      super.comment(node);
      return;
    }

    this.builder(node.text, node);
  }
}

function liquidStringify(node, builder) {
  const str = new LiquidStringifier(builder);
  str.stringify(node);
}

module.exports = liquidStringify;
