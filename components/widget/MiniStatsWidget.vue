<template>
  <div 
    tabindex="0"
    class="mini-stats-widget draggable-panel" 
    :class="{ dragging: isDragging }"
    @click="handleClick" 
    @mousedown.stop="startDrag"
    :style="widgetStyle"
  >
    <div class="mini-stats-header">
      <div class="mini-stats-info">
        <span class="mini-label">{{ statsData.label }}</span>
        <span class="mini-value">{{ statsData.value }}</span>
        <span class="mini-value">{{ statsData.description }}</span>
      </div>
      <div class="trend-badge">
        <svg v-if="statsData.trendDirection === 'up'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
          <polyline points="17 6 23 6 23 12"></polyline>
        </svg>
        <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
          <polyline points="17 18 23 18 23 12"></polyline>
        </svg>
        {{ formatTrend(statsData.trend) }}
      </div>
    </div>
    
    <div class="sparkline-container">
      <svg viewBox="0 0 200 50" class="sparkline" preserveAspectRatio="none">
        <defs>
          <linearGradient id="sparkline-gradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#34d399" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#34d399" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <path 
          :d="sparklinePaths.fill" 
          fill="url(#sparkline-gradient)"
        />
        <path 
          :d="sparklinePaths.line" 
          fill="none" 
          stroke="#34d399" 
          stroke-width="3" 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          class="sparkline-path"
        />
        <!-- Interactive Dots on the Sparkline -->
        <circle
          v-for="(pt, index) in sparklinePoints"
          :key="index"
          :cx="pt.x"
          :cy="pt.y"
          r="4"
          fill="#34d399"
          stroke="#ffffff"
          stroke-width="1.5"
          class="sparkline-dot"
          :class="{ active: hoveredIndex === index }"
          @mouseenter="hoveredIndex = index"
          @mouseleave="hoveredIndex = null"
        />
      </svg>
    </div>
    
    <div class="days-row">
      <span 
        v-for="(day, index) in statsData.days" 
        :key="index"
        :class="{ today: day === '오늘', active: hoveredIndex === index }"
        :data-tooltip="statsData.sparklineValues && statsData.sparklineValues[index] !== undefined ? `${statsData.sparklineValues[index]}명` : '0명'"
        @mouseenter="hoveredIndex = index"
        @mouseleave="hoveredIndex = null"
      >
        {{ day }}
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getAPI } from '~/api/get'

const emit = defineEmits<{
  (e: 'open-modal'): void
}>()

const { position, startDrag, hasMoved, isDragging } = useDraggable()

const isMobile = ref(false)

const handleResize = () => {
  if (process.client) {
    isMobile.value = window.innerWidth <= 1024
  }
}

const widgetStyle = computed(() => {
  if (isMobile.value) {
    return {}
  }
  return {
    transform: `translate(${position.value.x}px, ${position.value.y}px)`
  }
})

const statsData = ref({
  label: '주간 방문자 (1주)',
  value: '',
  description: '데이터를 불러오는 중...',
  trend: '0%',
  trendDirection: 'up',
  sparklineValues: [40, 30, 10, 20, 45, 25, 10],
  days: ['05', '06', '07', '08', '09', '10', '오늘']
})

const hoveredIndex = ref<number | null>(null)

const formatTrend = (trendStr: string): string => {
  if (!trendStr) return '0%'
  return trendStr.replace(/\.\d+/, '')
}

const sparklinePaths = computed(() => {
  const values = statsData.value.sparklineValues || []
  if (values.length === 0) return { line: '', fill: '' }
  
  const width = 200
  const height = 50
  const maxVal = Math.max(...values, 10)
  const minVal = 0
  const range = maxVal - minVal
  
  const points = values.map((val, index) => {
    const x = (index / (values.length - 1)) * width
    const y = height - (val / range) * (height - 10) - 5
    return { x, y }
  })

  let linePath = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i]
    const p1 = points[i + 1]
    const cpX1 = p0.x + (p1.x - p0.x) / 2
    const cpY1 = p0.y
    const cpX2 = p0.x + (p1.x - p0.x) / 2
    const cpY2 = p1.y
    linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`
  }
  
  const fillPath = `${linePath} L ${width} ${height} L 0 ${height} Z`
  
  return {
    line: linePath,
    fill: fillPath
  }
})

const sparklinePoints = computed(() => {
  const values = statsData.value.sparklineValues || []
  if (values.length === 0) return []
  
  const width = 200
  const height = 50
  const maxVal = Math.max(...values, 10)
  const minVal = 0
  const range = maxVal - minVal
  
  return values.map((val, index) => {
    const x = (index / (values.length - 1)) * width
    const y = height - (val / range) * (height - 10) - 5
    return { x, y, val }
  })
})

const fetchStats = async () => {
  try {
    const api = getAPI()
    const res = await api.getDashboardStats()
    if (res && res.success && res.data) {
      statsData.value = res.data
    }
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error)
  }
}

const handleClick = () => {
  if (!hasMoved.value) {
    emit('open-modal')
  }
}

onMounted(() => {
  handleResize()
  if (process.client) {
    window.addEventListener('resize', handleResize)
  }
  fetchStats()
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('resize', handleResize)
  }
})
</script>

<style scoped src="@/assets/styles/mini-stats.css"></style>
