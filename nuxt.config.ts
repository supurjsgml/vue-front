// https://nuxt.com/docs/api/configuration/nuxt-config
import dotenv from 'dotenv'

// dotenv 파일 로드
dotenv.config();

export default defineNuxtConfig({
  devtools: { 
    enabled: true,
  },
  css: [
    "@/assets/styles/ui.css"
  ],
})
