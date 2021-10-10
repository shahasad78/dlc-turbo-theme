# postcss-liquid-object

A postCSS plugin for injecting settings and other values from Shopify's Liquid.

## Examples

### Basic usage - parameter can be quoted or unquoted.

Input

```css
a {
  color: liquid-object(settings.text_color);
}
```

Output

```css
a {
  color: {{ settings.text_color }};
}
```

### Supports filters - must be quoted

Input

```css
a {
  color: liquid-object("settings.text_color | color_modify: 'alpha', 0.5");
}
```

Output

```css
a {
  color: {{ settings.text_color | color_modify: 'alpha', 0.5 }};
}
```

### Supports nested functions.

Input

```css
a {
  color: calc(liquid-object("width | divided_by: 2")% + 50px);
}
```

Output

```css
a {
  color: calc({{ width | divided_by: 2 }}% + 50px);
}
```

### Support use within at-rule parameters

Input

```css
@media max-width: liquid-object("settings.max_width | append: 'px'") {
  color: blue;
}
```

Output

```css
@media max-width: {{ settings.max_width | append: 'px' }} {
  color: blue;
}
```

## Usage

Check you project for existing PostCSS config: `postcss.config.js`
in the project root, `"postcss"` section in `package.json`
or `postcss` in bundle config.

If you already use PostCSS, add the plugin to plugins list:

```diff
module.exports = {
  plugins: [
+   require('@pixelunion/postcss-liquid-object'),
    require('autoprefixer')
  ]
}
```

If you do not use PostCSS, add it according to [official docs]
and set this plugin in settings.

[official docs]: https://github.com/postcss/postcss#usage
