import { posix, sep } from "node:path";
import type { CurrentBundler, PluginModule } from "@docusaurus/types";
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
   * @deprecated No effect. Whether [Docusaurus Faster](https://github.com/facebook/docusaurus/issues/10556) is used is automatically detected now.
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
  ConstructorParameters<
    typeof import("@docusaurus/faster")["rspack"]["CopyRspackPlugin"]
  >[0];

const isPosix = sep === posix.sep;

/**
 * Docusaurus plugin to copy KaTeX assets
 */
export const copyKaTeXAssetsPlugin: PluginModule = (_context, options) => {
  const assetsRoot =
    (options as CopyKaTeXAssetsPluginOptions)?.assetsRoot?.replace(/^\//, "") ??
    // Don't start with `/` here
    `${(options as CopyKaTeXAssetsPluginOptions)?.baseUrl?.replace(/^\//, "") ?? ""}assets/katex-${katexVersion}`;
  const katexCssPath = require.resolve("katex/dist/katex.min.css");
  return {
    name: "copy-katex-assets",
    configureWebpack: (_config, _isServer, { currentBundler }) => {
      // currentBundler didn't exist before Docusaurus v3.6
      // https://app.unpkg.com/@docusaurus/types@3.5.0/files/src/plugin.d.ts#L56-65
      // https://app.unpkg.com/@docusaurus/types@3.5.0/files/src/plugin.d.ts#L130
      const CopyPlugin =
        (currentBundler as typeof currentBundler | undefined)?.name === "rspack"
          ? (
            // getCopyPlugin (We can't use it here because Promise is disallowed): https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-bundler/src/currentBundler.ts
            // FasterModule: https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-bundler/src/importFaster.ts#L15
            // rspack Type: https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-faster/src/index.ts
            // biome-ignore format: trailing comma for import not allowed
              currentBundler.instance as unknown as typeof import(
                "@docusaurus/faster"
              )["rspack"]
            ).CopyRspackPlugin
          : require("copy-webpack-plugin");
      return {
        plugins: [
          new CopyPlugin({
            patterns: [
              {
                from: katexCssPath,
                to: `${assetsRoot}/katex.min.css`,
              },
              {
                // glob doesn't support Windows-style paths
                from: posix.join(
                  posix.dirname(
                    isPosix
                      ? katexCssPath // Fast path for POSIX
                      : katexCssPath.replaceAll(sep, posix.sep),
                  ),
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
