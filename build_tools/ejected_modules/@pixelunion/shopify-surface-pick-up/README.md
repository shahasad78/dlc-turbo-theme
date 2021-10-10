# shopify-surface-pick-up

Liquid section, styles, scripts, and locales to support Shopify surface pick-up in-store availability

- [Peer dependencies](#peer-dependencies)
- [Liquid](#liquid)
- [CSS](#css)
- [Javascript](#javascript)
- [Locales](#locales)

## Liquid

The included Liquid section is automatically included via Paskit when a theme is built,
no additional steps are needed.

## CSS

Base stylesheet provides general layout and styling and is recommended as a starting point. Styles can be adjusted using the provided CSS variables, or by directly styling elements:

```scss
@import '../../../node_modules/@pixelunion/shopify-surface-pick-up/src/styles/surface-pick-up';

// Apply theme-specific overrides after importing
.surface-pick-up-embed {
  --surface-pick-up-embed-theme-success-color: rgba(50,205,50,1);
  --surface-pick-up-embed-theme-error-color: rgba(179,58,58,1);
  --surface-pick-up-embed-theme-paragraph-font-size: 16px;
  --surface-pick-up-embed-theme-paragraph-smaller-font-size: calc(var(--surface-pick-up-embed-theme-paragraph-font-size) - 4px);
  --surface-pick-up-embed-theme-body-font-weight-bold: 600; // or font-weight($font-body, $font-weight: bold);
  --surface-pick-up-embed-theme-body-text-color: #808080;
  --surface-pick-up-embed-theme-link-text-decoration: underline;
  --surface-pick-up-embed-row-gap: 10px;
  --surface-pick-up-embed-column-gap: 10px;
}

.surface-pick-up-item {
  --surface-pick-up-item-theme-success-color: rgba(50,205,50,1);
  --surface-pick-up-item-theme-error-color: rgba(179,58,58,1);
  --surface-pick-up-item-theme-paragraph-font-size: 16px;
  --surface-pick-up-item-theme-paragraph-smaller-font-size: calc(var(--surface-pick-up-item-theme-paragraph-font-size) - 4px);
  --surface-pick-up-item-theme-body-font-weight-bold: 600;
  --surface-pick-up-item-theme-body-text-color: #808080;
  --surface-pick-up-item-theme-border-color: #d9d9d9;
  --surface-pick-up-item-theme-link-text-decoration: underline;
  --surface-pick-up-item-row-gap: 10px;
  --surface-pick-up-item-column-gap: 5px;
  --surface-pick-up-item-gap: 28px;
}
```

### --surface-pick-up-(embed|item)-theme-success-color

The theme's success color, used to style the in-stock icons

```css
USAGE
  .surface-pick-up-embed {
    --surface-pick-up-embed-theme-success-color: rgba(50,205,50,1);
  }

  .surface-pick-up-item {
    --surface-pick-up-item-theme-success-color: rgba(50,205,50,1);
  }
```

### --surface-pick-up-(embed|item)-theme-error-color

The theme's error color, used to style the out-of-stock icons

```css
USAGE
  .surface-pick-up-embed {
    --surface-pick-up-embed-theme-error-color: rgba(50,205,50,1);
  }

  .surface-pick-up-item {
    --surface-pick-up-item-theme-error-color: rgba(50,205,50,1);
  }
```

### --surface-pick-up-(embed|item)-theme-paragraph-font-size

The theme's paragraph font size, used to style certain text content
based on Shopify's UX/UI requirements

```css
USAGE
  .surface-pick-up-embed {
    --surface-pick-up-embed-theme-paragraph-font-size: 16px;
  }

  .surface-pick-up-item {
    --surface-pick-up-item-theme-paragraph-font-size: 16px;
  }
```

### --surface-pick-up-(embed|item)-theme-paragraph-smaller-font-size

A font size smaller than the theme's paragraph font size used to style certain text content
based on Shopify's UX/UI requirements. By default, it uses the theme paragraph font size variable,
and reduces the size.

```css
USAGE
  .surface-pick-up-embed {
    --surface-pick-up-embed-theme-paragraph-smaller-font-size: calc(var(--surface-pick-up-embed-theme-paragraph-font-size) - 4px);
  }

  .surface-pick-up-item {
    --surface-pick-up-item-theme-paragraph-smaller-font-size: calc(var(--surface-pick-up-item-theme-paragraph-font-size) - 4px);
  }
```

### --surface-pick-up-(embed|item)-theme-body-text-color

The theme's body text color, used to style certain text content
based on Shopify's UX/UI requirements

```css
USAGE
  .surface-pick-up-embed {
    --surface-pick-up-embed-theme-body-text-color: #808080;
  }

  .surface-pick-up-item {
    --surface-pick-up-item-theme-body-text-color: #808080;
  }
```

### --surface-pick-up-item-theme-border-color

The theme's border and lines color, used to style dividing lines between items as dictated by Shopify's UX/UI requirements

```css
USAGE
  .surface-pick-up-item {
    --surface-pick-up-item-theme-body-text-color: #d9d9d9;
  }
```

### --surface-pick-up-(embed|item)-theme-body-font-weight-bold

The theme's bold body text font weight, used to style certain text content
based on Shopify's UX/UI requirements

```css
USAGE
  .surface-pick-up-embed {
    --surface-pick-up-embed-theme-body-font-weight-bold: 600;
  }

  .surface-pick-up-item {
    --surface-pick-up-item-theme-body-font-weight-bold: 600;
  }
```

### --surface-pick-up-(embed|item)-theme-link-text-decoration

The theme's link text decoration, used to style the modal open button
to match the theme's link styling.

```css
USAGE
  .surface-pick-up-embed {
    --surface-pick-up-embed-theme-link-text-decoration: underline;
  }

  .surface-pick-up-item {
    --surface-pick-up-item-theme-link-text-decoration: underline;
  }
```

### --surface-pick-up-(embed|item)-(row|column)-gap

The row and column gap sizing for the surface pick up embed, and item
elements.

```css
USAGE
  .surface-pick-up-embed {
    --surface-pick-up-embed-row-gap: 10px;
    --surface-pick-up-embed-column-gap: 10px;
  }

  .surface-pick-up-item {
    --surface-pick-up-item-row-gap: 10px;
    --surface-pick-up-item-column-gap: 10px;
  }
```

### --surface-pick-up-item-gap

The horizontal gap sizing for between pick up items

```css
USAGE
  .surface-pick-up-item {
    --surface-pick-up-item-gap: 28px;
  }
```

### .surface-pick-up--loading

This class is applied to the pick up element (the element passed to the constructor) while data is loading to allow for convenient styling. By default, no loading styling is applied.

## Javascript

A `ShopifySurfacePickUp` instance must be instantiated for each product on the page.

| Parameter | Description |
|:------------------------|:----------------------------------------------------------|
| `el` | Element in which to inject the surface pick up markup |
| `options.root_url` | (optional) Shop's [root url](https://shopify.dev/docs/themes/liquid/reference/objects/routes#routes-root_url). If present, is used instead of the default [`window.Theme.routes.root_url` value](#multi-language) |

```js
import ShopifySurfacePickUp from '@pixelunion/shopify-surface-pick-up';

export default class Product {
  constructor({ el, data }) {
    const { variant } = data;

    this.el = el;
    this.surfacePickUpEl = this.el.querySelector('[data-surface-pick-up]'); // Element to inject surface pick up information into on product
    this.surfacePickUp = new ShopifySurfacePickUp(this.surfacePickUpEl);
    this.surfacePickUp.load(variant.id).then(el => {
      // Potentially switch from a loading state to a visible state
      // el represents the containing element, so in this example it would return
      // this.surfacePickUpEl
      // If the load was interrupted by another `.load` call (say the variant was changed again
      // before the pick up data was loaded), then el will be `null`.
    });
    this.surfacePickUp.onModalRequest(contents => {
      // Open modal and insert contents
    });
  }

  _onVariantChange(variant) {
    this.surfacePickUp.load(variant.id); // Update on variant change
  }

  onSectionUnload() {
    this.surfacePickUp.unload();
  }
}
```

### Multi-language

Multi-language is supported by default if the liquid [`routes.root_url`](https://shopify.dev/docs/themes/liquid/reference/objects/routes#routes-root_url) is assigned to a `window.Theme.routes.root_url` variable. The `root_url` value can also be passed as a parameter in the [options object](#javascript).

## Locales

Locale files are merged automatically in their respective theme files. No additional work is necessary unless
a language is missing, or the wording needs to be changed for the specific theme. The following are the used
language strings.

Translations are included for 22 languages: cs, es, it, nl, pt-PT, zh-CN, da, fi, ja, no, sv, zh-TW, de, en, fr, ko, pl, th, hi, ms, pt-BR and tr

```json
{
  "store_availability": {
    "general": {
      "in_stock": "In stock",
      "out_of_stock": "Out of stock",
      "view_store_info": "View store information",
      "check_other_stores": "Check availability at other stores",
      "available_for_pick_up_at_html":  "Pickup available at <b>{{ location_name }}</b>",
      "unavailable_for_pick_up_at_html":  "Pickup currently unavailable at <b>{{ location_name }}</b>",
      "available_for_pick_up_at_time_html": "Pickup available, {{ pick_up_time }}",
      "unavailable_for_pick_up_at_time_html": "Pickup currently unavailable",
      "kilometers": "km",
      "miles": "mi"
    }
  }
}
```
