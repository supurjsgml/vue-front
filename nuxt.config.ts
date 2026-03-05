// https://nuxt.com/docs/api/configuration/nuxt-config
import dotenv from 'dotenv'

// dotenv 파일 로드
dotenv.config();

export default defineNuxtConfig({
  devtools: { 
    enabled: true,
  },

  css: [
    "@/assets/styles/ui.css",
    "@/assets/styles/docs.css",
  ],

  modules: ["@pinia/nuxt", "@nuxt/image"],
  runtimeConfig: {
    public: {
      restApi: process.env.REDOC_API_URL,
      grafanaUrl: process.env.GRAFANA_URL,
    },
  },
  
  serverMiddleware: ['~/server/middleware/redirect'],

  nitro: {  
  routeRules: {  
    '/public/build/**': { proxy: 'https://supurjsgml.grafana.net/public/build/**' },  
    '/public/img/**': { proxy: 'https://supurjsgml.grafana.net/public/img/**' },  
    '/public/fonts/**': { proxy: 'https://supurjsgml.grafana.net/public/fonts/**' },  
    '/public/maps/**': { proxy: 'https://supurjsgml.grafana.net/public/maps/**' },  
    '/api/public/**': { proxy: 'https://supurjsgml.grafana.net/api/public/**' },  
    '/api/live/**': { proxy: 'https://supurjsgml.grafana.net/api/live/**' },  
    '/api/frontend/**': { proxy: 'https://supurjsgml.grafana.net/api/frontend/**' },  
  }  
}  ,
})