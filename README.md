# docusaurus-plugin-copy-temml-assets plugin

[![Version](https://img.shields.io/npm/v/@tats-u/docusaurus-plugin-copy-temml-assets)](https://npmjs.com/package/@tats-u/docusaurus-plugin-copy-temml-assets) [![NPM Downloads](https://img.shields.io/npm/dm/@tats-u/docusaurus-plugin-copy-temml-assets)](https://npmjs.com/package/@tats-u/docusaurus-plugin-copy-temml-assets) [![NPM Last Update](https://img.shields.io/npm/last-update/@tats-u/docusaurus-plugin-copy-temml-assets)](https://npmjs.com/package/@tats-u/docusaurus-plugin-copy-temml-assets)

This plugin copies [Temml](https://temml.org) assets to the build directory.

Demo: https://tats-u.github.io/docusaurus-plugin-copy-temml-assets (uses [Noto Sans Math](https://fonts.google.com/noto/specimen/Noto+Sans+Math))

## Why Temml instead of KaTeX?

- Can use the other fonts (including local fonts) than Latin Modern.
- Can reduce the download size if you stick to local fonts.
- Can reduce the number of deployment files.
- Supports more LaTeX features.
- Output is simpler (KaTeX outputs invisible MathML tags too).

## How to Use

Install the plugin and [`@daiji256/rehype-mathml`](https://github.com/daiji256/rehype-mathml) (instead of `rehype-katex`):

```
npm install @tats-u/docusaurus-plugin-copy-temml-assets @daiji256/rehype-mathml
```

This package exports the following plugin and companion types and variables:

| Name | Description |
| --- | --- |
| `copyTemmlAssetsPlugin` | Docusaurus plugin to copy KaTeX assets |
| `CopyTemmlAssetsPluginOptions` | Configuration options for the plugin |
| `getTemmlStyleSheet` | Ditto, but with custom base URL |
| `getTemmlCssPath` | Ditto, but with custom base URL |

Then add plugins to `docusaurus.config.js`:

```js
import remarkMath from 'remark-math';
import rehypeMathml from '@daiji256/rehype-mathml';
import { copyTemmlAssetsPlugin, getTemmlStyleSheet } from '@tats-u/docusaurus-plugin-copy-temml-assets';

/**
 * @import { CopyTemmlAssetsPluginOptions } from '@tats-u/docusaurus-plugin-copy-temml-assets';
 */

const remarkPlugins = [remarkMath];
// Use @daiji256/rehype-mathml instead of rehype-katex
const rehypePlugins = [rehypeMathMl];

const baseUrl = '/';

// You must use satisfies in TypeScript
const temmlPluginOptions = /** @satisfies {CopyTemmlAssetsPluginOptions} */ ({
  baseUrl,
  fontPath: 'path/to/font.woff2',
});

const config = {
  // ...
  baseUrl,
  stylesheets: [
    // ...
    getTemmlStyleSheet(temmlPluginOptions),
  ],
  plugins: [
    // ...
    [copyTemmlAssetsPlugin, temmlPluginOptions],
  ],
  // ...
  presets: [
    [
      'classic',
      /** @satisfies {import('docusaurus/preset-classic').PresetConfig} */ (
        {
          docs: {
            // If you use docs
            docs: {
              // ...
              remarkPlugins,
              rehypePlugins,
            },
            // If you use blog
            blog: {
              // ...
              remarkPlugins,
              rehypePlugins,
            },
            // If you customize pages
            pages: {
              // ...
              remarkPlugins,
              rehypePlugins,
            },
          },
        },
      ),
    ],
  ],
}
```

> [!NOTE]
> For TypeScript, use the following instead:
>
> ```ts
> import {
>   type CopyTemmlAssetsPluginOptions,
>   copyTemmlAssetsPlugin,
>   getTemmlStyleSheet,
> } from '@tats-u/docusaurus-plugin-copy-temml-assets';
> ```

### Compatibility with Docusaurus Faster

This plugin is compatible with [Docusaurus Faster](https://github.com/facebook/docusaurus/issues/10556).

### Configuration

The default deployed path is `/assets/temml-{Temml version}/Temml-{Font type}.css`. If you want to change the path, pass `assetsRoot` to the plugin:

```js
const temmlPluginOptions = /** @satisfies {CopyTemmlAssetsPluginOptions} */ ({
  baseUrl,
  fontPath: 'path/to/font.woff2',
  assetsRoot: 'assets/temml',
});
```

> [!NOTE]
> For TypeScript, use `{ ... } satisfies CopyTemmlAssetsPluginOptions` instead.

`fontPreset` is automatically detected from the basename of `fontPath` if not specified. If the basename is irregular, you can specify it manually:

```js
const temmlPluginOptions = /** @satisfies {CopyTemmlAssetsPluginOptions} */ ({
  baseUrl,
  fontPath: 'path/to/stix2.woff2', // Standard name: STIXTwoMath.woff2
  fontPreset: 'STIX2',
});
```

## Acknowledgement

This plugin is derived from [docusaurus-copy-plugin](https://github.com/rlamana/docusaurus-plugin-copy). Thanks to [Ramón Lamana (@rlamana)](https://github.com/rlamana) for the original work.

## Demo Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

### Installation

```
$ pnpm i
```

### Local Development

```
$ node --run start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
$ node --run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.
