import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://abhiamishra.github.io/aamblog/",
    title: "My Blog",
    description: "Technical writing, MVP showcases, and research notes.",
    author: "Abhi Mishra",
    profile: "https://github.com/abhiamishra",
    ogImage: "astropaper-og.jpg",
    lang: "en",
    timezone: "America/New_York",
    dir: "ltr",
  },
  posts: {
    perPage: 4,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: false,
    },
    search: "pagefind",
  },
  socials: [
    { name: "github",   url: "https://github.com/abhiamishra" },
    { name: "x",        url: "https://x.com/username" },
    { name: "linkedin", url: "https://www.linkedin.com/in/username/" },
    { name: "mail",     url: "mailto:abhiamishra0@gmail.com" },
  ],
  shareLinks: [
    { name: "whatsapp", url: "https://wa.me/?text=" },
    { name: "facebook", url: "https://www.facebook.com/sharer.php?u=" },
    { name: "x",        url: "https://x.com/intent/post?url=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "pinterest", url: "https://pinterest.com/pin/create/button/?url=" },
    { name: "mail",     url: "mailto:?subject=See%20this%20post&body=" },
  ],
});