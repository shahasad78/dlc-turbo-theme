const postcss = require('postcss');

const plugin = require('./');

async function run(input, output, opts) {
  const result = await postcss([plugin(opts)]).process(input, { from: undefined });
  expect(result.css).toEqual(output);
  expect(result.warnings()).toHaveLength(0);
}

it('Transforms single if rule with brackets for backwards compatibility', async () => {
  const input = '@liquid-if (a != blank) { color: tomato; }';
  const output = '/*{%- if a != blank -%}*/ color: tomato/*{%- endif -%}*/';
  await run(input, output, {});
});

it('Transforms single if rule with double quotes', async () => {
  const input = '@liquid-if "a != blank" { color: tomato; }';
  const output = '/*{%- if a != blank -%}*/ color: tomato/*{%- endif -%}*/';
  await run(input, output, {});
});

it('Transforms single if rule with single quotes', async () => {
  const input = "@liquid-if 'a != blank' { color: tomato; }";
  const output = '/*{%- if a != blank -%}*/ color: tomato/*{%- endif -%}*/';
  await run(input, output, {});
});

it('Internal quotes are preserved', async () => {
  const input = "@liquid-if 'a != \"blank\"' { color: tomato; }";
  const output = '/*{%- if a != "blank" -%}*/ color: tomato/*{%- endif -%}*/';
  await run(input, output, {});
});

it('Transforms if-else rule', async () => {
  const input = '@liquid-if "a != blank" { color: tomato; } @liquid-else { color: blue; }';
  const output = '/*{%- if a != blank -%}*/ color: tomato; /*{%- else -%}*/ color: blue /*{%- endif -%}*/';
  await run(input, output, {});
});

it('Transforms if-elsif rule', async () => {
  const input = '@liquid-if "a != blank" { color: tomato; } @liquid-elsif "5 < 3" { color: blue; }';
  const output = '/*{%- if a != blank -%}*/ color: tomato; /*{%- elsif 5 < 3 -%}*/ color: blue /*{%- endif -%}*/';
  await run(input, output, {});
});

it('Transforms if-elsif-else rule', async () => {
  const input = '@liquid-if "a != blank" { color: tomato; } @liquid-elsif "5 < 3" { color: blue; } @liquid-else { color: green; }';
  const output = '/*{%- if a != blank -%}*/ color: tomato; /*{%- elsif 5 < 3 -%}*/ color: blue; /*{%- else -%}*/ color: green /*{%- endif -%}*/';
  await run(input, output, {});
});

it('Transforms nested if rules', async () => {
  const input = '@liquid-if "a != blank" { color: tomato; @liquid-if "5 < 3" { color: blue; } }';
  const output = '/*{%- if a != blank -%}*/ color: tomato;/*{%- if 5 < 3 -%}*/ color: blue/*{%- endif -%}*//*{%- endif -%}*/';
  await run(input, output, {});
});
