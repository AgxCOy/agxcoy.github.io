import { hopeTheme } from "vuepress-theme-hope";
import navbar from "./navbar.js";
import sidebar from "./sidebar.js";

export default hopeTheme(
  {
    hostname: "https://nyacl.shimakaze.org",

    author: {
      name: "NyaCl",
      url: "https://github.com/NyaCl",
    },
    iconAssets: "fontawesome-with-brands",
    logo: "/assets/images/avatar.webp",

    repo: "NyaCl/nyacl.github.io",

    docsDir: "docs",

    // 导航栏
    navbar,
    // 侧边栏
    sidebar,
    // 页脚
    footer: "氯离子实验室 出品",
    displayFooter: true,

    // 博客相关
    blog: {
      description: "主包不知道在写些什么。",
      // intro: "/intro.html",
      medias: {
        // Baidu: "https://example.com",
        BiliBili: "https://space.bilibili.com/301413212",
        // Bitbucket: "https://example.com",
        // Dingding: "https://example.com",
        // Discord: "https://example.com", // only href allowed
        // Dribbble: "https://example.com",
        Email: "mailto:caclx@outlook.com",
        // Evernote: "https://example.com",
        // Facebook: "https://example.com",
        // Flipboard: "https://example.com",
        // Gitee: "https://example.com",
        GitHub: "https://github.com/ChlorideP",
        // Gitlab: "https://gitlab.com/ChlorideP", // obsolete due to GitLab policy.
        // Gmail: "mailto:info@example.com", // keep private
        // Instagram: "https://example.com",
        // Lark: "https://example.com",
        // Lines: "https://example.com",
        // Linkedin: "https://example.com",
        // Pinterest: "https://example.com",
        // Pocket: "https://example.com",
        // QQ: "https://example.com",  // manual inhibit qq number
        // Qzone: "https://example.com",
        // Reddit: "https://example.com",
        // Rss: "https://example.com",
        Steam: "https://steamcommunity.com/id/kariko_lin/",
        // Twitter: "https://example.com",  // keep private
        // Wechat: "https://example.com",
        // Weibo: "https://example.com",
        // Whatsapp: "https://example.com",
        // Youtube: "https://example.com",
        // Zhihu: "https://example.com",
        // VuePressThemeHope: {
        //   icon: "https://theme-hope-assets.vuejs.press/logo.svg",
        //   link: "https://theme-hope.vuejs.press",
        // },
      },
    },

    // 加密配置
    // encrypt: {
    //   config: {
    //     "/demo/encrypt.html": ["1234"],
    //   },
    // },

    // 多语言配置
    metaLocales: {
      editLink: "在 GitHub 上编辑此页",
    },

    // 如果想要实时查看任何改变，启用它。注: 这对更新性能有很大负面影响
    // hotReload: true,

    // 在这里配置主题提供的插件
    plugins: {
      blog: {
        excerptLength: 0,
      },

      docsearch: {
        apiKey: 'f07a8ff56a04a28b21d779ea8b679092',
        appId: 'LT11FBEODD',
        indexName: 'nyacl-shimakaze'
      },

      // 启用之前需安装 @waline/client
      // 警告: 这是一个仅供演示的测试服务，在生产环境中请自行部署并使用自己的服务！
      // comment: {
      //   provider: "Waline",
      //   serverURL: "https://waline-comment.vuejs.press",
      // },

      components: {
        components: ["Badge", "VPCard"],
      },

      // 此处开启了很多功能用于演示，你应仅保留用到的功能。
      mdEnhance: {
        align: true,
        alert: true,
        attrs: true,
        codetabs: true,
        component: true,
        demo: true,
        figure: true,
        imgLazyload: true,
        imgSize: true,
        include: true,
        mark: true,
        plantuml: true,
        spoiler: true,
        stylize: [
          {
            matcher: "Recommended",
            replacer: ({ tag }) => {
              if (tag === "em")
                return {
                  tag: "Badge",
                  attrs: { type: "tip" },
                  content: "Recommended",
                };
            },
          },
        ],
        sub: true,
        sup: true,
        tabs: true,
        tasklist: true,
        vPre: true,

        // 在启用之前安装 chart.js
        // chart: true,

        // insert component easily

        // 在启用之前安装 echarts
        // echarts: true,

        // 在启用之前安装 flowchart.ts
        // flowchart: true,

        // gfm requires mathjax-full to provide tex support
        // gfm: true,

        // 在启用之前安装 katex
        katex: true,

        // 在启用之前安装 mathjax-full
        // mathjax: true,

        // 在启用之前安装 mermaid
        // mermaid: true,

        // playground: {
        //   presets: ["ts", "vue"],
        // },

        // 在启用之前安装 reveal.js
        // revealJs: {
        //   plugins: ["highlight", "math", "search", "notes", "zoom"],
        // },

        // 在启用之前安装 @vue/repl
        // vuePlayground: true,

        // install sandpack-vue3 before enabling it
        // sandpack: true,
      },

      // 如果你需要 PWA。安装 @vuepress/plugin-pwa 并取消下方注释
      pwa: {
        favicon: "/favicon.ico",
        cacheHTML: false,
        cacheImage: false,
        appendBase: true,
        apple: {
          icon: "/assets/icon/apple-icon-152.png",
          statusBarColor: "black",
        },
        msTile: {
          image: "/assets/icon/ms-icon-144.png",
          color: "#ffffff",
        },
        manifest: {
          icons: [
            {
              src: "/assets/icon/chrome-mask-512.png",
              sizes: "512x512",
              purpose: "maskable",
              type: "image/png",
            },
            {
              src: "/assets/icon/chrome-mask-192.png",
              sizes: "192x192",
              purpose: "maskable",
              type: "image/png",
            },
            {
              src: "/assets/icon/chrome-512.png",
              sizes: "512x512",
              type: "image/png",
            },
            {
              src: "/assets/icon/chrome-192.png",
              sizes: "192x192",
              type: "image/png",
            },
          ],
          // shortcuts: [
          //   {
          //     name: "Demo",
          //     short_name: "Demo",
          //     url: "/demo/",
          //     icons: [
          //       {
          //         src: "/assets/icon/guide-maskable.png",
          //         sizes: "192x192",
          //         purpose: "maskable",
          //         type: "image/png",
          //       },
          //     ],
          //   },
          // ],
        },
      },
    },
  },
  {
  "custom": true
  }
);
