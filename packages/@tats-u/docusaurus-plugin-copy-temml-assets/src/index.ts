import { basename, posix, sep } from "node:path";
import type { PluginModule } from "@docusaurus/types";
import { version as temmlVersion } from "temml/package.json";

export type TemmlFontPreset =
  | "Local"
  | "Asana"
  | "Latin-Modern"
  | "Libertinus"
  | "NotoSans"
  | "STIX2";

const fontFileNameToPresetMap = new Map<
  string,
  Exclude<TemmlFontPreset, "Local">
>([
  ["Asana-Math.woff2", "Asana"],
  ["latinmodernmath.woff2", "Latin-Modern"],
  ["LibertinusMath-Regular.woff2", "Libertinus"],
  ["NotoSansMath-Regular.ttf", "NotoSans"],
  ["STIXTwoMath.woff2`", "STIX2"],
]);

const fontPresetToFileNameMap = new Map<TemmlFontPreset, string>([
  ["Asana", "Asana-Math.woff2"],
  ["Latin-Modern", "latinmodernmath.woff2"],
  ["Libertinus", "LibertinusMath-Regular.woff2"],
  ["NotoSans", "NotoSansMath-Regular.ttf"],
  ["STIX2", "STIXTwoMath.woff2"],
]);

function resolveFontTypeFromPath(
  fontPath: string | undefined,
  noFallbackWarning?: boolean,
): TemmlFontPreset {
  if (fontPath === undefined) {
    return "Local";
  }
  const fontName = basename(fontPath);
  const result = fontFileNameToPresetMap.get(fontName);
  if (result !== undefined) {
    return result;
  }
  if (!noFallbackWarning) {
    console.warn(
      `Cannot resolve font type from path "${fontPath}". Fallback to "Local".`,
    );
  }
  return "Local";
}

export interface CopyTemmlAssetsPluginOptions {
  /**
   * Assets root path from the top page
   *
   * The value shall not be started with `/`.
   *
   * @default `assets/temml-${temmlVersion}`
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
  /**
   * Font type; can be inferred from {@linkcode fontPath}.
   *
   * - `"Local"` (default & fallback)
   * - `"Asana"`
   * - `"Latin-Modern"`
   * - `"Libertinus"`
   * - `"NotoSans"`
   * - `"STIX2"`
   */
  fontPreset?: TemmlFontPreset;
  /**
   * The path of custom font; {@linkcode fontPreset} will be auto-detected if the file name is one of:
   *
   * - `Asana-Math.woff2`
   * - `latinmodernmath.woff2`
   * - `LibertinusMath-Regular.woff2`
   * - `NotoSansMath-Regular.ttf` (Important: `woff2` is not supported by Temml CSS)
   * - `STIXTwoMath.woff2`
   */
  fontPath?: string;
  /**
   * Set `true` to disable the warning message when `fontPreset` is unspecified and cannot be inferred
   */
  noLocalFallbackWarning?: boolean;
  /**
   * Set `true` to disable the warning message when the file extension of `fontPath` is not that of the corresponding file name in {@linkcode fontPreset}
   *
   * e.g. .woff2 for Noto Sans Math (only .ttf is assumed by Temml CSS)
   *
   * If `true`, pass an additional CSS file defining the custom font to `config.stylesheets` in `docusaurus.config.js`
   */
  nonStandardFontFileExtension?: boolean;
}

function getCssFileName(options: CopyTemmlAssetsPluginOptions): string {
  const cssType =
    options.fontPreset ?? resolveFontTypeFromPath(options.fontPath);
  return `Temml-${cssType}.css`;
}

const defaultAssetsRoot = `assets/temml-${temmlVersion}`;

/**
 * Similar to {@linkcode defaultTemmlCssPath}, but with custom base URL
 *
 * @param baseUrl The base URL of your website. Same as that of `baseUrl` in `docusaurus.config.js`
 * @returns Temml CSS path
 */
export function getTemmlCssPath(options: CopyTemmlAssetsPluginOptions): string {
  const cssFileName = getCssFileName(options);
  return posix.join(
    options.baseUrl ?? "/",
    options.assetsRoot ?? defaultAssetsRoot,
    cssFileName,
  );
}

/**
 * Return a Temml style sheet entry for `config.stylesheets` array.
 *
 * The returned object is same as {@linkcode defaultTemmlStyleSheet} but `href` is prefixed with given `baseUrl`.
 *
 * @param baseUrl The base URL of your website. Same as that of `baseUrl` in `docusaurus.config.js`
 * @returns A Temml style sheet entry for `config.stylesheets` array
 */
export function getTemmlStyleSheet(options: CopyTemmlAssetsPluginOptions): {
  readonly type: "text/css";
  readonly href: string;
} {
  return {
    type: "text/css",
    // Slash won't be duplicated
    href: getTemmlCssPath(options),
  };
}

type WebpackPluginOptions = ConstructorParameters<
  typeof import("copy-webpack-plugin")
>[0] &
  ConstructorParameters<
    typeof import("@docusaurus/faster")["rspack"]["CopyRspackPlugin"]
  >[0];

/**
 * Docusaurus plugin to copy Temml assets
 */
export function copyTemmlAssetsPlugin(
  _context: Parameters<PluginModule>[0],
  options: CopyTemmlAssetsPluginOptions,
): ReturnType<PluginModule> {
  const assetsRoot =
    options?.assetsRoot?.replace(/^\//, "") ??
    // Don't start with `/` here
    defaultAssetsRoot;
  const fontPreset =
    options.fontPreset ?? resolveFontTypeFromPath(options.fontPath);
  const temmlCssName = getCssFileName(options);
  const temmlCssPath = require.resolve(`temml/dist/${temmlCssName}`);
  const defaultFontName = fontPresetToFileNameMap.get(fontPreset);
  const servedMathFontName =
    defaultFontName !== undefined &&
    options.fontPath !== undefined &&
    posix.extname(defaultFontName) === posix.extname(options.fontPath)
      ? defaultFontName
      : options.fontPath &&
        (() => {
          if (!options.nonStandardFontFileExtension) {
            console.warn(
              `The file extension of "${options.fontPath}" is not that of the corresponding file name in "${fontPreset}". Pass an additional CSS file defining the custom font to "config.stylesheets" in "docusaurus.config.js".`,
            );
          }
          return basename(options.fontPath);
        })();
  return {
    name: "copy-temml-assets",
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
                from: temmlCssPath,
                to: `${assetsRoot}/${temmlCssName}`,
              },
              {
                from: require.resolve("temml/dist/Temml.woff2"),
                to: `${assetsRoot}/Temml.woff2`,
              },
              ...(options.fontPath !== undefined
                ? [
                    {
                      from: options.fontPath,
                      to: `${assetsRoot}/${
                        // biome-ignore lint/style/noNonNullAssertion: undefined only if options.fontPath is undefined
                        servedMathFontName!
                      }`,
                    },
                  ]
                : []),
            ],
          } satisfies WebpackPluginOptions),
        ],
      };
    },
    getPathsToWatch: () => [
      require.resolve("temml/package.json"),
      temmlCssPath,
      ...(options.fontPath !== undefined ? [options.fontPath] : []),
    ],
  };
}

export default copyTemmlAssetsPlugin;
