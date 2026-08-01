<template>
  <div class="grafana-container">
    <!-- 로딩 스피너 및 정보 안내 -->
    <div v-if="isLoading" class="grafana-loading-overlay">
      <div class="spinner"></div>
      <p class="loading-title">그라파나 {{ activeType === 'api' ? 'API' : 'Batch' }} 대시보드 연결 중...</p>
      <p class="loading-sub">최초 접속 시 로그인 세션 생성으로 약 20~30초 소요될 수 있습니다.</p>
    </div>

    <!-- 대시보드 탭 및 새로고침 제어 바 -->
    <div class="grafana-controls">
      <div class="dashboard-tabs">
        <button 
          class="tab-btn" 
          :class="{ active: activeType === 'batch' }"
          @click.stop="switchType('batch')"
          @mousedown.stop
        >
          <span class="tab-badge tag-batch">BATCH</span>
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeType === 'api' }"
          @click.stop="switchType('api')"
          @mousedown.stop
        >
          <span class="tab-badge tag-api">API</span>
        </button>
      </div>
      <button class="reload-btn" @click.stop="reloadIframe" @mousedown.stop title="대시보드 새로고침">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
      </button>
    </div>

    <!-- 아이프레임 -->
    <iframe
      v-if="iframeSrc"
      :key="iframeKey"
      :src="iframeSrc"
      width="100%"
      height="1500"
      frameborder="0"
      @load="onIframeLoad"
      class="grafana-iframe"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAPI } from '~/api/get'

const route = useRoute()
const router = useRouter()

const activeType = ref<string>('batch')
const iframeSrc = ref<string | null>(null)
const iframeKey = ref(0)
const isLoading = ref(true)
let timeoutTimer: ReturnType<typeof setTimeout> | null = null
let autoRetryCount = 0

const loadSrc = async (type: string) => {
  try {
    isLoading.value = true
    const src = await getAPI().getGrafanaIframeSrc(type)
    iframeSrc.value = src
  } catch (error) {
    console.error('Failed to get Grafana src:', error)
  }
}

const switchType = async (type: string) => {
  activeType.value = type
  autoRetryCount = 0
  await loadSrc(type)
  iframeKey.value += 1
  startTimeoutCheck()
  router.push({ path: '/grafana', query: { type } })
}

const onIframeLoad = () => {
  isLoading.value = false
  if (timeoutTimer) clearTimeout(timeoutTimer)
}

const reloadIframe = () => {
  isLoading.value = true
  iframeKey.value += 1
  startTimeoutCheck()
}

const startTimeoutCheck = () => {
  if (timeoutTimer) clearTimeout(timeoutTimer)
  timeoutTimer = setTimeout(() => {
    if (isLoading.value && autoRetryCount < 2) {
      autoRetryCount += 1
      reloadIframe()
    }
  }, 25000)
}

watch(() => route.query.type, async (newType) => {
  const targetType = (newType as string) || 'batch'
  if (activeType.value !== targetType) {
    activeType.value = targetType
    autoRetryCount = 0
    await loadSrc(targetType)
    iframeKey.value += 1
    startTimeoutCheck()
  }
})

onMounted(async () => {
  const initialType = (route.query.type as string) || 'batch'
  activeType.value = initialType
  startTimeoutCheck()
  await loadSrc(initialType)
})

onUnmounted(() => {
  if (timeoutTimer) clearTimeout(timeoutTimer)
})
</script>

<style scoped>
.grafana-container {
  position: relative;
  width: 100%;
  min-height: 800px;
  pointer-events: auto;
}

.grafana-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 400px;
  background: var(--nav-bg, rgba(20, 24, 33, 0.8));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 16px;
  border: 1px solid var(--nav-border, rgba(255, 255, 255, 0.1));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  gap: 12px;
  color: var(--nav-text, #ffffff);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(52, 211, 153, 0.2);
  border-top-color: #34d399;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #34d399;
  margin: 0;
}

.loading-sub {
  font-size: 0.85rem;
  opacity: 0.7;
  margin: 0;
}

.grafana-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  position: relative;
  z-index: 20;
  pointer-events: auto;
}

.dashboard-tabs {
  display: flex;
  gap: 8px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--nav-text, #ffffff);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--nav-border, rgba(255, 255, 255, 0.1));
  border-radius: 8px;
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.tab-btn.active {
  background: rgba(52, 211, 153, 0.15);
  border-color: #34d399;
  color: #34d399;
}

.tab-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.tag-batch {
  background: linear-gradient(135deg, #f97316 0%, #d97706 100%);
  color: #ffffff;
}

.tag-api {
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
  color: #ffffff;
}

.reload-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--nav-text, #ffffff);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--nav-border, rgba(255, 255, 255, 0.1));
  border-radius: 8px;
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.2s ease;
}

.reload-btn:hover {
  background: rgba(52, 211, 153, 0.15);
  border-color: #34d399;
  color: #34d399;
}

.grafana-iframe {
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}
</style>