<template>
  <aside class="sidebar">
    <ul>
      <li>
        <a :href="useRuntimeConfig().public.restApi" target="_blank" @click="openSwagger" @mousedown.stop>
          <img src="@/assets/styles/img/logo/swaggerLogo.png" alt="SwaggerLogo" class="sidebar-logo" />
        </a>
      </li>
      
      <!-- 그라파나 대시보드 세션 -->
      <li class="extension-section grafana-section">
        <div class="extension-section-header clickable-header" @click="toggleGrafanaSection" @mousedown.stop>
          <div class="extension-header-left">
            <img src="@/assets/styles/img/logo/grafanaLogo.png" alt="Grafana" class="extension-header-logo" />
            <span class="extension-header-title">구라파나 Dashboards</span>
          </div>
          <ChevronRightIcon :class="{ rotated: isGrafanaSectionOpen }" class="icon section-toggle-icon" />
        </div>
        <div class="extension-links" v-if="isGrafanaSectionOpen">
          <NuxtLink 
            to="/grafana?type=batch" 
            class="extension-card extension-card-batch"
            @mousedown.stop
          >
            <div class="extension-info">
              <span class="extension-name">Batch</span>
            </div>
            <button 
              type="button"
              class="external-tab-btn"
              title="새 창으로 열기"
              @click.stop.prevent="openExternalGrafana('batch')"
              @mousedown.stop
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </button>
          </NuxtLink>
          <NuxtLink 
            to="/grafana?type=api" 
            class="extension-card extension-card-api"
            @mousedown.stop
          >
            <div class="extension-info">
              <span class="extension-name">API</span>
            </div>
            <button 
              type="button"
              class="external-tab-btn"
              title="새 창으로 열기"
              @click.stop.prevent="openExternalGrafana('api')"
              @mousedown.stop
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </button>
          </NuxtLink>
        </div>
      </li>

      <!-- 크롬 확장프로그램 세션 -->
      <li class="extension-section">
        <div class="extension-section-header clickable-header" @click="toggleChromeExtensionsSection" @mousedown.stop>
          <div class="extension-header-left">
            <img src="@/assets/styles/img/logo/chromeWebStoreLogo.png" alt="Chrome Web Store" class="extension-header-logo" />
            <span class="extension-header-title">Chrome Extensions</span>
          </div>
          <ChevronRightIcon :class="{ rotated: isChromeExtensionsSectionOpen }" class="icon section-toggle-icon" />
        </div>
        <div class="extension-links" v-if="isChromeExtensionsSectionOpen">
          <a 
            href="https://chromewebstore.google.com/detail/%EC%9E%A1%EC%BD%94%EB%A6%AC%EC%95%84-%EC%9D%B4%EB%A0%A5%EC%84%9C-%EA%B0%B1%EC%8B%A0/chjbcemdkiommdpeklplkbfpemefejcp" 
            target="_blank" 
            class="extension-card"
          >
            <div class="extension-info">
              <span class="extension-name">잡코리아 이력서 갱신</span>
              <span class="extension-desc">이력서 자동 갱신 툴</span>
            </div>
            <span class="extension-tag">확장앱</span>
          </a>
          <a 
            href="https://chromewebstore.google.com/detail/gemini-ai-web-agent/cigmfccgmaeohgblgnpfcheefkpockeo?authuser=0&hl=ko" 
            target="_blank" 
            class="extension-card extension-card-new"
          >
            <div class="extension-info">
              <span class="extension-name">Gemini AI Web Agent</span>
              <span class="extension-desc">AI 웹 자동화 에이전트</span>
            </div>
            <span class="extension-tag tag-new">NEW</span>
          </a>
        </div>
      </li>
    </ul>
  </aside>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ChevronRightIcon } from '@heroicons/vue/24/solid'
import { useRuntimeConfig } from '#imports'

const isGrafanaSectionOpen = ref(false)
const isChromeExtensionsSectionOpen = ref(false)

const toggleGrafanaSection = () => {
  isGrafanaSectionOpen.value = !isGrafanaSectionOpen.value
}

const toggleChromeExtensionsSection = () => {
  isChromeExtensionsSectionOpen.value = !isChromeExtensionsSectionOpen.value
}

const openExternalGrafana = (type: string) => {
  const config = useRuntimeConfig()
  const url = type === 'api' ? config.public.grafanaApiUrl : config.public.grafanaBatchUrl
  if (url && process.client) {
    window.open(url, '_blank')
  }
}

const openSwagger = async (event: MouseEvent) => {
  event.preventDefault()
  if (!process.client) return

  const config = useRuntimeConfig()
  const primaryUrl = config.public.restApi
  const fallbackUrl = config.public.fallbackRestApi

  if (!primaryUrl) {
    if (fallbackUrl) window.open(fallbackUrl, '_blank')
    return
  }

  const newTab = window.open('about:blank', '_blank')

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000)

    const response = await fetch(primaryUrl, {
      method: 'GET',
      signal: controller.signal
    })
    clearTimeout(timeoutId)

    if (response && response.status === 500) {
      if (newTab) newTab.location.href = primaryUrl
    } else if (response && response.status >= 400 && response.status !== 500) {
      if (newTab) newTab.location.href = fallbackUrl || primaryUrl
    } else {
      if (newTab) newTab.location.href = primaryUrl
    }
  } catch {
    if (newTab) {
      newTab.location.href = fallbackUrl || primaryUrl
    }
  }
}
</script>

<style scoped src="@/assets/styles/promo-sidebar.css"></style>
