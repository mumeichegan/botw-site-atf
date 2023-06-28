import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import UnoCSS from 'unocss/vite'

import path from 'path';

import VitePluginInjectPreload from 'vite-plugin-inject-preload'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Components(),
    UnoCSS(),

    VitePluginInjectPreload({
      files: [
        {
          match: /.*pattern.*\.jpg/,
          attributes: {
            
            fetchpriority: 'low',
            as: 'image',
            type: "image/jpeg"
          }
        }
      ]
    })
  ],
  resolve: {
    alias: {
      '@assets': path.resolve(__dirname, './src/assets')
    }
  },

  ssgOptions: {
    // crittersOptions: {
    //   // E.g., change the preload strategy
    //   preload: 'media',
    //   // Other options: https://github.com/GoogleChromeLabs/critters#usage
    // },
  }
})