# postcss-liquid-if

A postCSS plugin for transforming `@liquid-if`, `@liquid-elsif`, and `@liquid-else` at-rules into real Liquid syntax.

- Supports nesting
- Logical test is copied verbatim into Liquid

**Note!**

As of March 2020, the Shopify Theme Editor will remove all CSS comments to prevent conflicts with their live-updating for colors. This means that in the theme editor, **all** conditions will be output as if they were true, including all if, elsif, and else blocks for every statement. Using the `liquid-stringify` postCSS stringifier will unwrap liquid from CSS comments to prevent this.

Input

```css
@liquid-if "a == 'align-left'" {
  text-align: left;
}
```


Output

```css
/*{%- if a == 'align-left' -%}*/
  text-align: left;
/*{%- endif -%}*/
```

Input

Also supports single quotes
```css
@liquid-if 'a == blank' {
  text-align: left;
}
```


Output

```css
/*{%- if a == blank -%}*/
  text-align: left;
/*{%- endif -%}*/
```

Input

```css
@liquid-if "a == 'align-left'" {
  text-align: left;
} @liquid-elsif "a == 'align-right'" {
  text-align: right;
} @liquid-else {
  text-align: center;
}
```


Output

```css
/*{%- if a == 'align-left' -%}*/
  text-align: left;
/*{%- elsif a == 'align-right' -%}*/
  text-align: right;
/*{%- else -%}*/
  text-align: center;
/*{%- endif -%}*/
```

## Usage

Check you project for existing PostCSS config: `postcss.config.js`
in the project root, `"postcss"` section in `package.json`
or `postcss` in bundle config.

If you already use PostCSS, add the plugin to plugins list:

```diff
module.exports = {
  plugins: [
+   require('@pixelunion/postcss-liquid-if'),
    require('autoprefixer')
  ]
}
```

If you do not use PostCSS, add it according to [official docs]
and set this plugin in settings.

[official docs]: https://github.com/postcss/postcss#usage
