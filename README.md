# docusaurus-plugin-copy-katex-assets plugin

This plugin copies KaTeX assets to the build directory. This makes it unnecessary to [load KaTeX assets from the CDN](https://docusaurus.io/docs/markdown-features/math-equations).

Demo: https://tats-u.github.io/docusaurus-plugin-copy-katex-assets

## How to Use

Install the plugin:

```
npm install @tats-u/docusaurus-plugin-copy-katex-assets
```

This package exports the following plugin and companion types and variables:

| Name | Description |
| --- | --- |
| `copyKaTeXAssetsPlugin` | Docusaurus plugin to copy KaTeX assets |
| `CopyKaTeXAssetsPluginOptions` | Configuration options for the plugin |
| `defaultKaTeXStyleSheet` | Default KaTeX style sheet entry for `config.stylesheets` array |
| `getKaTeXStyleSheet` | Ditto, but with custom base URL |

Then add the plugin to `docusaurus.config.js`:

```js
import { copyKatexAssetsPlugin, defaultKaTeXStyleSheet } from '@tats-u/docusaurus-plugin-copy-katex-assets';

/**
 * @import { CopyKaTeXAssetsPluginOptions } from '@tats-u/docusaurus-plugin-copy-katex-assets';
 */

const config = {
  // ...
  stylesheets: [
    // ...
    defaultKaTeXStyleSheet,
  ],
  plugins: [
    // ...
    copyKatexAssetsPlugin,
  ],
}
```

### Configuration

If you are using [Docusaurus Faster](https://github.com/facebook/docusaurus/issues/10556), pass `useRspack: true` to the plugin:

```js
const config = {
  // ...
  plugins: [
    // ...
    [
      copyKatexAssetsPlugin,
      /** @satisfies {CopyKaTeXAssetsPluginOptions} */({ useRspack: true }),
    ],
  ],
}
```

The default deployed path is `/assets/katex-{KaTeX version}/katex.min.css`. If you want to change the path, pass `assetsRoot` to the plugin:

```js
const config = {
  // ...
  plugins: [
    // ...
    [
      copyKatexAssetsPlugin,
      // Important: Path shall not start with `/`.
      /** @satisfies {CopyKaTeXAssetsPluginOptions} */({ assetsRoot: 'assets/katex' }),
    ],
  ],
}
```

If you want to use a custom base URL, pass `baseUrl` to the plugin, and use `getKaTeXStyleSheet` instead of `defaultKaTeXStyleSheet`:

```js
const baseUrl = '/your-repo-name/';

const config = {
  // ...
  baseUrl,
  // ...
  stylesheets: [
    // ...
    getKaTeXStyleSheet(baseUrl),
  ],
  plugins: [
    // ...
    [
      copyKatexAssetsPlugin,
      /** @satisfies {CopyKaTeXAssetsPluginOptions} */({ baseUrl }),
    ],
  ],
}
```

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
