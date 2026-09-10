<template>
  <div 
    class="quick-toggle-group"
    :style="warpStyle"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 1레벨 대표 퀵 토글 버튼 -->
    <button 
      type="button" 
      class="quick-toggle-master-btn" 
      :class="{ active: isExpanded || keepOpen }"
      @click.stop="toggleExpand"
      title="퀵 토글 메뉴"
      aria-label="퀵 토글 메뉴"
      :aria-expanded="isExpanded || keepOpen"
    >
      <svg 
        class="master-icon" 
        :class="{ rotated: isExpanded || keepOpen }"
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      >
        <line x1="4" y1="21" x2="4" y2="14"></line>
        <line x1="4" y1="10" x2="4" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12" y2="3"></line>
        <line x1="20" y1="21" x2="20" y2="16"></line>
        <line x1="20" y1="12" x2="20" y2="3"></line>
        <line x1="1" y1="14" x2="7" y2="14"></line>
        <line x1="9" y1="8" x2="15" y2="8"></line>
        <line x1="17" y1="16" x2="23" y2="16"></line>
      </svg>
    </button>

    <!-- 펼쳐지는 하위 토글 버튼 아이템 슬롯 -->
    <div 
      class="quick-toggle-items" 
      :class="{ expanded: isExpanded || keepOpen }"
    >
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onUnmounted } from 'vue'

interface Props {
  keepOpen?: boolean
  warpStyle?: Record<string, any>
}

withDefaults(defineProps<Props>(), {
  keepOpen: false,
  warpStyle: () => ({})
})

const isExpanded = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

const handleMouseEnter = () => {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  isExpanded.value = true
}

const handleMouseLeave = () => {
  if (timer) {
    clearTimeout(timer)
  }
  timer = setTimeout(() => {
    isExpanded.value = false
    timer = null
  }, 250)
}

const toggleExpand = () => {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  isExpanded.value = !isExpanded.value
}

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
})
</script>

<style scoped src="@/assets/styles/quick-toggle.css"></style>
