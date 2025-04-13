# docusaurus-plugin-copy-katex-assets plugin

This plugin copies KaTeX assets to the build directory. This makes it unnecessary to [load KaTeX assets from the CDN](https://docusaurus.io/docs/markdown-features/math-equations).

## How to Use

Install the plugin:

```
npm install @tats-u/docusaurus-plugin-copy-katex-assets
```

This package exports the following plugin and companion types and variables:

| Name | Description |
| --- | --- |
| `copyKatexAssetsPlugin` | Docusaurus plugin to copy KaTeX assets |
| `CopyKatexAssetsPluginOptions` | Configuration options for the plugin |
| `katexStyleSheet` | Default KaTeX style sheet entry for `config.stylesheets` array |

Then add the plugin to `docusaurus.config.js`:

```js
import { copyKatexAssetsPlugin, katexStyleSheet } from '@tats-u/docusaurus-plugin-copy-katex-assets';

/**
 * @import { CopyKatexAssetsPluginOptions } from '@tats-u/docusaurus-plugin-copy-katex-assets';
 */

const config = {
  // ...
  stylesheets: [
    // ...
    katexStyleSheet,
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
      /** @satisfies {CopyKatexAssetsPluginOptions} */({ useRspack: true }),
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
      /** @satisfies {CopyKatexAssetsPluginOptions} */({ assetsRoot: 'assets/katex' }),
    ],
  ],
}
```
