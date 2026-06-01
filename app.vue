<template>
  <div class="container">
    <canvas ref="rippleCanvas" class="global-ripple-canvas"></canvas>
    <!-- 왼쪽 패널 그룹 -->
    <div class="left-panel-wrapper">
      <!-- 메인 네비게이션 영역 (개별 드래그) -->
      <div 
        class="nav-container draggable-panel"
        :class="{ dragging: navIsDragging }"
        @mousedown="startNavDrag"
        :style="{ transform: `translate(${navPosition.x}px, ${navPosition.y}px)` }"
      >
        <div class="nav-item" @click="toggleMain">
        <NuxtLink class="custom-link" to="/" @click="() => isMainOpen = false" @mousedown.stop>main</NuxtLink>
        <ChevronRightIcon @click="toggleMain" :class="{ rotated: isMainOpen }" class="icon" />
      </div>
      <div class="sub-menu" v-if="isMainOpen">
        <NuxtLink class="custom-link" to="/camel" @mousedown.stop>camel</NuxtLink>
      </div>
      <div class="sub-menu" v-if="isMainOpen">
        <NuxtLink class="custom-link" to="/grafana" @mousedown.stop>구라파나</NuxtLink>
      </div>
        <div class="sub-menu" v-if="isMainOpen">
          <NuxtLink class="custom-link" to="/google" @mousedown.stop>googleDownLink</NuxtLink>
        </div>
      </div> <!-- End of nav-container -->

      <!-- Mini Stats Widget (개별 드래그) -->
      <div 
        class="mini-stats-widget draggable-panel" 
        :class="{ dragging: statsIsDragging }"
        @click="openStatsModalIfNoDrag" 
        @mousedown.stop="startStatsDrag"
        :style="{ transform: `translate(${statsPosition.x}px, ${statsPosition.y}px)` }"
      >
        <div class="mini-stats-header">
          <div class="mini-stats-info">
            <span class="mini-label">주간 방문자 (1주)</span>
            <span class="mini-value">45,500</span>
            <span class="mini-value">하드코딩 이지롱 다음 배포때 바ㄲ</span>
          </div>
          <div class="trend-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            12%
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
              d="M 0 40 C 30 30, 40 10, 66 20 S 100 45, 133 25 S 180 5, 200 10 L 200 50 L 0 50 Z" 
              fill="url(#sparkline-gradient)"
            />
            <path 
              d="M 0 40 C 30 30, 40 10, 66 20 S 100 45, 133 25 S 180 5, 200 10" 
              fill="none" 
              stroke="#34d399" 
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="sparkline-path"
            />
          </svg>
        </div>
        <div class="days-row">
          <span>05</span>
          <span>06</span>
          <span>07</span>
          <span>08</span>
          <span>09</span>
          <span>10</span>
          <span class="today">오늘</span>
        </div>
      </div>
    </div> <!-- End of left-panel-wrapper -->

    <!-- 콘텐츠 영역 -->
    <div class="content">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>

    <!-- 오른쪽 홍보 링크 영역 -->
    <aside class="sidebar">
      <ul>
        <li>
          <a :href="useRuntimeConfig().public.restApi" target="_blank">
            <img src="@/assets/styles/img/logo/swaggerLogo.png" alt="SwaggerLogo" class="sidebar-logo" />
          </a>
        </li>
        <li>
          <a href="https://chromewebstore.google.com/detail/%EC%9E%A1%EC%BD%94%EB%A6%AC%EC%95%84-%EC%9D%B4%EB%A0%A5%EC%84%9C-%EA%B0%B1%EC%8B%A0/chjbcemdkiommdpeklplkbfpemefejcp" target="_blank">
            <img src="@/assets/styles/img/logo/chromeWebStoreLogo.png" alt="chromeWebStoreLogo" class="sidebar-logo" />
          </a>
        </li>
        <li>
          <a :href="useRuntimeConfig().public.grafanaUrl.concat('/public-dashboards/6db3adcb8b00421589797ad121289dd1')" target="_blank">
            <img src="@/assets/styles/img/logo/grafanaLogo.png" alt="grafanaLogo" class="sidebar-logo" />
          </a>
        </li>
      </ul>
    </aside>

    <!-- 테마 토글 버튼 -->
    <button class="theme-toggle-btn" @click="toggleTheme" title="테마 변경">
      <SunIcon v-if="isDarkMode" class="theme-icon" />
      <MoonIcon v-else class="theme-icon" />
    </button>

    <StatisticsPanel v-if="showStatsModal" @close="showStatsModal = false" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useHead } from '#imports'
import { ChevronRightIcon, SunIcon, MoonIcon } from '@heroicons/vue/24/solid'

useHead({
  title: '카멜따리 ~',
  link: [
    {
      rel: 'icon',
      type: 'image/jpg',
      href: '/dog.jpg'
    }
  ],
})

const isMainOpen = ref(true)
const showStatsModal = ref(false)

function toggleMain(event: Event) {
  event.stopPropagation()
  isMainOpen.value = !isMainOpen.value
}

// 커스텀 드래그 훅
function useDraggable() {
  const position = ref({ x: 0, y: 0 })
  const isDragging = ref(false)
  const dragOffset = ref({ x: 0, y: 0 })
  const hasMoved = ref(false)

  function startDrag(event: MouseEvent) {
    if (event.button !== 0) return // 왼쪽 클릭만 허용
    isDragging.value = true
    hasMoved.value = false
    dragOffset.value = {
      x: event.clientX - position.value.x,
      y: event.clientY - position.value.y
    }

    const onDrag = (e: MouseEvent) => {
      if (!isDragging.value) return
      hasMoved.value = true
      // 화면 밖으로 나가지 않도록 여유 있게 제한
      const maxX = window.innerWidth
      const maxY = window.innerHeight
      const minX = -window.innerWidth
      const minY = -window.innerHeight

      position.value.x = Math.min(maxX, Math.max(minX, e.clientX - dragOffset.value.x))
      position.value.y = Math.min(maxY, Math.max(minY, e.clientY - dragOffset.value.y))
    }

    const stopDrag = () => {
      isDragging.value = false
      document.removeEventListener("mousemove", onDrag)
      document.removeEventListener("mouseup", stopDrag)
    }

    document.addEventListener("mousemove", onDrag)
    document.addEventListener("mouseup", stopDrag)
  }

  return { position, startDrag, hasMoved, isDragging }
}

const { position: navPosition, startDrag: startNavDrag, isDragging: navIsDragging } = useDraggable()
const { position: statsPosition, startDrag: startStatsDrag, hasMoved: statsHasMoved, isDragging: statsIsDragging } = useDraggable()

function openStatsModalIfNoDrag() {
  if (!statsHasMoved.value) {
    showStatsModal.value = true
  }
}

// Background canvas state
const rippleCanvas = ref<HTMLCanvasElement | null>(null);
let animationFrameId: number;

const mouse = {
  x: -1000,
  y: -1000,
  targetX: -1000,
  targetY: -1000,
  radius: 240, // Larger mouse influence radius for full screen
};

interface GridPoint {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
}

let points: GridPoint[] = [];
let cols = 0;
let rows = 0;
const spacing = 50; // Grid cell spacing

const initGrid = (width: number, height: number) => {
  points = [];
  cols = Math.ceil(width / spacing) + 1;
  rows = Math.ceil(height / spacing) + 1;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * spacing;
      const y = r * spacing;
      points.push({
        x,
        y,
        originX: x,
        originY: y,
        vx: 0,
        vy: 0,
      });
    }
  }
};

const handleGlobalMouseMove = (e: MouseEvent) => {
  if (!rippleCanvas.value) return;
  const rect = rippleCanvas.value.getBoundingClientRect();
  mouse.targetX = e.clientX - rect.left;
  mouse.targetY = e.clientY - rect.top;
};

const handleGlobalMouseLeave = () => {
  mouse.targetX = -1000;
  mouse.targetY = -1000;
};

const spring = 0.025;
const damping = 0.92;
const waveSpeed = 0.001;
const waveAmp = 5;

const animateBackground = (time: number) => {
  if (!rippleCanvas.value) return;
  const canvas = rippleCanvas.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  mouse.x += (mouse.targetX - mouse.x) * 0.1;
  mouse.y += (mouse.targetY - mouse.y) * 0.1;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];

    // Natural breathing waving motion
    const waveX = Math.sin(time * waveSpeed + p.originY * 0.01) * 1.5;
    const waveY = Math.cos(time * waveSpeed + p.originX * 0.01) * waveAmp;

    const targetX = p.originX + waveX;
    const targetY = p.originY + waveY;

    // Mouse interactive force pushing nodes away
    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < mouse.radius) {
      const force = (mouse.radius - dist) / mouse.radius;
      const angle = Math.atan2(dy, dx);
      const pushX = Math.cos(angle) * force * 16;
      const pushY = Math.sin(angle) * force * 16;
      
      p.vx += pushX;
      p.vy += pushY;
    }

    const ax = (targetX - p.x) * spring;
    const ay = (targetY - p.y) * spring;

    p.vx += ax;
    p.vy += ay;
    p.vx *= damping;
    p.vy *= damping;

    p.x += p.vx;
    p.y += p.vy;
  }

  // Draw delicate grid lines (dark/light adapted)
  ctx.beginPath();
  ctx.strokeStyle = isDarkMode.value ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.04)';
  ctx.lineWidth = 1;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const p = points[idx];

      if (c < cols - 1) {
        const pRight = points[idx + 1];
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(pRight.x, pRight.y);
      }
      if (r < rows - 1) {
        const pBottom = points[idx + cols];
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(pBottom.x, pBottom.y);
      }
    }
  }
  ctx.stroke();

  // Draw subtle glowing dots on intersections close to the mouse
  const dotColor = isDarkMode.value ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
  const glowRGB = isDarkMode.value ? '52, 211, 153' : '5, 150, 105'; // teal-400 vs emerald-600

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < mouse.radius) {
      const ratio = 1 - dist / mouse.radius;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.2 + ratio * 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${glowRGB}, ${0.05 + ratio * 0.35})`;
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 0.8, 0, Math.PI * 2);
      ctx.fillStyle = dotColor;
      ctx.fill();
    }
  }

  animationFrameId = requestAnimationFrame(animateBackground);
};

const handleResize = () => {
  if (!rippleCanvas.value) return;
  const canvas = rippleCanvas.value;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initGrid(canvas.width, canvas.height);
};

// 테마 상태 및 토글 기능
const isDarkMode = ref(true)

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  const theme = isDarkMode.value ? 'dark' : 'light'
  document.documentElement.setAttribute('data-bs-theme', theme)
  localStorage.setItem('theme', theme)
}

onMounted(() => {
  // 테마 초기 설정
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark'
  } else {
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  document.documentElement.setAttribute('data-bs-theme', isDarkMode.value ? 'dark' : 'light')

  // 캔버스 초기 설정
  if (rippleCanvas.value) {
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseleave', handleGlobalMouseLeave);
    animationFrameId = requestAnimationFrame(animateBackground);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('mousemove', handleGlobalMouseMove);
  window.removeEventListener('mouseleave', handleGlobalMouseLeave);
  cancelAnimationFrame(animationFrameId);
});
</script>

<style scoped>
@import url('@/assets/styles/mini-stats.css');

.global-ripple-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: -1;
}

.container {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  max-width: 1800px;
  margin: 0 auto;
  padding: 20px;
}

.left-panel-wrapper {
    position: relative;
    z-index: 10;
    width: 220px;
    margin-top: 11rem;
}

.nav-container {
    position: absolute;
    top: 0;
    width: 100%;
    box-sizing: border-box;
    background-color: var(--nav-bg);
    padding: 10px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--nav-border);
}

.nav-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    background-color: var(--nav-bg);
    border-radius: 8px;
    margin-bottom: 10px;
}

.icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
  cursor: pointer;
  color: var(--nav-text);
}

.rotated {
  transform: rotate(90deg);
}

.sub-menu {
  padding-left: 20px;
  margin-top: 5px;
  display: flex;
  flex-direction: column;
}

.custom-link {
    user-select: none; /* 텍스트 드래그 방지 */
    text-decoration: none;
    color: var(--nav-text);
    padding: 10px 15px;
    background-color: var(--nav-bg);
    border-radius: 8px;
    transition: background-color 0.3s ease, color 0.3s ease;
    display: block;
    box-sizing: border-box;
    text-align: center;
    font-weight: bold;
    border: 1px solid var(--nav-border);
    word-break: break-all;
}

.custom-link:hover {
    background-color: var(--nav-hover-bg);
    color: var(--nav-text);
}

.custom-link.router-link-active {
    background-color: var(--nav-active-bg);
    color: var(--nav-active-text);
    border: none;
}

.sub-menu .custom-link:hover {
  background-color: #2c3e50; /* 서브 메뉴 hover 시 배경색 */
}

.content {
  flex: 1;
  margin-left: 20px;
  max-width: calc(90% - 200px);
}

/* 반응형 스타일 */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
    align-items: stretch;
  }

  .left-panel-wrapper {
    width: 93%;
    margin-top: 0;
  }

  .nav-item {
    justify-content: space-between;
    padding: 15px;
  }

  .sub-menu {
    padding-left: 0;
    margin-top: 10px;
  }

  .content {
    margin-right: 1%;
    max-width: 90%;
  }
}

.sidebar {
  width: 280px; /* 오른쪽 사이드바 너비 */
  padding: 20px;
  border-radius: 10px;
  color: #fff;
  position: sticky;
  top: 20px; /* 스크롤 시 상단 고정 */
  align-self: flex-start; /* 콘텐츠 높이에 맞추기 */
  user-select: none; /* 텍스트 선택 방지 */
  -webkit-user-select: none;
}

.sidebar-logo {
  -webkit-user-drag: none; /* 이미지 고스트 드래그 방지 */
  user-select: none;
  -webkit-user-select: none;
}

.sidebar h3 {
  font-size: 1.2rem;
  margin-bottom: 10px;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li {
  margin-bottom: 8px;
}

.sidebar a {
  color: #58a6ff;
  text-decoration: none;
}

.sidebar a:hover {
  text-decoration: underline;
}

/* 테마 토글 버튼 스타일 */
.theme-toggle-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: var(--nav-bg);
  border: 1px solid var(--nav-border);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  outline: none;
}

.theme-toggle-btn:hover {
  transform: scale(1.1) rotate(15deg);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  border-color: #34d399;
}

.theme-icon {
  width: 22px;
  height: 22px;
  color: var(--nav-text);
  transition: transform 0.5s ease;
}

/* 다크/라이트 모드용 CSS 변수 정의 */
:root, [data-bs-theme="dark"] {
  --nav-bg: rgba(15, 23, 42, 0.65); /* 반투명 다크 블루 */
  --nav-border: rgba(255, 255, 255, 0.08);
  --nav-text: #f8fafc;
  --nav-hover-bg: rgba(255, 255, 255, 0.08);
  --nav-active-bg: rgba(52, 211, 153, 0.15);
  --nav-active-text: #34d399;
}

[data-bs-theme="light"] {
  --nav-bg: rgba(248, 250, 252, 0.8); /* 반투명 라이트 그레이 */
  --nav-border: rgba(15, 23, 42, 0.08);
  --nav-text: #0f172a;
  --nav-hover-bg: rgba(0, 0, 0, 0.05);
  --nav-active-bg: rgba(52, 211, 153, 0.15);
  --nav-active-text: #059669;
}

/* 사이드바 글자색 동기화 */
.sidebar {
  color: var(--nav-text) !important;
}
</style>