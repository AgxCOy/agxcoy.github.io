import { defineUserConfig } from "vuepress";
import theme from "./src/theme.hope.js";

export default defineUserConfig({
  base: "/",

  lang: "zh-CN",
  title: "氯喵の笔记本",
  description: "拾人牙慧，毫无创见。",

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
