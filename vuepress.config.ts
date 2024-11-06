import { defineUserConfig } from "vuepress";
import theme from "./src/theme.hope.js";

export default defineUserConfig({
  base: "/blogs/",

  lang: "zh-CN",
  title: "氯离子实验室",
  description: "这人总是捣鼓些奇奇怪怪的东西呢。",

  temp: ".temp",
  cache: ".cache",
  public: "public",
  dest: "dist",

  theme,

  // 和 PWA 一起启用
  shouldPrefetch: false,

  head: [
    // 导入相应链接
    ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
    [
      "link",
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
    ],
    [
      "link",
      {
        href: "https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@200..900&display=swap",
        rel: "stylesheet",
      },
    ],
  ],
});
