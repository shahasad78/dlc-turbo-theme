# postcss-shopify-fonts

A postCSS plugin for easily interfacing with fonts on Shopify, `postcss-shopify-fonts` is designed to be a drop-in replacement for the scss based [shopify-fonts](https://github.com/pixelunion/shopify-fonts). To migrate, all that's required is an updated configuration that meets the [new format](#specify-font-configuration).

## Table of Contents

- [Requirements](#requirements)
- [Configuration](#configuration)
  - [Theme settings](#theme-settings)
  - [Specify font configuration](#specify-font-configuration)
    - [Example](#example)
- [Custom fonts](#custom-fonts)
  - [Example](#example)
  - [Merchant files](#merchant-files)
  - [Typekit-like files](#typekit-like-files)
- [Additional settings](#additional-settings)
  - [Font display](#font-display)
  - [Font family override](#font-family-override)
- [Functions](#functions)
  - [font-family($font-type)](#font-familyfont-type)
  - [font-weight($font-type, $font-weight)](#font-weightfont-type-font-weight)
  - [font-style($font-type, $font-style)](#font-stylefont-type-font-style)
- [Mixins](#mixins)
  - [font($font-type, $font-family, $font-size, $font-style, $font-weight)](#fontfont-type-font-family-font-size-font-style-font-weight)
- [How it works](#how-it-works)
- [Usage](#usage)

## Requirements

This plugin relies on [postcss-liquid-object](/postcss-liquid-object) and [liquid-stringify](/liquid-stringify)

If you are using [postcss-node-sass](https://www.npmjs.com/package/postcss-node-sass) then `postcss-shopify-fonts` should be run first because it uses the scss `@include` syntax. However `postcss-node-sass` is incompatible with `liquid-stringify`.

You will instead need to run one instance of postcss with these plugins and the standard stringifer, then run the result through a second instance using `liquid-stringify`.

## Configuration

### Theme settings

First, configure the theme settings to add a font picker.

```json
{
    "type": "font_picker",
    "label": "Body font",
    "id": "font_body",
    "default": "helvetica_n4"
}
```

**Note** The `default` field is required as part of Shopify's requirements

Optionally declare additional custom font setting in `settings_schema.json`

The id for a custom font should match the font_picker, with the addition of a `_custom` suffix.

- For each font setting, an additional textarea setting can be included to allow the merchant to upload their own font files for use,
- Each weight and style combination requires an additional line in the textarea,
- Each weight and style combination may require an additional file to be uploaded by the merchant*.

\* Multiple weight and styles could use the same file; however, this situation is unlikely.

```json
{
  "type": "textarea",
  "id": "font_body_custom",
  "label": "Custom fonts"
}
```

### Specify font configuration

`postcss-shopify-fonts` requires configuration in JSON format, which should be assigned to a `--postcss-shopify-fonts-config` custom property.

| Setting | Type | | Description |
|---|---|---|---|
| `Config` | Object | Required | Config object |
| `Config.allow_custom` | Boolean | Optional | If true, code to support custom fonts will by default be included for each font. |
| `Config.font_display` | String | Optional | Liquid object reference to use for `font-display` value. |
| `Config.font_family` | String | Optional | Liquid object reference to use for font family override for all fonts. If the object is falsey, or equal to the string `disable`, the standard font picker or custom font will be used. If truthy, the value will be applied directly as the `font-family` value for all fonts |
| `Config.fonts` | Font[] | Required | Array of Font objects to load |
| `Font` | Object | Required | Configuration associated with a specific font picker |
| `Font.id` | String | Required | Setting id as defined in `settings_schema.json` |
| `Font.variants` | String[] | Optional | Additional font weights to load. Possible options are `lighter` and `bolder` |
| `Font.allow_custom` | Boolean | Optional | If true, code to support custom fonts for this font will be included. Overrides `Config.allow_custom` for this font. |
| `Font.font_display` | String | Optional | Liquid object reference to use for `font-display` value for this font. Overrides `Config.font_display` for this font. |
| `Font.font_family` | String | Optional | Liquid object reference to use for font family override for this font. If the object is falsey, or equal to the string `disable`, the standard font picker or custom font will be used. If truthy, the value will be applied directly as the `font-family` value for this font. Overrides `Config.font_family` for this font. |

#### Example

This will load the `font_body` font, with lighter and bolder weights and support for custom fonts, and `font_headings` with no additional weights and no support for custom fonts. Both fonts will get their `font-display` value from a global `settings.font_display_setting_id` setting.

```css
--postcss-shopify-fonts-config: '{
    "fonts": [
        {
          "id": "font_body",
          "variants": ["lighter", "bolder"],
          "font_custom": true
        }
        {
          "id": "font_headings"
        }
      ],
    "font_display": "settings.font_display_setting_id"
  }';
```

## Custom fonts

- Allows the usage of a custom font uploaded through the Shopify admin,
- Each Shopify font setting can have a custom font textarea setting, accessed by using a setting ID of the format `<font_picker_setting_id>_custom` where `<font_picker_setting_id>` is the ID of the Shopify font picker you're overriding,
- No additional work is required on the theme side to interpret a custom font over a Shopify font.

### Example

```json
{
    "type": "font_picker",
    "label": "Body font",
    "id": "font_body",
    "default": "helvetica_n4"
},
{
  "type": "textarea",
  "id": "font_body_custom",
  "label": "Custom fonts"
}
```

### Merchant files

#### Format

`[(<weight-name>|<style>|<weight-name>-<style>):]<font_file>`

#### Example

Assume you have the following files uploaded to Shopify's `files`:

- `league-gothic.woff2`,
- `league-gothic-italic.woff2`,
- `league-gothic-lighter.woff2`,
- `league-gothic-lighter-italic.woff2`,
- `league-gothic-bolder.woff2`,
- `league-gothic-bolder-italic.woff2`.

Then, to access these fonts for usage as the body font, you'd enter the following into the custom font textarea:

```text
league-gothic.woff2
italic: league-gothic-italic.woff2
lighter: league-gothic-lighter.woff2
lighter-italic: league-gothic-lighter-italic.woff2
bolder: league-gothic-bolder.woff2
bolder-italic: league-gothic-bolder-italic.woff2
```

### Typekit-like files

#### Format

`<weight-name><weight>[-<style>]:<font_family>`

#### Example

Assume you are importing typekit fonts from an `@import` in your CSS that includes the following fonts:

```css
font-family: synthese, sans-serif;
font-weight: 200;
font-style: normal;
```

```css
font-family: synthese, sans-serif;
font-weight: 200;
font-style: italic;
```

```css
font-family: synthese, sans-serif;
font-weight: 700;
font-style: normal;
```

```css
font-family: synthese, sans-serif;
font-weight: 700;
font-style: italic;
```

Then, to access these fonts for usage as the body font, you'd enter the following into the custom font textarea:

```text
initial200: synthese, sans-serif
initial200-italic: synthese, sans-serif
bolder700: synthese, sans-serif
bolder700-italic: synthese, sans-serif
```

## Additional settings

### Font display

Optionally, css [`font-display`](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display) behaviour can be set based on a Liquid reference, as defined in the [config](#specify-font-configuration).

```json
  {
    "name": "Font Settings",
    "settings": [
      {
        "id": "font_display",
        "type": "select",
        "options": [
          {
            "value": "auto",
            "label": "Auto"
          },
          {
            "value": "block",
            "label": "Block"
          },
          {
            "value": "swap",
            "label": "Swap"
          },
          {
            "value": "fallback",
            "label": "Fallback"
          },
          {
            "value": "optional",
            "label": "Optional"
          }
        ],
        "default": "auto",
        "label": "Font loading (font-display) behaviour"
      }
    ]
  },
```

```css
--postcss-shopify-fonts-config: '{
    "fonts": [
        {
          "id": "font_body"
        }
      ],
    "font_display": "settings.font_display"
  }';
```

### Font family override

Optionally, css `font-family` can be set, overriding any webfonts (they will be removed completely from the css, eliminating their load time), based on a Liquid reference, as defined in the [config](#specify-font-configuration).

When the value of the Liquid reference is not falsey or equal to the string `disable`, that value will be set directly as the `font-family` for any calls to the `font-family` function or `font` mixin. As such, any valid css for the [`font-family`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family) property can be used, including named font families, generic families, and comma separated combinations thereof.

```json
{
    "name": "Font Settings",
    "settings": [
      {
        "type":      "select",
        "id":        "font_family_override",
        "label":     "Use generic font family",
        "options": [
          {
            "value": "disable",
            "label": "Disable"
          },
          {
            "value": "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Oxygen-sans, Ubuntu, Cantarell, Helvetica, Arial, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\"",
            "label": "System-ui"
          }
        ],
        "default":   "disable"
     }
    ]
  }
```

## Functions

For backwards compatibility, all font related functions follow an SCSS style syntax. The first parameter, `$font-type`, corresponds with `Font.id` as provided in the [config](#specify-font-configuration), but in kebab case (`-` instead of `_`), and with a `$` prefix. For example `$font-body` corresponds with the `font_body` settings id.

### font-family($font-type)

#### Example

```scss
.rte {
  font-family: font-family($font-body);
}
```

#### Returns

```css
.rte {
  font-family: Helvetica,"Helvetica Neue",Arial,"Lucida Grande",sans-serif;
}
```

#### Parameters

- `$font-type`
  - Name of font setting

### font-weight($font-type, $font-weight)

#### Example

```scss
.rte {
  font-weight: font-weight($font-body, $font-weight: bolder);
}
```

#### Returns

```css
.rte {
  font-weight: 700;
}
```

#### Parameters

- `$font-type`
  - Name of font setting
- `$font-weight` (_default_: `initial`):
  - Desired font weight to return
  - Accepts one of: `initial`, `lighter`, `bolder`

### font-style($font-type, $font-style)

Note that in `shopify-fonts` this function included a `$font-weight` parameter which does not affect the output and so has been removed and will be ignored if present. Fonts without an italic style will still return `italic` and the style will be simulated by the browser.

#### Example

```scss
.rte {
  font-style: font-style($font-body, $font-style: italic);
}
```

#### Returns

```css
.rte {
  font-style: italic;
}
```

### Parameters

- `$font-type`
  - Name of font setting, or variable containing name of font setting
- `$font-style` (_default_: `initial`):
  - Desired font weight to return
  - Accepts one of: `initial`, `italic`

## Mixins

### font($font-type, $font-family, $font-size, $font-style, $font-weight)

The `font()` mixin is used to generate the family, weight, and style of
a font.

#### Example

```scss
.rte {
  @include font($font-body)
}
```

#### Returns

```css
.rte {
  font-family: Helvetica,"Helvetica Neue",Arial,"Lucida Grande",sans-serif;
  font-weight: 400;
  font-style: normal;
}
```

#### Parameters

- `$font-type`
  - Name of font setting, or variable containing name of font setting
- `$font-family` (_default_: `true`):
  - Pass as `false` to omit `font-family` style
- `$font-size` (_default_: `false`):
  - Pass a unit of measurement to have a font size style
- `$font-style` (_default_: `initial`):
  - Desired font style to use
  - Accepts one of: `initial`, `italic`, `false`
- `$font-weight` (_default_: `initial`):
  - Desired font weight adjustment to use
  - Accepts one of: `initial`, `lighter`, `bolder`, `false`

## How it works

1. Inject a bunch of Liquid that will generate font-face declarations and generate `font_family`, `font_style`, `font_style_italic`, `font_weight`, `font_weight_bolder`, `font_weight_lighter` Liquid variables for each font defined in the configuration.

2. Reference those liquid variables throughout the CSS.

## Usage

Check you project for existing PostCSS config: `postcss.config.js`
in the project root, `"postcss"` section in `package.json`
or `postcss` in bundle config.

If you already use PostCSS, add the plugin to plugins list:

```diff
module.exports = {
  plugins: [
+   require('@pixelunion/postcss-shopify-fonts'),
    require('autoprefixer')
  ]
}
```

If you do not use PostCSS, add it according to [official docs]
and set this plugin in settings.

[official docs]: https://github.com/postcss/postcss#usage
