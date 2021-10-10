const liquidVars = {
  fontDisplay: id => `fonts_${id}_display`,
  fontFamily: id => `fonts_${id}_family`,
  fontStyle: id => `fonts_${id}_style`,
  fontWeight: id => `fonts_${id}_weight`,
  fontStyleItalic: id => `fonts_${id}_style_italic`,
  fontWeightBolder: id => `fonts_${id}_weight_bolder`,
  fontWeightLighter: id => `fonts_${id}_weight_lighter`,
};

const liquidObject = value => `liquid-object(${value})`;

const liquidCustomFontTemplate = ({ id, variants }) => {
  const liquid = `
{%- comment -%}Custom{%- endcomment -%}
{%- assign font_family = '${id}_custom' -%}

{%- assign font_textarea = settings[font_family] -%}
{%- assign font_textarea_split = font_textarea | newline_to_br | split: '<br />' -%}
{%- assign font_additional_weights = '${variants.join(',')}' | split: ',' -%}

{%- for font in font_textarea_split -%}
  {%- assign font_split = font | split: ':' -%}
  {%- assign font_weight = 400 -%}
  {%- assign font_weight_name = 'initial' -%}
  {%- assign font_style = 'normal' -%}
  {%- assign font_style_name = 'initial' -%}

  {%- if font_split.size == 1 -%}
    {%- assign font_file = font_split[0] | strip -%}
  {%- else -%}
    {%- assign font_weight_style_space_to_hyphen = font_split[0] | replace: ' ', '-' -%}
    {%- assign font_weight_style = font_weight_style_space_to_hyphen | split: '-' -%}

    {%- if font_weight_style.size == 1 -%}
      {%- assign font_weight_style = font_weight_style[0] | strip | downcase -%}

      {%- if font_weight_style == 'italic' -%}
        {%- assign font_style_name = font_weight_style -%}
      {%- else -%}
        {%- assign font_weight_name = font_weight_style -%}
      {%- endif -%}
    {%- else -%}
      {%- assign font_weight_name = font_weight_style[0] | strip | downcase -%}
      {%- assign font_style_name = font_weight_style[1] | strip | downcase -%}
    {%- endif -%}

    {%- comment -%}
      At this point we should have valid a valid weight and style variables,
      we can continue onto the new iteration if it isnt valid.
    {%- endcomment -%}
    {%- if font_weight_name contains 'initial' != true and font_weight_name contains 'lighter' != true and font_weight_name contains 'bolder' != true -%}
      {%- continue -%}
    {%- endif -%}
    {%- if font_style_name != 'initial' and font_style_name != 'italic' -%}
      {%- continue -%}
    {%- endif -%}

    {%- if font_weight_name contains 'initial' -%}
      {%- if font_weight_name == 'initial' -%}
        {%- assign font_weight = 400 -%}
      {%- else -%}
        {%- assign font_weight_json = font_weight_name | split: 'initial' | last | plus: 0 | json -%}
        {%- assign font_weight_name = font_weight_name | split: font_weight_json | first -%}
        {%- if font_weight_json contains '"' -%}
          {%- assign font_weight = 400 -%}
        {%- else -%}
          {%- assign font_weight = font_weight_json -%}
        {%- endif -%}
      {%- endif -%}
    {%- elsif font_weight_name contains 'lighter' -%}
      {%- if font_weight_name == 'lighter' -%}
        {%- assign font_weight = 300 -%}
      {%- else -%}
        {%- assign font_weight_json = font_weight_name | split: 'lighter' | last | plus: 0 | json -%}
        {%- assign font_weight_name = font_weight_name | split: font_weight_json | first -%}
        {%- if font_weight_json contains '"' -%}
          {%- assign font_weight = 300 -%}
        {%- else -%}
          {%- assign font_weight = font_weight_json -%}
        {%- endif -%}
      {%- endif -%}
    {%- elsif font_weight_name contains 'bolder' -%}
      {%- if font_weight_name == 'bolder' -%}
        {%- assign font_weight = 700 -%}
      {%- else -%}
        {%- assign font_weight_json = font_weight_name | split: 'bolder' | last | plus: 0 | json -%}
        {%- assign font_weight_name = font_weight_name | split: font_weight_json | first -%}
        {%- if font_weight_json contains '"' -%}
          {%- assign font_weight = 700 -%}
        {%- else -%}
          {%- assign font_weight = font_weight_json -%}
        {%- endif -%}
      {%- endif -%}
    {%- endif -%}

    {%- if font_style_name == 'italic' -%}
      {%- assign font_style = 'italic' -%}
    {%- endif -%}

    {%- assign font_file = font_split[1] | strip -%}
  {%- endif -%}

  {%- unless font_weight_name == 'initial' -%}
    {%- unless font_additional_weights contains font_weight_name -%}
      {%- continue -%}
    {%- endunless -%}
  {%- endunless -%}

  {%- assign font_file_split = font_file | split: '.' -%}

  {%- comment -%}
    If the assumed file component has a format associated with it,
    treat it as a file otherwise treat it as a family name and dont output a font face.
  {%- endcomment -%}
  {% if font_file_split.size > 1 %}
    {%- assign font_file_format_index = font_file_split | size | minus: 1 -%}
    {%- assign font_format = font_file_split[font_file_format_index] | strip -%}

    {%- comment -%}
      By checking if a font_file contains a forward slash we can
      determine whether we should treat the file as absolute URL
      or a file that must be sent through the file_url filter.

      This allows externally hosted files to be used as custom fonts.
    {%- endcomment -%}
    @font-face {
      font-family: "{{ font_family }}";
      font-weight: {{ font_weight }};
      font-style: {{ font_style }};
      font-display: {{ ${liquidVars.fontDisplay(id)} }};
      src:
        url("{%- if font_file contains '/' -%}{{ font_file }}{%- else -%}{{ font_file | file_url }}{%- endif -%}")
        format("{{ font_format }}");
    }
  {% else %}
    {%- assign font_family = font_file -%}
  {% endif %}

  {%- if font_weight_name == 'initial' and font_style_name != 'italic' -%}
    {%- assign ${liquidVars.fontFamily(id)} = font_family -%}
    {%- assign ${liquidVars.fontStyle(id)} = font_style -%}
    {%- assign ${liquidVars.fontWeight(id)} = font_weight -%}
    {%- assign ${liquidVars.fontStyleItalic(id)} = 'italic' -%}
  {%- elsif font_weight_name == 'lighter' -%}
    {%- assign ${liquidVars.fontWeightLighter(id)} = font_weight -%}
  {%- elsif font_weight_name == 'bolder' -%}
    {%- assign ${liquidVars.fontWeightBolder(id)} = font_weight -%}
  {%- endif -%}
{%- endfor -%}
`;

  return liquid;
};

const liquidFontTemplate = ({
  id,
  variants = [],
  fontDisplay,
  fontFamily,
  allowCustom,
}) => {
  let liquid = `
{%- comment -%}${id}{%- endcomment -%}
  `;

  if (fontDisplay) {
    liquid += `
{%- assign ${liquidVars.fontDisplay(id)} = ${fontDisplay} | default: 'auto' -%}
    `;
  } else {
    liquid += `
{%- assign ${liquidVars.fontDisplay(id)} = 'auto' -%}
    `;
  }

  if (fontFamily) {
    liquid += `
{%- if ${fontFamily} and ${fontFamily} != 'disable' -%}
  {%- comment -%}Font family override{%- endcomment -%}
  {%- assign ${liquidVars.fontFamily(id)} = ${fontFamily} -%}
  {%- assign ${liquidVars.fontStyle(id)} = 'normal' -%}
  {%- assign ${liquidVars.fontWeight(id)} = 400 -%}
  {%- assign ${liquidVars.fontStyleItalic(id)} = 'italic' -%}
  {%- assign ${liquidVars.fontWeightBolder(id)} = 700 -%}
  {%- assign ${liquidVars.fontWeightLighter(id)} = 300 -%}
{%- else -%}
    `;
  }

  liquid += `
  {%- comment -%}Normal{%- endcomment -%}

  {%- assign ${liquidVars.fontFamily(id)} = settings.${id}.family | append: ',' | append: settings.${id}.fallback_families -%}
  {%- assign ${liquidVars.fontStyle(id)} = settings.${id}.style -%}
  {%- assign ${liquidVars.fontWeight(id)} = settings.${id}.weight | times: 1 -%}
  {{ settings.${id} | font_face: font_display: ${liquidVars.fontDisplay(id)} }}

  {%- comment -%}Italic{%- endcomment -%}

  {%- assign ${liquidVars.fontStyleItalic(id)} = settings.${id} | font_modify: 'style', 'italic' | map: 'style' | default: 'italic' -%}
  {{ settings.${id} | font_modify: 'style', 'italic' | font_face: font_display: ${liquidVars.fontDisplay(id)} }}
  `;

  if (variants.includes('bolder')) {
    liquid += `
  {%- comment -%}Bolder{%- endcomment -%}

  {%- assign fonts_weight_adjustment_default = 700 -%}
  {%- if fonts_${id}_weight > 700 -%}
    {%- assign fonts_weight_adjustment_default = ${liquidVars.fontWeight(id)} -%}
  {%- endif -%}
  {%- assign fonts_${id}_bolder = settings.${id} | font_modify: 'weight', 'bolder' -%}
  {%- assign ${liquidVars.fontWeightBolder(id)} = fonts_${id}_bolder.weight | default: fonts_weight_adjustment_default -%}
  {{ fonts_${id}_bolder | font_face: font_display: ${liquidVars.fontDisplay(id)} }}
  {{ fonts_${id}_bolder | font_modify: 'style', 'italic' | font_face: font_display: ${liquidVars.fontDisplay(id)} }}
    `;
  }

  if (variants.includes('lighter')) {
    liquid += `
  {%- comment -%}Lighter{%- endcomment -%}

  {%- assign fonts_weight_adjustment_default = 300 -%}
  {%- if fonts_${id}_weight < 300 -%}
    {%- assign fonts_weight_adjustment_default = ${liquidVars.fontWeight(id)} -%}
  {%- endif -%}
  {%- assign fonts_${id}_lighter = settings.${id} | font_modify: 'weight', 'lighter' -%}
  {%- assign ${liquidVars.fontWeightLighter(id)} = fonts_${id}_lighter.weight | default: fonts_weight_adjustment_default -%}
  {{ fonts_${id}_lighter | font_face: font_display: ${liquidVars.fontDisplay(id)} }}
  {{ fonts_${id}_lighter | font_modify: 'style', 'italic' | font_face: font_display: ${liquidVars.fontDisplay(id)} }}
    `;
  }

  if (allowCustom) {
    // liquidCustomFontTemplate will override the relevant liquid font
    // variables when custom fonts are defined.
    liquid += liquidCustomFontTemplate({ id, variants });
  }

  if (fontFamily) {
    liquid += `
{%- endif -%}
    `;
  }

  return liquid;
};

module.exports = { liquidVars, liquidObject, liquidFontTemplate };
