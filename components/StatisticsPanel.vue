<template>
  <div 
    class="modal-overlay" 
    @click.self="$emit('close')"
    @mousemove="handleModalMouseMove"
  >
    <svg style="position: absolute; width: 0; height: 0; pointer-events: none;">
      <defs>
        <filter id="cloth-filter" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency="0.002 0.004" 
            numOctaves="3" 
            stitchTiles="stitch"
            result="noise" 
          />
          <feOffset :dx="offsetX" :dy="offsetY" in="noise" result="movedNoise" />
          <feDisplacementMap 
            in="SourceGraphic" 
            in2="movedNoise" 
            :scale="displacementScale" 
            xChannelSelector="R" 
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
    <div 
      class="modal-content stats-container"
      :style="{ 
        filter: 'url(#cloth-filter)',
        transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`
      }"
      @click="handleModalClick"
      @mouseleave="handleModalMouseLeave"
    >
      <button class="close-btn" @click.stop="$emit('close')">×</button>
      
      <div class="header-section">
        <h1 class="page-title">내가 한거 아니에요 젬미나이가 한거에요 디자인 몰라요;;</h1>
        <p class="page-subtitle">Real-time visualization of page visits and traffic</p>
      </div>
      
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-title-wrap">
            <h2 class="chart-title">Traffic Overview</h2>
            <span class="live-badge"><span class="dot"></span>Live</span>
          </div>
          <div class="total-visits">
            <span class="label">페이지별 누적 통계</span>
            <span class="value">{{ totalVisits.toLocaleString() }}</span>
          </div>
        </div>

        <div class="chart-wrapper">
          <div class="y-axis">
            <span v-for="tick in yAxisTicks" :key="tick">{{ tick.toLocaleString() }}</span>
          </div>
          
          <div class="chart-area">
            <div 
              v-for="(stat, index) in pageStats" 
              :key="index"
              class="bar-group"
            >
              <div class="bar-container">
                <div class="bar-tooltip">{{ stat.visits.toLocaleString() }}</div>
                <div 
                  class="bar" 
                  :style="{ height: `${(stat.visits / maxVisits) * 100}%`, animationDelay: `${index * 0.15}s`, background: `linear-gradient(180deg, ${stat.color} 0%, transparent 100%)` }"
                >
                  <div class="bar-glow" :style="{ background: stat.color }"></div>
                  <div class="bar-top" :style="{ background: stat.color }"></div>
                </div>
              </div>
              <div class="x-axis-label">{{ stat.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { getAPI } from '~/api/get';

const emit = defineEmits(['close']);

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    emit('close');
  }
};

// Cloth animation state
const displacementScale = ref(0);
const offsetX = ref(0);
const offsetY = ref(0);

// 3D Tilt state
const tiltX = ref(0);
const tiltY = ref(0);
let targetTiltX = 0;
let targetTiltY = 0;

let lastMouseX = 0;
let lastMouseY = 0;
let mouseSpeed = 0;
let targetScale = 0;
let currentScale = 0;
let targetSpeed = 0;
let currentSpeed = 0;
let clothFrameId: number;
let time = 0;

const handleModalMouseMove = (e: MouseEvent) => {
  const modalEl = document.querySelector('.modal-content') as HTMLElement;
  if (modalEl) {
    const rect = modalEl.getBoundingClientRect();
    // Calculate mouse position relative to modal center (-1 to 1 range)
    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;
    
    // Convert to maximum 16 degrees tilt
    targetTiltX = -(mouseY / (rect.height / 2)) * 16;
    targetTiltY = (mouseX / (rect.width / 2)) * 16;
  }
};

const handleModalMouseLeave = () => {
  targetTiltX = 0;
  targetTiltY = 0;
};

const handleModalClick = () => {
  // Reset offsets on click to prevent float precision bugs
  offsetX.value = 0;
  offsetY.value = 0;
  
  // Adjusted settings: slightly lowered for a balanced, premium cloth wave
  targetScale = 120;
  targetSpeed = 20;
};

const animateCloth = () => {
  time += 0.04;
  
  // Smooth spring physics for 3D tilt
  tiltX.value += (targetTiltX - tiltX.value) * 0.1;
  tiltY.value += (targetTiltY - tiltY.value) * 0.1;

  // Smooth spring physics for SVG displacement scale and speed
  currentScale += (targetScale - currentScale) * 0.1;
  currentSpeed += (targetSpeed - currentSpeed) * 0.1;

  displacementScale.value = currentScale;
  
  // Keep offsets wrapped to avoid precision loss in browser GPU rendering
  offsetX.value = (offsetX.value + currentSpeed * 2.8) % 1000;
  offsetY.value = (offsetY.value + currentSpeed * 1.8) % 1000;

  // Slowly decelerate back to 0 (balanced, organic cloth decay)
  targetScale += (0 - targetScale) * 0.035;
  targetSpeed += (0 - targetSpeed) * 0.04;

  clothFrameId = requestAnimationFrame(animateCloth);
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
  clothFrameId = requestAnimationFrame(animateCloth);
  fetchPageStats();
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  cancelAnimationFrame(clothFrameId);
});

// 페이지 색상 매핑
const pageColors: Record<string, string> = {
  Main: '#00f2fe',
  Camel: '#4facfe',
  Grafana: '#f093fb',
  Google: '#f5576c',
  Stats: '#5ee7df'
};

const pageStats = ref([
  { name: 'Main', visits: 0, color: '#00f2fe' },
  { name: 'Camel', visits: 0, color: '#4facfe' },
  { name: 'Grafana', visits: 0, color: '#f093fb' },
  { name: 'Google', visits: 0, color: '#f5576c' },
  { name: 'Stats', visits: 0, color: '#5ee7df' }
]);

const fetchPageStats = async () => {
  try {
    const api = getAPI();
    const res = await api.getPageStats();
    if (res && res.success && res.data) {
      const data = res.data;
      pageStats.value = Object.keys(data).map(key => {
        return {
          name: key,
          visits: data[key] || 0,
          color: pageColors[key] || '#ffffff'
        };
      });
    }
  } catch (error) {
    console.error('Failed to fetch page statistics:', error);
  }
};

const totalVisits = computed(() => {
  return pageStats.value.reduce((acc, curr) => acc + curr.visits, 0);
});

const maxVisits = computed(() => {
  return Math.max(...pageStats.value.map(s => s.visits)) * 1.15; // Add 15% padding at top
});

const yAxisTicks = computed(() => {
  const ticks = [];
  const step = Math.ceil(maxVisits.value / 5);
  for (let i = 5; i >= 0; i--) {
    ticks.push(i * step);
  }
  return ticks;
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(8, 10, 20, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeInModal 0.3s ease-out;
  overflow: hidden;
  perspective: 1200px; /* Enable 3D space */
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 1200px;
  background: #0f172a;
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: scaleUpModal 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform-origin: center;
  will-change: filter, transform;
  z-index: 2;
  transform-style: preserve-3d;
  transition: transform 0.1s ease-out;
}

.close-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s;
  z-index: 10;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.stats-container {
  color: #fff;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.header-section {
  margin-bottom: 2.5rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #94a3b8;
  font-weight: 400;
}

.chart-card {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 3rem;
}

.chart-title-wrap {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.chart-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
}

.live-badge {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background: rgba(16, 185, 129, 0.1);
  color: #34d399;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.dot {
  width: 8px;
  height: 8px;
  background-color: #34d399;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.total-visits {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.total-visits .label {
  font-size: 0.875rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.total-visits .value {
  font-size: 2rem;
  font-weight: 800;
  color: #f8fafc;
  line-height: 1.2;
}

.chart-wrapper {
  display: flex;
  height: 380px;
  gap: 1.5rem;
  position: relative;
}

.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  padding-right: 1rem;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  min-width: 60px;
}

.chart-area {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  flex-grow: 1;
  padding-bottom: 1px;
  position: relative;
}

/* Horizontal grid lines */
.chart-area::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 100% 20%;
  pointer-events: none;
  z-index: 0;
}

.bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  width: 15%;
  z-index: 1;
}

.bar-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  position: relative;
  cursor: pointer;
}

.bar {
  width: 45px;
  border-radius: 6px 6px 0 0;
  position: relative;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: bottom;
  animation: scaleUp 1.2s ease-out forwards;
  opacity: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
}

.bar-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  border-radius: 6px 6px 0 0;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.bar-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  border-radius: 6px 6px 0 0;
  filter: blur(12px);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.bar-container:hover .bar {
  transform: scaleY(1.05) scaleX(1.15);
  filter: brightness(1.3);
}

.bar-container:hover .bar-glow {
  opacity: 0.8;
}

.bar-tooltip {
  position: absolute;
  top: -45px;
  background: rgba(255, 255, 255, 0.95);
  color: #0f172a;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 700;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: none;
  white-space: nowrap;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.bar-tooltip::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.95);
}

.bar-container:hover .bar-tooltip {
  opacity: 1;
  transform: translateY(0);
}

.x-axis-label {
  margin-top: 1.25rem;
  font-weight: 600;
  color: #94a3b8;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.bar-group:hover .x-axis-label {
  color: #f8fafc;
  transform: translateY(-2px);
}

@keyframes scaleUp {
  0% {
    transform: scaleY(0);
    opacity: 0;
  }
  100% {
    transform: scaleY(1);
    opacity: 1;
  }
}

@keyframes fadeInModal {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleUpModal {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes pulse {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
  100% { opacity: 1; transform: scale(1); }
}

@media (max-width: 768px) {
  .modal-content {
    padding: 1.5rem;
    width: 95%;
  }
  .chart-wrapper {
    height: 300px;
  }
  .bar {
    width: 30px;
  }
  .page-title {
    font-size: 1.8rem;
  }
  .chart-header {
    flex-direction: column;
    gap: 1.5rem;
  }
  .total-visits {
    align-items: flex-start;
  }
}
</style>
