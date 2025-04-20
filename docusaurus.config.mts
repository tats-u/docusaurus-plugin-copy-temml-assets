import rehypeMathMl from "@daiji256/rehype-mathml";
import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import {
  type CopyTemmlAssetsPluginOptions,
  copyTemmlAssetsPlugin,
  getTemmlStyleSheet,
} from "@tats-u/docusaurus-plugin-copy-temml-assets";
import { themes as prismThemes } from "prism-react-renderer";
import remarkMath from "remark-math";

const remarkPlugins = [remarkMath];
const rehypePlugins = [rehypeMathMl];

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const isSlower = ((value: string | undefined) =>
  value && /^(t(rue)?|y(es)?|1)$/i.test(value))(process.env.IS_SLOWER);

const baseUrl = "/docusaurus-plugin-copy-temml-assets/";

const temmlPluginOptions = {
  baseUrl,
  fontPath: require.resolve("./src/NotoSansMath-Regular.ttf"),
} satisfies CopyTemmlAssetsPluginOptions;

const config: Config = {
  title: "Math Expressions Test",
  tagline: "Dinosaurs are cool",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://tats-u.github.com",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl,

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "tats-u", // Usually your GitHub org/user name.
  projectName: "docusaurus-plugin-copy-temml-assets", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  future: {
    experimental_faster: !isSlower,
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: false,
        pages: {
          remarkPlugins,
          rehypePlugins,
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],
  stylesheets: [getTemmlStyleSheet(temmlPluginOptions)],

  plugins: [[copyTemmlAssetsPlugin, temmlPluginOptions]],

  themeConfig: {
    // Replace with your project's social card
    image: "img/docusaurus-social-card.jpg",
    navbar: {
      title: "Math Expressions Test",
      logo: {
        alt: "My Site Logo",
        src: "img/logo.svg",
      },
      items: [],
    },
    footer: {
      style: "dark",
      links: [],
      copyright: "Built with Docusaurus.",
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    colorMode: {
      respectPrefersColorScheme: true,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
