# Turbo build tools

Welcome! We have included some convenient tools to allow more convenient theme customization by giving you access to our original source code.

In particular, we are now shipping our styles in a `.css` file, which means you can no longer go in directly and have full access to all the Sass goodness.

Instead, you can modify our original scss files in `source/styles` and compile them to css using our build script.

## Prerequisties

1) Comfortable using the command line

2) A recent version of [Node.js](https://nodejs.org/en/) installed. If you run into errors, a newer version may help.

3) A basic familiarity with Node packages and use of `npm`, or `yarn`. [Here](https://nodejs.dev/learn/an-introduction-to-the-npm-package-manager) is a brief introduction, or you can view the official [npm](https://docs.npmjs.com/cli/v6/commands) or [Yarn](https://yarnpkg.com/getting-started) documentation

## Installation

1) Using the terminal, navigate to the root theme directory (this is the same directory as the `package.json` file), run `npm i` to install the dependencies.

2) Test the styles build script by running `npm run build`. This will recompile the stylesheets (`assets/styles.css.liquid` and `assets/gift-card.css.liquid`) from source. **Warning!! This will overwrite the existing theme files**

3) If the builds completed without errors, you are now ready to start editing! If not, double check that the dependencies were installed per step #1.

## Styles (CSS/SCSS)

Styles are process using [postCSS](https://postcss.org/), and have full scss support via [Dart Sass](https://github.com/sass/dart-sass).

The following plugins (and a stringifier) are applied, and the result output to the build folder as a `.css.liquid` file.

- [PostCSS easy import](https://github.com/trysound/postcss-easy-import)
- [PostCSS strip inline comments](https://www.npmjs.com/package/postcss-strip-inline-comments)
- [PostCSS Node Sass](https://www.npmjs.com/package/postcss-node-sass)
- [Autoprefixer](https://www.npmjs.com/package/autoprefixer)
- [postcss-liquid-if](#postcss-liquid-if)
- [postcss-liquid-object](#postcss-liquid-object)
- [liquid-stringify](#liquid-stringify)

### Special syntax

Since we're now running Sass **before** Liquid, we need a way to include Liquid code in our styles in a way that Sass can understand. For that, we've added several postCSS plugins to handle this new custom syntax.

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


