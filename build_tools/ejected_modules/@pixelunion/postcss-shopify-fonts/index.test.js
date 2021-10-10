/* eslint-disable prefer-template, quotes */
const postcss = require('postcss');

const plugin = require('./');

function run(input) {
  return postcss([plugin()]).process(input, { from: undefined });
}

async function contains(input, output) {
  let outputArray = output;
  if (typeof output === 'string') {
    outputArray = [output];
  }
  const result = await run(input);
  expect(result.warnings()).toHaveLength(0);
  outputArray.forEach(s => expect(result.css).toContain(s));
}

async function doesNotContain(input, output) {
  let outputArray = output;
  if (typeof output === 'string') {
    outputArray = [output];
  }
  const result = await run(input);
  expect(result.warnings()).toHaveLength(0);
  outputArray.forEach(s => expect(result.css).not.toContain(s));
}

it('Generates liquid variables for base font style', async () => {
  const input = `--postcss-shopify-fonts-config: '{
    "fonts": [
        {
          "id": "font_body"
        }
      ]
}';`;

  const output = [
    'assign fonts_font_body_family',
    'assign fonts_font_body_style',
    'assign fonts_font_body_weight',
  ];

  await contains(input, output);
});

it('Generates liquid variables for base font italic style', async () => {
  const input = `--postcss-shopify-fonts-config: '{
    "fonts": [
        {
          "id": "font_body"
        }
      ]
}';`;

  const output = [
    'assign fonts_font_body_style_italic',
  ];

  await contains(input, output);
});

it('Generates liquid variables for bolder font style', async () => {
  const input = `--postcss-shopify-fonts-config: '{
    "fonts": [
        {
          "id": "font_body",
          "variants": ["bolder"]
        }
      ]
}';`;

  const output = [
    'assign fonts_font_body_weight_bolder',
  ];

  await contains(input, output);
});

it('Generates liquid variables for lighter font style', async () => {
  const input = `--postcss-shopify-fonts-config: '{
    "fonts": [
    {
      "id": "font_body",
      "variants": ["lighter"]
    }
  ]
}';`;

  const output = [
    'assign fonts_font_body_weight_lighter',
  ];

  await contains(input, output);
});

it('Generates | font face filters', async () => {
  const input = `--postcss-shopify-fonts-config: '{
    "fonts": [
        {
          "id": "font_body",
          "variants": ["lighter", "bolder"]
        }
      ]
}';`;

  const output = [
    '{{ settings.font_body | font_face: font_display: fonts_font_body_display }}',
    "{{ settings.font_body | font_modify: 'style', 'italic' | font_face: font_display: fonts_font_body_display }}",
    '{{ fonts_font_body_bolder | font_face: font_display: fonts_font_body_display }}',
    "{{ fonts_font_body_bolder | font_modify: 'style', 'italic' | font_face: font_display: fonts_font_body_display }}",
    '{{ fonts_font_body_lighter | font_face: font_display: fonts_font_body_display }}',
    "{{ fonts_font_body_lighter | font_modify: 'style', 'italic' | font_face: font_display: fonts_font_body_display }}",
  ];

  await contains(input, output);
});

it('Generates font_display setting if in global config', async () => {
  const input = `--postcss-shopify-fonts-config: '{
    "fonts": [
        {
          "id": "font_body",
          "variants": ["lighter", "bolder"]
        }
      ],
    "font_display": "settings.font_display_setting_id"
  }';`;

  const output = "{%- assign fonts_font_body_display = settings.font_display_setting_id | default: 'auto' -%}";

  await contains(input, output);
});

it('Generates font_display setting if in font specific config', async () => {
  const input = `--postcss-shopify-fonts-config: '{
    "fonts": [
        {
          "id": "font_body",
          "variants": ["lighter", "bolder"],
          "font_display": "settings.font_display_font_body_id"
        }
      ],
    "font_display": "settings.font_display_setting_id"
  }';`;

  const output = "{%- assign fonts_font_body_display = settings.font_display_font_body_id | default: 'auto' -%}";

  await contains(input, output);
});

it('Generates family override block if in global config', async () => {
  const input = `--postcss-shopify-fonts-config: '{
    "fonts": [
        {
          "id": "font_body",
          "variants": ["lighter", "bolder"]
        }
      ],
    "font_family": "settings.font_family_setting_id"
  }';`;

  const output = [
    "{%- comment -%}Font family override{%- endcomment -%}",
    "{%- assign fonts_font_body_family = settings.font_family_setting_id -%}",
    "{%- assign fonts_font_body_style = 'normal' -%}",
    "{%- assign fonts_font_body_weight = 400 -%}",
    "{%- assign fonts_font_body_style_italic = 'italic' -%}",
    "{%- assign fonts_font_body_weight_bolder = 700 -%}",
    "{%- assign fonts_font_body_weight_lighter = 300 -%}",
  ];

  await contains(input, output);
});
it('Generates family override block if in global config', async () => {
  const input = `--postcss-shopify-fonts-config: '{
    "fonts": [
        {
          "id": "font_body",
          "variants": ["lighter", "bolder"],
      "font_family": "settings.font_family_setting_id"
        }
      ]
  }';`;

  const output = [
    "{%- comment -%}Font family override{%- endcomment -%}",
    "{%- assign fonts_font_body_family = settings.font_family_setting_id -%}",
    "{%- assign fonts_font_body_style = 'normal' -%}",
    "{%- assign fonts_font_body_weight = 400 -%}",
    "{%- assign fonts_font_body_style_italic = 'italic' -%}",
    "{%- assign fonts_font_body_weight_bolder = 700 -%}",
    "{%- assign fonts_font_body_weight_lighter = 300 -%}",
  ];

  await contains(input, output);
});

const defaultConfig = `--postcss-shopify-fonts-config: '{
  "fonts": [
      {
        "id": "font_body",
        "variants": ["lighter", "bolder"]
      }
    ]
}';`;

it('Handles font ids with multiple dashes', async () => {
  const config = `--postcss-shopify-fonts-config: '{
    "fonts": [
        {
          "id": "font_body_special",
          "variants": ["lighter", "bolder"]
        }
      ]
  }';`;
  const input = config + 'font-style: font-style($font-body-special);';
  const output = 'font-style: liquid-object(fonts_font_body_special_style);';
  await contains(input, output);
});

it('Transforms font-style', async () => {
  const input = defaultConfig + 'font-style: font-style($font-body);';
  const output = 'font-style: liquid-object(fonts_font_body_style);';
  await contains(input, output);
});

it('Transforms font-style in a variable', async () => {
  const input = defaultConfig + '--test-var: font-style($font-body);';
  const output = '--test-var: liquid-object(fonts_font_body_style);';
  await contains(input, output);
});

it('Transforms font-style initial', async () => {
  const input = defaultConfig + 'font-style: font-style($font-body, $font-style: initial);';
  const output = 'font-style: liquid-object(fonts_font_body_style);';
  await contains(input, output);
});

it('Transforms font-style italic', async () => {
  const input = defaultConfig + 'font-style: font-style($font-body, $font-style: italic);';
  const output = 'font-style: liquid-object(fonts_font_body_style_italic);';
  await contains(input, output);
});

it('Transforms font-weight', async () => {
  const input = defaultConfig + 'font-weight: font-weight($font-body);';
  const output = 'font-weight: liquid-object(fonts_font_body_weight);';
  await contains(input, output);
});

it('Transforms font-weight in a variable', async () => {
  const input = defaultConfig + '--test-var: font-weight($font-body);';
  const output = '--test-var: liquid-object(fonts_font_body_weight);';
  await contains(input, output);
});

it('Transforms font-weight initial', async () => {
  const input = defaultConfig + 'font-weight: font-weight($font-body, $font-weight: initial);';
  const output = 'font-weight: liquid-object(fonts_font_body_weight);';
  await contains(input, output);
});

it('Transforms font-weight bolder', async () => {
  const input = defaultConfig + 'font-weight: font-weight($font-body, $font-weight: bolder);';
  const output = 'font-weight: liquid-object(fonts_font_body_weight_bolder);';
  await contains(input, output);
});

it('Transforms font-weight lighter', async () => {
  const input = defaultConfig + 'font-weight: font-weight($font-body, $font-weight: lighter);';
  const output = 'font-weight: liquid-object(fonts_font_body_weight_lighter);';
  await contains(input, output);
});

it('Transforms font-weight lighter', async () => {
  const input = defaultConfig + 'font-weight: font-weight($font-body, $font-weight: lighter);';
  const output = 'font-weight: liquid-object(fonts_font_body_weight_lighter);';
  await contains(input, output);
});

it('Transforms font-family', async () => {
  const input = defaultConfig + 'font-family: font-family($font-body);';
  const output = 'font-family: liquid-object(fonts_font_body_family);';
  await contains(input, output);
});

it('Transforms font-family in a variable', async () => {
  const input = defaultConfig + '--test-var: font-family($font-body);';
  const output = '--test-var: liquid-object(fonts_font_body_family);';
  await contains(input, output);
});

it('Custom font code includes font weights', async () => {
  const config = `--postcss-shopify-fonts-config: '{
    "fonts": [
        {
          "id": "font_body",
          "variants": ["lighter", "bolder"],
          "allow_custom": true
        }
      ]
  }';`;
  const input = config + 'font-weight: font-weight($font-body, $font-weight: lighter);';
  const output = "{%- assign font_additional_weights = 'initial,lighter,bolder' | split: ',' -%}";
  await contains(input, output);
});

it('Contains custom font code when allow_custom is true', async () => {
  const config = `--postcss-shopify-fonts-config: '{
    "fonts": [
        {
          "id": "font_body",
          "variants": ["lighter", "bolder"],
          "allow_custom": true
        }
      ]
  }';`;
  const input = config + 'font-weight: font-weight($font-body, $font-weight: lighter);';
  const output = "{%- comment -%}Custom{%- endcomment -%}";
  await contains(input, output);
});

it('Font mixin includes family by default', async () => {
  const input = defaultConfig + '@include font($font-body);';
  const output = 'font-family: liquid-object(fonts_font_body_family);';
  await contains(input, output);
});

it('Font mixin excludes family when passed false', async () => {
  const input = defaultConfig + '@include font($font-body, $font-family: false);';
  const output = 'font-family:';
  await doesNotContain(input, output);
});

it('Font mixin includes weight by default', async () => {
  const input = defaultConfig + '@include font($font-body);';
  const output = 'font-weight: liquid-object(fonts_font_body_weight);';
  await contains(input, output);
});

it('Font mixin does not include font-size by default', async () => {
  const input = defaultConfig + '@include font($font-body);';
  const output = 'font-size:';
  await doesNotContain(input, output);
});

it('Font mixin includes size when provided', async () => {
  const input = defaultConfig + '@include font($font-body, $font-size: 1rem);';
  const output = 'font-size: 1rem';
  await contains(input, output);
});

it('Font mixin excludes weight when passed false', async () => {
  const input = defaultConfig + '@include font($font-body, $font-weight: false);';
  const output = 'font-weight:';
  await doesNotContain(input, output);
});

it('Font mixin includes style by default', async () => {
  const input = defaultConfig + '@include font($font-body);';
  const output = 'font-style: liquid-object(fonts_font_body_style)';
  await contains(input, output);
});

it('Font mixin does not include style when passed false', async () => {
  const input = defaultConfig + '@include font($font-body, $font-style: false);';
  const output = 'font-style:';
  await doesNotContain(input, output);
});

it('Excludes custom font code when allow_custom is not true', async () => {
  const config = `--postcss-shopify-fonts-config: '{
    "fonts": [
        {
          "id": "font_body",
          "variants": ["lighter", "bolder"],
          "allow_custom": false
        }
      ]
  }';`;
  const input = config + 'font-weight: font-weight($font-body, $font-weight: lighter);';
  const output = "{%- comment -%}Custom{%- endcomment -%}";

  const result = await run(input);
  expect(result.warnings()).toHaveLength(0);
  expect(result.css).not.toContain(output);
});

it('Throws an error when config is missing', async () => {
  const input = 'font-weight: font-weight($font-body, $font-weight: lighter);';
  await expect(run(input)).rejects.toThrowError(postcss.root.error);
});

it('Throws an error when id is missing from config', async () => {
  const input = defaultConfig + 'font-weight: font-weight($font-other, $font-weight: lighter);';
  await expect(run(input)).rejects.toThrowError(postcss.root.error);
});

it('Throws an error when $font-family is not a boolean', async () => {
  const input = defaultConfig + '@include font($font-body, $font-family: Roboto);';
  await expect(run(input)).rejects.toThrowError(postcss.root.error);
});

it('Throws an error when weight is missing from config', async () => {
  const config = `--postcss-shopify-fonts-config: '{
    "fonts": [
        {
          "id": "font_body",
          "variants": ["bolder"]
        }
      ]
  }';`;
  const input = config + 'font-weight: font-weight($font-body, $font-weight: lighter);';
  await expect(run(input)).rejects.toThrowError(postcss.root.error);
});

it('Throws an error when config is not valid JSON', async () => {
  const config = `--postcss-shopify-fonts-config: 'font_body:bolder|font_other';`;
  const input = config + 'font-weight: font-weight($font-body);';
  await expect(run(input)).rejects.toThrowError(postcss.root.error);
});
