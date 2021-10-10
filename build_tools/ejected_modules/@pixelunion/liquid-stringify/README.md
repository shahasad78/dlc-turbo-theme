# Liquid Stringify

A postCSS stringifier to output Liquid code directly into the resulting css.

[PostCSS]: https://github.com/postcss/postcss

Often Liquid code can be included directly by wrapping it with CSS comments - it will be ignored by all CSS processing, then executed as Liquid code. However, any output from the Liquid code remains wrapped in the CSS comments, which can be a problem - as when using the `| font_face` filter, for example. The then-empty comments will also be included in the final CSS, which is a waste of bandwidth. Also - as of March 2020 the Shopify Theme Editor strips all CSS comments (even if they contain liquid) before liquid parsing, for compatibility with color live-updating.

This package allows arbitrary Liquid code to be included in CSS comments. After all CSS processing has finished, these comments will be unwrapped and the contents will be injected directly into the output.

Input

```css
/* {{ 'hello world' }} */

/* This is a comment without any liquid tags */
```

Output

```css
  {{ 'hello world' }}

/* This is a comment without any liquid tags */
```

The stringifier will not modify comments within properties or values.

Input

```css
a {
  color: /*{{ my_color }}*/red;
}
```

Output (is unchanged)

```css
a {
  color: /*{{ my_color }}*/red;
}
```

**Caution**

The stringifier will unwrap all content if the comment contains a liquid tag, which could lead to content being unintentionally included in the stylesheet. In example below the comment text appears in the stylesheet, and the text will get liquid value of `my_color` applied, instead of `red`.

In this case the commented code could be wrapped in liquid comments (inside the CSS comments), or, in an scss style build system, you could use `//` comments which are typically removed from the final generated CSS. Or just delete it and use the power of git.

Input

```css
a {
  color: red;
}
/*
Temporarily commented out because I'm testing some hard coded colors
a {
  color: {{ my_color }};
}
*/
```

Output

```css
a {
  color: red;
}

Temporarily commented out because I'm testing some hard coded colors
a {
  color: {{ my_color }};
}

```

## Usage

Check you project for existed PostCSS config: `postcss.config.js`
in the project root, `"postcss"` section in `package.json`
or `postcss` in bundle config.

If you already use PostCSS, set the Liquid stringifier:

```diff
module.exports = {
  plugins: [...],
  stringifier: require('@pixelunion/liquid-stringify'),
}
```

If you do not use PostCSS, add it according to [official docs]
and set this stringifier in config options.

[official docs]: https://github.com/postcss/postcss#usage
