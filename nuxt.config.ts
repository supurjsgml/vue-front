// https://nuxt.com/docs/api/configuration/nuxt-config
import dotenv from 'dotenv'

// dotenv 파일 로드
dotenv.config();

// ======================================================= //
// 1. 그라파나 (Grafana) 관련 리소스 및 API 통신 전용 프록시 설정
// ======================================================= //
const grafanaProxyRoutes = {
  '/public/build/**': { proxy: `${process.env.GRAFANA_URL}/public/build/**` },
  '/public/img/**': { proxy: `${process.env.GRAFANA_URL}/public/img/**` },
  '/public/fonts/**': { proxy: `${process.env.GRAFANA_URL}/public/fonts/**` },
  '/public/maps/**': { proxy: `${process.env.GRAFANA_URL}/public/maps/**` },
  '/api/public/**': { proxy: `${process.env.GRAFANA_URL}/api/public/**` },
  '/api/live/**': { proxy: `${process.env.GRAFANA_URL}/api/live/**` },
  '/api/frontend/**': { proxy: `${process.env.GRAFANA_URL}/api/frontend/**` },
  '/bootdata/**': { proxy: `${process.env.GRAFANA_URL}/bootdata/**` },
};

// ======================================================= //
// 2. 뤼거리 백엔드 API 서버 전용 프록시 설정
// ======================================================= //
const backendApiProxyRoutes = {
  '/rest/**': { proxy: `${process.env.REDOC_API_URL}/**` },
};

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
      ...grafanaProxyRoutes,
      ...backendApiProxyRoutes,
    }
  },
})