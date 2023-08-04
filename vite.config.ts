import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { join } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import autoprefixer from 'autoprefixer';
import eslintPlugin from 'vite-plugin-eslint';
import { Plugin as ImportToCDN } from 'vite-plugin-cdn-import';

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    visualizer({
      open: true,
    }),
    // eslintPlugin({
    //   include: ['src/**/*.ts', 'src/**/*.vue', 'src/**/**/*.vue'],
    // }),
    // ImportToCDN({
    //   modules: [
    //     {
    //       name: 'vue',
    //       var: 'Vue',
    //       path: 'https://cdn.jsdelivr.net/npm/vue@3.2.47/dist/vue.global.prod.js',
    //     },
    //     {
    //       name: 'vue-router',
    //       var: 'VueRouter',
    //       path: 'https://unpkg.com/vue-router@4.1.6/dist/vue-router.global.prod.js',
    //     },
    //     {
    //       name: 'vue-demi',
    //       var: 'VueDemi',
    //       path: 'https://cdn.bootcdn.net/ajax/libs/vue-demi/0.13.1/index.iife.js',
    //     },
    //     {
    //       name: 'pinia',
    //       var: 'Pinia',
    //       path: 'https://cdn.bootcdn.net/ajax/libs/pinia/2.0.34/pinia.iife.prod.min.js',
    //     },
    //     {
    //       name: '@smallwei/avue',
    //       var: 'AVUE',
    //       path: 'https://cdn.jsdelivr.net/npm/@smallwei/avue@3.0.17',
    //     },
    //     {
    //       name: 'vue-i18n',
    //       var: 'VueI18n',
    //       path: 'https://cdn.bootcdn.net/ajax/libs/vue-i18n/9.1.10/vue-i18n.global.prod.min.js',
    //     },
    //     {
    //       name: 'element-plus',
    //       var: 'ElementPlus',
    //       path: `https://unpkg.com/element-plus@2.3.3/dist/index.full.js`,
    //       css: 'https://unpkg.com/element-plus/dist/index.css',
    //     },
    //     {
    //       name: 'axios',
    //       var: 'axios',
    //       path: 'https://unpkg.com/axios/dist/axios.min.js',
    //     },
    //   ],
    // }),
  ],
  base: './',
  resolve: {
    alias: {
      '@': join(__dirname, 'src/'),
      '@components': join(__dirname, 'src/components/'),
      '@assets': join(__dirname, 'src/assets/'),
    },
  },
  server: {
    port: 3030,
  },
  build: {
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: 'terser',
    assetsDir: 'static',
    assetsInlineLimit: 1024 * 5,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.indexOf('node_modules') != -1) {
            return id
              .toString()
              .split('node_modules/')[1]
              .split('/')[0]
              .toString();
          }
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/')
            : [];
          const fileName =
            facadeModuleId[facadeModuleId.length - 2] || '[name]';
          return `js/${fileName}/[name].[hash].js`;
        },
      },
    },
  },
  css: {
    devSourcemap: false,
    postcss: {
      plugins: [
        autoprefixer({
          // 自动添加前缀
          overrideBrowserslist: [
            'Android 4.1',
            'iOS 7.1',
            'Chrome > 31',
            'ff > 31',
            'ie >= 8',
            'last 2 versions',
          ],
          grid: true,
        }),
      ],
    },
  },
});
