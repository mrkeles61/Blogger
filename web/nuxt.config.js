export default {
  // Global page headers
  head: {
    title: "Bilfen Blog",
    htmlAttrs: {
      lang: "en",
    },
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: "Bilfen Blog" },
    ],
    link: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap"
      }
    ],
  },

  // Global CSS
  css: ['~/assets/css/main.css'],

  // Plugins - auth.client.ts must run before middleware
  plugins: [
    { src: "~/plugins/auth.client.ts", mode: "client" },
  ],

  // Auto import components
  components: true,

  // Modules
  modules: ["@nuxtjs/tailwindcss"],

  // Build modules
  buildModules: ["@nuxt/typescript-build"],

  // Environment variables
  env: {
    API_BASE: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:4000",
  },

  // Build configuration
  build: {
    extend(config, { isDev, isClient }) {
      if (isDev && isClient) {
        config.devtool = "source-map";
      }
    },
  },
};
