import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/": [
    // "",
    {
      text: "综述",
      icon: "folder-open",
      prefix: "archives/",
      children: "structure",
    },
    {
      text: "随记",
      icon: "book",
      prefix: "notes/",
      children: "structure",
    },
    // "intro",
    // "friends/"
  ],
});
