import { posix, sep } from "node:path";
import type { PluginModule } from "@docusaurus/types";
import { version as katexVersion } from "katex";

/**
 * Default KaTeX CSS path
 *
 * You can pass this to `href` of `config.stylesheets` array or `<link>` tag.
 */
export const defaultKaTeXCssPath = `/assets/katex-${katexVersion}/katex.min.css`;

/**
 * Similar to {@linkcode defaultKaTeXCssPath}, but with custom base URL
 *
 * @param baseUrl The base URL of your website. Same as that of `baseUrl` in `docusaurus.config.js`
 * @returns KaTeX CSS path
 */
export function getKaTeXCssPath(baseUrl: string): string {
  return posix.join(baseUrl, defaultKaTeXCssPath);
}

/**
 * Default KaTeX style sheet entry for `config.stylesheets` array.
 *
 * You can pass this to `config.stylesheets` array.
 */
export const defaultKaTeXStyleSheet = {
  href: defaultKaTeXCssPath,
  type: "text/css",
} as const;

export interface CopyKaTeXAssetsPluginOptions {
  /**
   * Pass `true` if you are using Docusaurus Faster
   */
  useRspack?: boolean;
  /**
   * Assets root path
   *
   * If you change this, {@linkcode defaultKaTeXCssPath} and {@linkcode defaultKaTeXStyleSheet} will be _useless_.
   *
   * The value shall not be started with `/`.
   *
   * @default `assets/katex-${katexVersion}`
   */
  assetsRoot?: string;
  /**
   * Base URL
   *
   * Pass this if you deploy Docusaurus to a subpath (e.g. GitHub Pages for repositories)
   *
   * Won't be used if `assetsRoot` is passed
   */
  baseUrl?: string;
}

/**
 * Return a KaTeX style sheet entry for `config.stylesheets` array.
 *
 * The returned object is same as {@linkcode defaultKaTeXStyleSheet} but `href` is prefixed with given `baseUrl`.
 *
 * @param baseUrl The base URL of your website. Same as that of `baseUrl` in `docusaurus.config.js`
 * @returns A KaTeX style sheet entry for `config.stylesheets` array
 */
export function getKaTeXStyleSheet(
  baseUrl: string,
): typeof defaultKaTeXStyleSheet {
  return {
    type: "text/css",
    // Slash won't be duplicated
    href: getKaTeXCssPath(baseUrl),
  };
}

type WebpackPluginOptions = ConstructorParameters<
  typeof import("copy-webpack-plugin")
>[0] &
  ConstructorParameters<typeof import("@rspack/core")["CopyRspackPlugin"]>[0];

/**
 * Docusaurus plugin to copy KaTeX assets
 */
export const copyKaTeXAssetsPlugin: PluginModule = (_context, options) => {
  const assetsRoot =
    (options as CopyKaTeXAssetsPluginOptions)?.assetsRoot?.replace(/^\//, "") ??
    // Don't start with `/` here
    `${(options as CopyKaTeXAssetsPluginOptions)?.baseUrl?.replace(/^\//, "") ?? ""}assets/katex-${katexVersion}`;
  const CopyWebpackPlugin = (options as CopyKaTeXAssetsPluginOptions)?.useRspack
    ? require("@rspack/core").CopyRspackPlugin
    : require("copy-webpack-plugin");
  const katexCssPath = require.resolve("katex/dist/katex.min.css");
  return {
    name: "copy-katex-assets",
    configureWebpack: (config) => {
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

export default copyKaTeXAssetsPlugin;
