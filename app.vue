<template>
  <div class="container">
    <canvas ref="rippleCanvas" class="global-ripple-canvas"></canvas>
    <!-- 왼쪽 패널 그룹 -->
    <div class="left-panel-wrapper">
      <!-- 메인 네비게이션 영역 (개별 드래그) -->
      <div 
        class="nav-container draggable-panel"
        :class="{ dragging: navIsDragging }"
        @mousedown.stop="startNavDrag"
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
            <span class="mini-label">{{ statsData.label }}</span>
            <span class="mini-value">{{ statsData.value }}</span>
            <span class="mini-value">{{ statsData.description }}</span>
          </div>
          <div class="trend-badge">
            <svg v-if="statsData.trendDirection === 'up'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
            {{ statsData.trend }}
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
          </svg>
        </div>
        <div class="days-row">
          <span 
            v-for="(day, index) in statsData.days" 
            :key="index"
            :class="{ today: day === '오늘' }"
          >
            {{ day }}
          </span>
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useHead, useRoute } from '#imports'
import { ChevronRightIcon, SunIcon, MoonIcon } from '@heroicons/vue/24/solid'
import { getAPI } from '~/api/get'

useHead({
  title: '카멜따리 ~',
  link: [
    {
      rel: 'icon',
      type: 'image/jpg',
      href: '/dog.jpg'
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap'
    }
  ],
})

const isMainOpen = ref(true)
const showStatsModal = ref(false)

const statsData = ref({
  label: '주간 방문자 (1주)',
  value: '',
  description: '데이터를 불러오는 중...',
  trend: '0%',
  trendDirection: 'up',
  sparklineValues: [40, 30, 10, 20, 45, 25, 10],
  days: ['05', '06', '07', '08', '09', '10', '오늘']
})

const sparklinePaths = computed(() => {
  const values = statsData.value.sparklineValues || [];
  if (values.length === 0) return { line: '', fill: '' };
  
  const width = 200;
  const height = 50;
  const maxVal = Math.max(...values, 10);
  const minVal = 0;
  const range = maxVal - minVal;
  
  const points = values.map((val, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = height - (val / range) * (height - 10) - 5;
    return { x, y };
  });

  let linePath = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cpX1 = p0.x + (p1.x - p0.x) / 2;
    const cpY1 = p0.y;
    const cpX2 = p0.x + (p1.x - p0.x) / 2;
    const cpY2 = p1.y;
    linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
  }
  
  const fillPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;
  
  return {
    line: linePath,
    fill: fillPath
  };
})

const fetchStats = async () => {
  try {
    const api = getAPI();
    const res = await api.getDashboardStats();
    if (res && res.success && res.data) {
      statsData.value = res.data;
    }
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
  }
}

const route = useRoute()

const getPageNameByPath = (path: string): string => {
  if (path === '/') return 'Main';
  if (path.startsWith('/camel')) return 'Camel';
  if (path.startsWith('/grafana')) return 'Grafana';
  if (path.startsWith('/google')) return 'Google';
  return 'Main';
}

const recordHit = async (forcePageName?: string) => {
  const pageName = forcePageName || getPageNameByPath(route.path);
  const todayStr = new Date().toISOString().slice(0, 10);
  
  // 1. 일자별 전체 방문자 체크 (하루 단위 세션 키)
  const dailySessionKey = `visited_daily_${todayStr}`;
  const isNewSession = !sessionStorage.getItem(dailySessionKey);
  
  // 2. 페이지별 방문 체크 (세션 내 해당 페이지 방문 여부)
  const pageSessionKey = `visited_page_${pageName}`;
  const isNewPageVisit = !sessionStorage.getItem(pageSessionKey);
  
  // 신규 전체 세션 방문도 아니고, 새로운 페이지 방문도 아니면 API 호출하지 않음
  if (!isNewSession && !isNewPageVisit) {
    return;
  }
  
  try {
    const api = getAPI();
    // 새로운 페이지 방문일 때만 pageName을 전송, 전체 신규 세션일 때만 isNewSession을 true로 전송
    await api.incrementVisitor(isNewPageVisit ? pageName : '', isNewSession);
    
    if (isNewSession) {
      sessionStorage.setItem(dailySessionKey, 'true');
    }
    if (isNewPageVisit) {
      sessionStorage.setItem(pageSessionKey, 'true');
    }
  } catch (error) {
    console.error('Failed to record visitor hit:', error);
  }
}

// SPA 라우트 이동 감지하여 페이지뷰 기록
watch(() => route.path, () => {
  recordHit();
})

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

onMounted(async () => {
  await recordHit();
  fetchStats();
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
  padding: 30px;
  gap: 30px;
}

.left-panel-wrapper {
  position: relative;
  z-index: 10;
  width: 240px;
  margin-top: 11rem;
}

.nav-container {
  position: absolute;
  top: 0;
  width: 100%;
  box-sizing: border-box;
  background: var(--nav-bg);
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  border: 1px solid var(--nav-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
}

.nav-container.dragging {
  cursor: grabbing;
  transition: none !important;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background-color: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
  margin-bottom: 10px;
  border: 1px solid var(--nav-border);
  transition: all 0.3s ease;
}

.nav-item:hover {
  border-color: rgba(52, 211, 153, 0.3);
  background-color: var(--nav-hover-bg);
}

.icon {
  width: 18px;
  height: 18px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  color: var(--nav-text);
  opacity: 0.8;
}

.icon:hover {
  opacity: 1;
  color: #34d399;
}

.rotated {
  transform: rotate(90deg);
}

.sub-menu {
  padding-left: 14px;
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.custom-link {
  user-select: none;
  text-decoration: none;
  color: var(--nav-text);
  padding: 10px 14px;
  background-color: rgba(255, 255, 255, 0.01);
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: block;
  box-sizing: border-box;
  text-align: center;
  font-family: 'Outfit', 'Noto Sans KR', sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
  border: 1px solid var(--nav-border);
  word-break: break-all;
}

.custom-link:hover {
  background-color: var(--nav-hover-bg);
  color: #34d399;
  border-color: rgba(52, 211, 153, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(52, 211, 153, 0.15);
}

.custom-link.router-link-active {
  background: linear-gradient(135deg, rgba(52, 211, 153, 0.2) 0%, rgba(96, 165, 250, 0.2) 100%);
  color: #34d399;
  border: 1px solid rgba(52, 211, 153, 0.4);
  box-shadow: 0 4px 15px rgba(52, 211, 153, 0.25);
}

.sub-menu .custom-link:hover {
  background-color: rgba(52, 211, 153, 0.1);
  color: #34d399;
}

.content {
  flex: 1;
  margin-left: 20px;
  max-width: calc(90% - 240px);
}

/* 반응형 스타일 */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
    align-items: stretch;
    padding: 15px;
    gap: 15px;
  }

  .left-panel-wrapper {
    width: 100%;
    margin-top: 0;
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 20px;
  }

  .nav-container,
  .mini-stats-widget {
    position: relative !important;
    top: auto !important;
    left: auto !important;
    transform: none !important;
    width: 100% !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
  }

  .nav-item {
    justify-content: space-between;
    padding: 14px;
  }

  .sub-menu {
    padding-left: 0;
    margin-top: 8px;
  }

  .content {
    margin-left: 0;
    margin-right: 0;
    max-width: 100%;
    width: 100%;
  }

  .sidebar {
    width: 100%;
    position: static;
    padding: 15px 0;
    margin-top: 30px;
    border-top: 1px solid var(--nav-border);
  }

  .sidebar ul {
    display: flex;
    justify-content: center;
    gap: 25px;
    margin: 0;
  }

  .sidebar li {
    margin-bottom: 0;
  }
}

.sidebar {
  width: 280px;
  padding: 20px;
  border-radius: 16px;
  position: sticky;
  top: 20px;
  align-self: flex-start;
  user-select: none;
  -webkit-user-select: none;
  background: var(--nav-bg);
  border: 1px solid var(--nav-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.sidebar-logo {
  -webkit-user-drag: none;
  user-select: none;
  -webkit-user-select: none;
}

.sidebar h3 {
  font-family: 'Outfit', sans-serif;
  font-size: 1.2rem;
  margin-bottom: 10px;
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.sidebar li {
  margin-bottom: 0;
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

.sidebar {
  color: var(--nav-text) !important;
}
</style>