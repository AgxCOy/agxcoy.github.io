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
});
