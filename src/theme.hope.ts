import { hopeTheme } from "vuepress-theme-hope";
import navbar from "./navbar.js";
import sidebar from "./sidebar.js";

export default hopeTheme(
  {
    hostname: "https://agxcoy.shimakaze.org",

    author: {
      name: "SilverAg.L",
      url: "https://github.com/AgxCOy",
    },
    logo: "/assets/images/avatar.webp",

    repo: "AgxCOy/blogs",

    docsDir: "docs",

    // 导航栏
    navbar,
    // 侧边栏
    sidebar,
    // 页脚
    footer: "喵？……嗯哼♡",
    displayFooter: true,

    // 博客相关
    blog: {
      description: "希望你我都能……“玩”得尽兴♡",
      // intro: "/intro.html",
      medias: {
        BiliBili: "https://space.bilibili.com/301413212",
        Email: "mailto:caclx@outlook.com",
        GitHub: "https://github.com/AgxCOy",
        Steam: "https://steamcommunity.com/id/silveraglin/",
      },
    },

    // 加密配置
    // encrypt: {
    //   config: {
    //     "/demo/encrypt.html": ["1234"],
    //   },
    // },

    markdown: {
      align: true,
      alert: true,
      attrs: true,
      codeTabs: true,
      component: true,
      demo: true,
      figure: true,
      footnote: true,
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
      // katex
      math: true,
    },

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

      icon: {
        assets: "fontawesome-with-brands"
      },

      // temporally disabled
      // docsearch: {
      //   apiKey: 'f07a8ff56a04a28b21d779ea8b679092',
      //   appId: 'LT11FBEODD',
      //   indexName: 'nyacl-shimakaze'
      // },

      comment: {
        provider: "Giscus",
        repo: "AgxCOy/blogs",
        repoId: "R_kgDOMJzkvA",
        category: "Announcements",
        categoryId: "DIC_kwDOMJzkvM4CmIsK"
      },

      components: {
        components: ["Badge", "VPCard"],
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
