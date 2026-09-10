<template>
  <div 
    tabindex="0"
    class="nav-container draggable-panel"
    :class="{ dragging: isDragging, 'is-open': isOpen }"
    :style="warpStyle"
    @mousedown.stop="handleContainerMouseDown"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 1레벨 토글 버튼 헤더 -->
    <div 
      class="nav-toggle-btn"
      :class="{ active: isOpen }"
      @click.stop="toggleMenu"
      @mousedown.stop
      role="button"
      tabindex="0"
      aria-label="메뉴 토글 버튼"
      :aria-expanded="isOpen"
    >
      <div class="toggle-btn-left">
        <span class="menu-icon-indicator" :class="{ open: isOpen }">
          <span class="icon-line line-top"></span>
          <span class="icon-line line-mid"></span>
          <span class="icon-line line-bot"></span>
        </span>
        <span class="toggle-btn-title">MENU</span>
      </div>

      <svg 
        class="chevron-indicator" 
        :class="{ rotated: isOpen }" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2.2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </div>

    <!-- 하위 서브메뉴 리스트 (마우스 오버 / 토글 시 슬라이드 전개) -->
    <div 
      class="sub-menu-wrapper"
      :class="{ expanded: isOpen }"
    >
      <div class="sub-menu-content">
        <NuxtLink 
          v-for="item in navList" 
          :key="item.path"
          :to="item.path" 
          class="custom-link"
          :class="{ 'current-path': route.path === item.path }"
          @mousedown.stop
          @click="handleLinkClick"
        >
          <span class="link-bullet"></span>
          <span class="link-text">{{ item.label }}</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onUnmounted } from 'vue'
import { useRoute } from '#imports'

interface Props {
  isDragging?: boolean
  warpStyle?: Record<string, any>
}

withDefaults(defineProps<Props>(), {
  isDragging: false,
  warpStyle: () => ({})
})

const emit = defineEmits<{
  (e: 'start-drag', event: MouseEvent): void
}>()

const route = useRoute()

const navList = [
  { label: 'main', path: '/' },
  { label: 'camel', path: '/camel' },
  { label: '번역쓰', path: '/translate' },
  { label: 'Diff', path: '/diff' },
  { label: 'Jasypt', path: '/jasypt' }
]

const isOpen = ref(false)
let closeTimer: ReturnType<typeof setTimeout> | null = null

const handleMouseEnter = () => {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
  isOpen.value = true
}

const handleMouseLeave = () => {
  if (closeTimer) {
    clearTimeout(closeTimer)
  }
  closeTimer = setTimeout(() => {
    isOpen.value = false
    closeTimer = null
  }, 220)
}

const toggleMenu = () => {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
  isOpen.value = !isOpen.value
}

const handleLinkClick = () => {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
}

const handleContainerMouseDown = (event: MouseEvent) => {
  emit('start-drag', event)
}

onUnmounted(() => {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
})
</script>

<style scoped src="@/assets/styles/navigation.css"></style>
