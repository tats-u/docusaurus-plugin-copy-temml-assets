import { posix, sep } from "node:path";
import type { PluginModule } from "@docusaurus/types";
import { version as katexVersion } from "katex";

/**
 * Default KaTeX CSS path
 *
 * You can pass this to `href` of `config.stylesheets` array or `<link>` tag.
 */
export const katexCssPath = `/assets/katex-${katexVersion}/katex.min.css`;

/**
 * Default KaTeX style sheet entry for `config.stylesheets` array.
 *
 * You can pass this to `config.stylesheets` array.
 */
export const katexStyleSheet = {
  href: katexCssPath,
  type: "text/css",
} as const;

export interface CopyKatexAssetsPluginOptions {
  /**
   * Pass `true` if you are using Docusaurus Faster
   */
  useRspack?: boolean;
  /**
   * Assets root path
   *
   * If you change this, {@linkcode katexCssPath} and {@linkcode katexStyleSheet} will be _useless_.
   *
   * The value shall not be started with `/`.
   *
   * @default `assets/katex-${katexVersion}`
   */
  assetsRoot?: string;
}

type WebpackPluginOptions = ConstructorParameters<
  typeof import("copy-webpack-plugin")
>[0] &
  ConstructorParameters<typeof import("@rspack/core")["CopyRspackPlugin"]>[0];

export const copyKatexAssetsPlugin: PluginModule = (_context, options) => {
  const assetsRoot =
    (options as CopyKatexAssetsPluginOptions)?.assetsRoot ??
    // Don't start with `/` here
    `assets/katex-${katexVersion}`;
  const CopyWebpackPlugin = (options as CopyKatexAssetsPluginOptions)?.useRspack
    ? require("@rspack/core").CopyRspackPlugin
    : require("copy-webpack-plugin");
  const katexCssPath = require.resolve("katex/dist/katex.min.css");
  return {
    name: "copy-katex-assets",
    configureWebpack: () => {
      return {
        plugins: [
          new CopyWebpackPlugin({
            patterns: [
              {
                from: katexCssPath,
                to: `${assetsRoot}/katex.min.css`,
              },
              {
                // glob doesn't support Windows-style paths
                from: posix.join(
                  posix.dirname(katexCssPath.replaceAll(sep, posix.sep)),
                  "fonts",
                  "*.woff2",
                ),
                to: `${assetsRoot}/fonts/[name][ext]`,
              },
            ],
          } satisfies WebpackPluginOptions),
        ],
      };
    },
    getPathsToWatch: () => [require.resolve("katex/package.json")],
  };
};

export default copyKatexAssetsPlugin;
