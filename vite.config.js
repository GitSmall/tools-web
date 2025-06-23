import { defineConfig } from "vite";
import WindiCSS from "vite-plugin-windicss";
import * as path from "path";
import vue from "@vitejs/plugin-vue";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";

export default defineConfig({
  base: "/",
  resolve: {
    //设置别名
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  plugins: [
    vue(),
    WindiCSS(),
    AutoImport({
      imports: ["vue"],
      resolvers: [
        ElementPlusResolver(),
        IconsResolver({
          prefix: "Icon",
        }),
      ],
    }),
    Components({
      resolvers: [
        IconsResolver({
          enabledCollections: ["ep"],
        }),
        ElementPlusResolver(),
      ],
    }),
    Icons({
      autoInstall: true,
    }),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), "src/icons/svg")],
      symbolId: "icon-[dir]-[name]",
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`, // 引入全局 SCSS 变量
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: 10111, //启动端口
    hmr: {
      overlay: false,
    },
    // 设置 https 代理
    proxy: {
      "/tools": {
        target: "http://192.168.0.66:3000",
        // target: "https://api.shopmell.com/erp/dealer",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tools/, ""),
      },
    },
  },
  build: {
    minify: "terser",
    terserOptions: {
      compress: {
        //生产环境时移除console
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        chunkFileNames: "static/js/[name]-[hash].js",
        entryFileNames: "static/js/[name]-[hash].js",
        assetFileNames: "static/[ext]/[name]-[hash].[ext]",
      },
    },
  },
});
