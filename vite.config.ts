import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { join } from 'path';
import eslintPlugin from 'vite-plugin-eslint';
import { visualizer } from 'rollup-plugin-visualizer';
import { Plugin as ImportToCDN } from 'vite-plugin-cdn-import';

export default defineConfig({
  plugins: [
    vue(),
    // eslintPlugin({
    //   include: ['src/**/*.ts', 'src/**/*.vue', 'src/**/**/*.vue'],
    // }),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    visualizer({
      open: true,
    }),
    ImportToCDN({
      modules: [
        {
          name: 'vue',
          var: 'vue',
          path: 'https://cdn.bootcdn.net/ajax/libs/vue/3.2.47/vue.esm-browser.prod.min.js',
        },
        {
          name: 'vue-router',
          var: 'vue-router',
          path: 'https://cdn.bootcdn.net/ajax/libs/vue-router/4.1.6/vue-router.esm-browser.min.js',
        },
        // {
        //   name: 'pinia',
        //   var: 'pinia',
        //   path: 'https://cdn.bootcdn.net/ajax/libs/pinia/2.0.34/pinia.iife.prod.min.js',
        // },
        {
          name: 'element-plus',
          var: 'ElementPlus',
          path: 'https://cdn.bootcdn.net/ajax/libs/element-plus/2.3.3/index.full.min.js',
          css: 'https://cdn.bootcdn.net/ajax/libs/element-plus/2.3.3/index.min.css',
        },
        {
          name: 'axios',
          var: 'axios',
          path: 'https://cdn.bootcdn.net/ajax/libs/axios/1.3.5/axios.min.js',
        },
      ],
    }),
  ],
  base: './',
  resolve: {
    alias: {
      '@': join(__dirname, 'src'),
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
});
