const postcss = require('postcss');
const liquidBlockStringify = require('.');

async function run(input, output) {
  const result = await postcss()
    .process(input, { from: undefined, stringifier: liquidBlockStringify });
  expect(result.css).toEqual(output);
  expect(result.warnings()).toHaveLength(0);
}

it('Extracts liquid from single comment block', async () => {
  const input = "/* {{ 'hello liquid world' }}*/";
  const output = "{{ 'hello liquid world' }}";
  await run(input, output);
});

it('Handles multiple comments on a single line', async () => {
  const input = "/* {{ 'hello liquid world' }}*/ /* {% assign a = 5 %} */";
  const output = "{{ 'hello liquid world' }} {% assign a = 5 %}";
  await run(input, output);
});

it('Handle multiple lines', async () => {
  const input = `
  /* {{ 'hello liquid world' }}*/
  /* {% assign a = 5 %} */
  /* {% if a > 3 %}
        {{ 'Greater' }}
      {% else %}
        {{ 'Lesser' }}
      {% endif %}
  */
`;
  const output = `
  {{ 'hello liquid world' }}
  {% assign a = 5 %}
  {% if a > 3 %}
        {{ 'Greater' }}
      {% else %}
        {{ 'Lesser' }}
      {% endif %}
`;
  await run(input, output);
});

it('Handle liquid tags that span multiple lines', async () => {
  const input = `
  /*
  {%
    include 'test'
  %}
  */
`;
  const output = `
  {%
    include 'test'
  %}
`;
  await run(input, output);
});

it('Unwraps Liquid in CSS comments', async () => {
  const input = "/*{{ 'hello' }}*/";
  const output = "{{ 'hello' }}";
  await run(input, output, {});
});

it('CSS comments without Liquid are unchanged', async () => {
  const input = '/* this is a comment */';
  const output = '/* this is a comment */';
  await run(input, output, {});
});

it('multi-line CSS comments without Liquid are unchanged', async () => {
  const input = '/* this is \na comment */';
  const output = '/* this is \na comment */';
  await run(input, output, {});
});

it('Unwraps comments that contain liquid tags and plain text', async () => {
  const input = '/* font-size: {{ font-size-small }}px; */';
  const output = 'font-size: {{ font-size-small }}px;';
  await run(input, output, {});
});

it('Does not change comments within values', async () => {
  const input = 'font-size: /*{{ font-size-small }}*/px;';
  const output = 'font-size: /*{{ font-size-small }}*/px;';
  await run(input, output, {});
});
