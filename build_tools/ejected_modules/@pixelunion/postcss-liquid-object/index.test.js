const postcss = require('postcss');

const plugin = require('./');

async function run(input, output, opts) {
  const result = await postcss([plugin(opts)]).process(input, { from: undefined });
  expect(result.css).toEqual(output);
  expect(result.warnings()).toHaveLength(0);
}

it('Transforms values within simple  rules', async () => {
  const input = '@test liquid-object(settings.breakpoint) { color: blue; }';
  const output = '@test {{ settings.breakpoint }} { color: blue; }';
  await run(input, output, {});
});

it('Transforms values within more complicated at rules', async () => {
  const input = '@media screen and (max-width: liquid-object("max_width")) and (min-width: 500px) { color: blue; }';
  const output = '@media screen and (max-width: {{ max_width }}) and (min-width: 500px) { color: blue; }';
  await run(input, output, {});
});

it('Transforms simple setting value', async () => {
  const input = 'color: liquid-object(settings.text_color);';
  const output = 'color: {{ settings.text_color }};';
  await run(input, output, {});
});

it('Transforms nested setting value', async () => {
  const input = 'width: calc(100% - liquid-object(settings.width)px);';
  const output = 'width: calc(100% - {{ settings.width }}px);';
  await run(input, output, {});
});

it('Transforms multiple values', async () => {
  const input = 'width: calc(100% - liquid-object(settings.width)px + liquid-object(settings.gutter)px);';
  const output = 'width: calc(100% - {{ settings.width }}px + {{ settings.gutter }}px);';
  await run(input, output, {});
});

it('Transforms quoted values', async () => {
  const input = 'color: liquid-object("settings.text_color");';
  const output = 'color: {{ settings.text_color }};';
  await run(input, output, {});
});

it('Transforms unquoted values', async () => {
  const input = 'color: liquid-object(settings.text_color);';
  const output = 'color: {{ settings.text_color }};';
  await run(input, output, {});
});

it('Transforms values with filters', async () => {
  const input = 'color: liquid-object("settings.text_color | color_modify: \'alpha\', 0.5");';
  const output = "color: {{ settings.text_color | color_modify: 'alpha', 0.5 }};";
  await run(input, output, {});
});

it('Transforms non-setting values with filters', async () => {
  const input = 'color: liquid-object("text_color | color_modify: \'alpha\', 0.5");';
  const output = "color: {{ text_color | color_modify: 'alpha', 0.5 }};";
  await run(input, output, {});
});
