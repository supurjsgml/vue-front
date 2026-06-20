<template>
  <div class="container" :style="containerStyle">
    <canvas ref="rippleCanvas" class="global-ripple-canvas"></canvas>
    
    <!-- 배경 고정 블랙홀 위젯 -->
    <WidgetBlackHole class="black-hole-bg-widget" />
    
    <ClientOnly>
      <div
        v-if="showGlobalDog"
        class="global-dog-container"
        :style="globalDogContainerStyle"
        @mousedown.stop="startGlobalDogDrag"
        @mouseenter="onDogHover"
      >
        <NuxtImg
          src="/dog.jpg"
          alt="견희"
          class="global-bouncing-dog"
          :style="globalDogImgStyle"
          draggable="false"
          @dragstart.prevent
        />
        <Transition name="fade-bubble">
          <div v-if="showSpeechBubble" class="speech-bubble">
            {{ bubbleText }}
          </div>
        </Transition>
      </div>
    </ClientOnly>

    <div class="main-ui-wrapper" :style="containerWarpStyle">
      <!-- 왼쪽 패널 그룹 -->
      <div class="left-panel-wrapper" :class="{ 'is-collapsing': bhPhase === 'collapse' }" :style="leftPanelWarpStyle">
      <!-- 메인 네비게이션 영역 (개별 드래그) -->
      <div 
        tabindex="0"
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
        tabindex="0"
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
    </div> <!-- End of left-panel-wrapper -->

    <!-- 콘텐츠 영역 -->
    <div class="content" :class="{ 'is-collapsing': bhPhase === 'collapse' }" :style="contentWarpStyle">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>

    <!-- 오른쪽 홍보 링크 영역 -->
    <aside class="sidebar" :class="{ 'is-collapsing': bhPhase === 'collapse' }" :style="sidebarWarpStyle">
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
    </div>

    <!-- 테마 토글 버튼 -->
    <button class="theme-toggle-btn" :class="{ 'is-collapsing': bhPhase === 'collapse' }" :style="themeWarpStyle" @click="toggleTheme" title="테마 변경">
      <SunIcon v-if="isDarkMode" class="theme-icon" />
      <MoonIcon v-else class="theme-icon" />
    </button>

    <StatisticsPanel v-if="showStatsModal" @close="showStatsModal = false" />
    <div class="big-bang-overlay" :style="bigBangOverlayStyle"></div>
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

// 블랙홀 종말 및 빅뱅 상태 동기화 관리
const isMounted = ref(false);
const animationTick = ref(0);
const bhPhase = ref('idle');
const bhProgress = ref(0);
const windowHeight = ref(1000);
const windowWidth = ref(1200);

if (process.client) {
  windowHeight.value = window.innerHeight;
  windowWidth.value = window.innerWidth;
  window.addEventListener('resize', () => {
    windowHeight.value = window.innerHeight;
    windowWidth.value = window.innerWidth;
  });
}

// 실시간 동기화 위상 연산
const updateBlackHolePhase = () => {
  const loopTime = 60000;
  const t = Date.now() % loopTime;

  if (t < 35000) {
    bhPhase.value = 'grow';
    bhProgress.value = t / 35000;
  } else if (t < 40000) {
    bhPhase.value = 'collapse';
    bhProgress.value = (t - 35000) / 5000;
  } else if (t < 42000) {
    bhPhase.value = 'bigbang';
    bhProgress.value = (t - 40000) / 2000;
  } else if (t < 50000) {
    bhPhase.value = 'recover';
    bhProgress.value = (t - 42000) / 8000;
  } else {
    bhPhase.value = 'idle';
    bhProgress.value = (t - 50000) / 10000;
  }
};

const containerStyle = computed(() => {
  if (!isMounted.value) return {};
  const phase = bhPhase.value;
  const prog = bhProgress.value;
  const h = windowHeight.value;
  const w = windowWidth.value;

  const bhCenterY = h - 250;

  if (phase === 'collapse') {
    const initialRadius = 170;
    const targetRadius = Math.sqrt(w * w + h * h) + 200;
    const currentRadius = initialRadius + (targetRadius - initialRadius) * prog;
    const innerRadius = Math.max(0, currentRadius - 70);
    const outerRadius = currentRadius + 70;

    return {
      '--bh-y': `${bhCenterY}px`,
      '--bh-mask-radius-inner': `${innerRadius}px`,
      '--bh-mask-radius-outer': `${outerRadius}px`,
    };
  }
  return {
    '--bh-y': `${h - 250}px`,
    '--bh-mask-radius-inner': `0px`,
    '--bh-mask-radius-outer': `0px`,
  };
});

const containerWarpStyle = computed(() => {
  return {};
});

// 1단계: 왼쪽 패널 스타일 (가장 먼저 소멸/복구)
const leftPanelWarpStyle = computed(() => {
  if (!isMounted.value) return {};
  const phase = bhPhase.value;
  const prog = bhProgress.value;
  const h = windowHeight.value;

  const dx = 250 - 170;
  const dy = (h - 250) - 450;

  if (phase === 'collapse') {
    const localBhX = 250 - leftRect.value.left;
    const localBhY = (h - 250) - leftRect.value.top;
    return {
      pointerEvents: 'none' as const,
      transition: 'none',
      '--local-bh-x': `${localBhX}px`,
      '--local-bh-y': `${localBhY}px`,
    };
  } else if (phase === 'bigbang') {
    return { opacity: 0, filter: 'blur(12px)', pointerEvents: 'none' as const };
  } else if (phase === 'recover') {
    const localProg = Math.min(1.0, Math.max(0, (prog - 0.4) / 0.6));
    const invProg = 1.0 - localProg;
    const tx = dx * invProg;
    const ty = dy * invProg;
    const scale = localProg;
    const rotate = -invProg * 360;

    return {
      transform: `translate(${tx}px, ${ty}px) scale(${scale}) rotate(${rotate}deg)`,
      opacity: localProg,
      filter: `blur(${invProg * 8}px)`,
      transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease-out'
    };
  }
  return {};
});

// 2단계: 중앙 콘텐츠 스타일 (중간 영역 소멸/복구)
const contentWarpStyle = computed(() => {
  if (!isMounted.value) return {};
  const phase = bhPhase.value;
  const prog = bhProgress.value;
  const h = windowHeight.value;
  const w = windowWidth.value;

  const dx = 250 - (w / 2);
  const dy = (h - 250) - (h / 2);

  if (phase === 'collapse') {
    const localBhX = 250 - contentRect.value.left;
    const localBhY = (h - 250) - contentRect.value.top;
    return {
      pointerEvents: 'none' as const,
      transition: 'none',
      '--local-bh-x': `${localBhX}px`,
      '--local-bh-y': `${localBhY}px`,
    };
  } else if (phase === 'bigbang') {
    return { opacity: 0, filter: 'blur(12px)', pointerEvents: 'none' as const };
  } else if (phase === 'recover') {
    const localProg = Math.min(1.0, Math.max(0, (prog - 0.2) / 0.6));
    const invProg = 1.0 - localProg;
    const tx = dx * invProg;
    const ty = dy * invProg;
    const scale = localProg;
    const rotate = -invProg * 270;

    return {
      transform: `translate(${tx}px, ${ty}px) scale(${scale}) rotate(${rotate}deg)`,
      opacity: localProg,
      filter: `blur(${invProg * 8}px)`,
      transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease-out'
    };
  }
  return {};
});

// 3단계: 우측 사이드바 및 테마 버튼 스타일 (오른쪽 위 끝자락 가장 늦게 소멸/가장 먼저 복구)
const sidebarWarpStyle = computed(() => {
  if (!isMounted.value) return {};
  const phase = bhPhase.value;
  const prog = bhProgress.value;
  const h = windowHeight.value;
  const w = windowWidth.value;

  const dx = 250 - (w - 140);
  const dy = (h - 250) - 250;

  if (phase === 'collapse') {
    const localBhX = 250 - sidebarRect.value.left;
    const localBhY = (h - 250) - sidebarRect.value.top;
    return {
      pointerEvents: 'none' as const,
      transition: 'none',
      '--local-bh-x': `${localBhX}px`,
      '--local-bh-y': `${localBhY}px`,
    };
  } else if (phase === 'bigbang') {
    return { opacity: 0, filter: 'blur(12px)', pointerEvents: 'none' as const };
  } else if (phase === 'recover') {
    const localProg = Math.min(1.0, Math.max(0, prog / 0.5));
    const invProg = 1.0 - localProg;
    const tx = dx * invProg;
    const ty = dy * invProg;
    const scale = localProg;
    const rotate = -invProg * 180;

    return {
      transform: `translate(${tx}px, ${ty}px) scale(${scale}) rotate(${rotate}deg)`,
      opacity: localProg,
      filter: `blur(${invProg * 8}px)`,
      transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease-out'
    };
  }
  return {};
});

// 테마 버튼 전용 소멸/복구 스타일
const themeWarpStyle = computed(() => {
  if (!isMounted.value) return {};
  const phase = bhPhase.value;
  const prog = bhProgress.value;
  const h = windowHeight.value;

  const dx = 250 - themeRect.value.left;
  const dy = (h - 250) - themeRect.value.top;

  if (phase === 'collapse') {
    const localBhX = 250 - themeRect.value.left;
    const localBhY = (h - 250) - themeRect.value.top;
    return {
      pointerEvents: 'none' as const,
      transition: 'none',
      '--local-bh-x': `${localBhX}px`,
      '--local-bh-y': `${localBhY}px`,
    };
  } else if (phase === 'bigbang') {
    return { opacity: 0, filter: 'blur(12px)', pointerEvents: 'none' as const };
  } else if (phase === 'recover') {
    const localProg = Math.min(1.0, Math.max(0, prog / 0.5));
    const invProg = 1.0 - localProg;
    const tx = dx * invProg;
    const ty = dy * invProg;
    const scale = localProg;
    const rotate = -invProg * 180;

    return {
      transform: `translate(${tx}px, ${ty}px) scale(${scale}) rotate(${rotate}deg)`,
      opacity: localProg,
      filter: `blur(${invProg * 8}px)`,
      transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease-out'
    };
  }
  return {};
});

const bigBangOverlayStyle = computed(() => {
  const phase = bhPhase.value;
  const prog = bhProgress.value;

  if (phase === 'bigbang') {
    const opacity = 1.0 - prog;
    return {
      display: 'block',
      backgroundColor: '#ffffff',
      opacity: opacity,
      zIndex: 9999,
    };
  } else if (phase === 'recover') {
    return {
      display: 'block',
      backgroundColor: '#ffffff',
      opacity: Math.max(0, 0.2 - prog) * 5.0,
      pointerEvents: 'none' as const,
      zIndex: 9999,
    };
  }

  return {
    display: 'none',
  };
});

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

const hoveredIndex = ref<number | null>(null)

const sparklinePoints = computed(() => {
  const values = statsData.value.sparklineValues || [];
  if (values.length === 0) return [];
  
  const width = 200;
  const height = 50;
  const maxVal = Math.max(...values, 10);
  const minVal = 0;
  const range = maxVal - minVal;
  
  return values.map((val, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = height - (val / range) * (height - 10) - 5;
    return { x, y, val };
  });
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
    
    // 텍스트 드래그 선택이 발생하는 기본 이벤트를 차단하고 포커스를 활성화합니다.
    event.preventDefault()
    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.focus()
    }
    
    isDragging.value = true
    hasMoved.value = false
    dragOffset.value = {
      x: event.clientX - position.value.x,
      y: event.clientY - position.value.y
    }
    
    if (process.client) {
      document.body.classList.add('dragging-active')
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
      if (process.client) {
        document.body.classList.remove('dragging-active')
      }
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

interface FragmentParticle {
  x: number;
  y: number;
  startX: number;
  startY: number;
  color: string;
  size: number;
  angle: number;
  radius: number;
  angularSpeed: number;
  speed: number;
  opacity: number;
  active: boolean;
  threshold: number;
  activated: boolean;
  group: 'left' | 'content' | 'sidebar' | 'theme';
}

const uiFragments: FragmentParticle[] = [];
let collapseTriggered = false;

const leftRect = ref({ left: 0, top: 0, width: 0, height: 0 });
const contentRect = ref({ left: 0, top: 0, width: 0, height: 0 });
const sidebarRect = ref({ left: 0, top: 0, width: 0, height: 0 });
const themeRect = ref({ left: 0, top: 0, width: 0, height: 0 });

const spawnDustParticles = (group: 'left' | 'content' | 'sidebar' | 'theme', rect: { left: number, top: number, width: number, height: number }) => {
  if (rect.width <= 0 || rect.height <= 0) return;
  
  let count = 250;
  let baseColors: string[] = [];
  
  if (group === 'left') {
    count = 800;
    baseColors = [
      'rgba(52, 211, 153, opacity)',  // emerald
      'rgba(255, 255, 255, opacity)', // white dust
      'rgba(30, 41, 59, opacity)'     // slate
    ];
  } else if (group === 'content') {
    count = 1600;
    baseColors = [
      'rgba(96, 165, 250, opacity)',  // blue
      'rgba(248, 250, 252, opacity)', // white text
      'rgba(15, 23, 42, opacity)'     // slate-900
    ];
  } else if (group === 'sidebar') {
    count = 600;
    baseColors = [
      'rgba(251, 191, 36, opacity)',  // gold
      'rgba(255, 255, 255, opacity)', // white
      'rgba(30, 41, 59, opacity)'     // slate
    ];
  } else if (group === 'theme') {
    count = 150;
    baseColors = [
      'rgba(251, 191, 36, opacity)',  // amber
      'rgba(253, 224, 71, opacity)',  // yellow
      'rgba(255, 255, 255, opacity)'
    ];
  }
  
  for (let i = 0; i < count; i++) {
    const rx = rect.left + Math.random() * rect.width;
    const ry = rect.top + Math.random() * rect.height;
    
    // threshold from top-right to bottom-left:
    const threshold = ((rect.left + rect.width - rx) / rect.width + (ry - rect.top) / rect.height) / 2;
    const color = baseColors[Math.floor(Math.random() * baseColors.length)];
    
    // Volumetric size distribution:
    // 60% small dust (0.6 - 1.8px)
    // 30% medium chunks (1.8 - 3.5px)
    // 10% large/thick debris (3.5 - 7.5px)
    const rand = Math.random();
    let size = 1.0;
    if (rand < 0.60) {
      size = Math.random() * 1.2 + 0.6;
    } else if (rand < 0.90) {
      size = Math.random() * 1.7 + 1.8;
    } else {
      size = Math.random() * 4.0 + 3.5;
    }
    
    uiFragments.push({
      x: rx,
      y: ry,
      startX: rx,
      startY: ry,
      color: color,
      size: size,
      angle: 0,
      radius: 0,
      angularSpeed: (Math.random() * 0.022 + 0.012) * (Math.random() < 0.5 ? 1 : -1),
      speed: Math.random() * 2.0 + 0.8,
      opacity: 1.0,
      active: true,
      threshold: threshold,
      activated: false,
      group: group
    });
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

  // 리액티비티 및 페이즈 갱신 트리거
  updateBlackHolePhase();
  animationTick.value++;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  mouse.x += (mouse.targetX - mouse.x) * 0.1;
  mouse.y += (mouse.targetY - mouse.y) * 0.1;

  const bhCenterX = 250;
  const bhCenterY = canvas.height - 250;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];

    // Natural breathing waving motion
    const waveX = Math.sin(time * waveSpeed + p.originY * 0.01) * 1.5;
    const waveY = Math.cos(time * waveSpeed + p.originX * 0.01) * waveAmp;

    const targetX = p.originX + waveX;
    const targetY = p.originY + waveY;

    // 블랙홀의 시공간 왜곡(중력 당김) 계산
    const bhDx = bhCenterX - p.x;
    const bhDy = bhCenterY - p.y;
    const bhDist = Math.sqrt(bhDx * bhDx + bhDy * bhDy);
    
    let gravityX = 0;
    let gravityY = 0;
    if (bhDist > 20) {
      let pullPower = 4500;
      const phase = bhPhase.value;
      const prog = bhProgress.value;

      if (phase === 'grow') {
        pullPower = 4500 + prog * 65000; // 최대 15배 강력하게 빨아들임
      } else if (phase === 'collapse') {
        pullPower = 69500 + prog * 180000; // 우주 붕괴 시 완전 수축 유도
      } else if (phase === 'bigbang') {
        pullPower = -25000 * (1.0 - prog); // 대폭발 팽창 시 반발력 발생
      } else if (phase === 'recover') {
        pullPower = 4500 * prog;
      }

      const limit = phase === 'collapse' ? 90 : 25;
      const pull = Math.min(limit, pullPower / (bhDist * bhDist));
      const bhAngle = Math.atan2(bhDy, bhDx);
      gravityX = Math.cos(bhAngle) * pull;
      gravityY = Math.sin(bhAngle) * pull;
    }

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

    p.vx += ax + gravityX;
    p.vy += ay + gravityY;
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

  // --- 컴포넌트 점진적 분쇄용 파편(Fragment Particles) 연출 시뮬레이션 ---
  const phase = bhPhase.value;
  const prog = bhProgress.value;

  if (phase === 'collapse') {
    if (!collapseTriggered) {
      const leftEl = document.querySelector('.left-panel-wrapper');
      const contentEl = document.querySelector('.content');
      const sidebarEl = document.querySelector('.sidebar');
      const themeEl = document.querySelector('.theme-toggle-btn');

      leftRect.value = leftEl ? leftEl.getBoundingClientRect() : { left: 50, top: 150, width: 240, height: 600 };
      contentRect.value = contentEl ? contentEl.getBoundingClientRect() : { left: 320, top: 100, width: canvas.width - 640, height: canvas.height - 200 };
      sidebarRect.value = sidebarEl ? sidebarEl.getBoundingClientRect() : { left: canvas.width - 300, top: 80, width: 250, height: 500 };
      themeRect.value = themeEl ? themeEl.getBoundingClientRect() : { left: canvas.width - 65, top: 20, width: 45, height: 45 };

      uiFragments.length = 0;
      spawnDustParticles('left', leftRect.value);
      spawnDustParticles('content', contentRect.value);
      spawnDustParticles('sidebar', sidebarRect.value);
      spawnDustParticles('theme', themeRect.value);

      collapseTriggered = true;
    }
  } else {
    collapseTriggered = false;
    if (phase !== 'bigbang') {
      uiFragments.length = 0;
    }
  }

  if (uiFragments.length > 0) {
    for (let i = 0; i < uiFragments.length; i++) {
      const p = uiFragments[i];
      if (!p.active) continue;

      if (phase === 'collapse') {
        if (!p.activated) {
          const dx = p.startX - bhCenterX;
          const dy = p.startY - bhCenterY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          const targetRadius = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height) + 200;
          const currentRadius = 170 + (targetRadius - 170) * prog;

          if (currentRadius + 70 >= dist) {
            p.activated = true;
            p.radius = dist;
            p.angle = Math.atan2(dy, dx);
          }
        }

        if (p.activated) {
          const speedMult = 1.5 + prog * 6.0;
          const gravityPull = Math.min(8.0, 200 / Math.max(p.radius, 12));
          
          p.radius -= p.speed * speedMult * gravityPull * 1.2;
          p.angle += p.angularSpeed * speedMult * gravityPull * 2.5;

          p.x = bhCenterX + Math.cos(p.angle) * p.radius;
          p.y = bhCenterY + Math.sin(p.angle) * p.radius;

          // Smoothly fade out near the event horizon (under 60px radius)
          if (p.radius < 60) {
            p.opacity = Math.max(0, p.radius / 60);
          }

          if (p.radius < 12 || p.opacity <= 0) {
            p.active = false;
          }
        }
      } else if (phase === 'bigbang') {
        if (p.activated) {
          const speedMult = 8.0 * (1.0 - prog);
          p.radius += p.speed * speedMult;
          p.angle += p.angularSpeed * 0.5;

          p.x = bhCenterX + Math.cos(p.angle) * p.radius;
          p.y = bhCenterY + Math.sin(p.angle) * p.radius;
          p.opacity = Math.max(0, 1.0 - prog);

          if (p.opacity <= 0) {
            p.active = false;
          }
        }
      }

      if (p.activated && p.active && p.opacity > 0) {
        if (p.size > 3.5) {
          // Draw a soft outer glow for large chunks
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.8, 0, Math.PI * 2);
          ctx.fillStyle = p.color.replace('opacity', (p.opacity * 0.15).toFixed(2));
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace('opacity', p.opacity.toFixed(2));
        ctx.fill();
      }
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
  isMounted.value = true;
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

const showGlobalDog = computed(() => {
  return route.path !== '/';
});

const globalDogWidth = ref(180);
const globalDogHeight = ref(180);

const gx = ref(100);
const gy = ref(100);
const gvx = ref(1.8);
const gvy = ref(1.4);
const gRotation = ref(0);
const gRotationSpeed = ref(0.4);
const gBounceCount = ref(0);
const globalDogScale = ref(1.0);
const isSuckedIn = ref(false);

const showSpeechBubble = ref(false);
const bubbleText = ref('끄어억!');
let bubbleTimer: any = null;

const onDogHover = () => {
  if (gIsDragging.value) return;
  
  const messages = [
    '끄어어억...',
    '끄어억! 살려주;.세.',
    '끄어',
    '끄어억멍!!',
    '💤',
    '끼이이이ㄱㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣ',
  ];
  const randomIndex = Math.floor(Math.random() * messages.length);
  bubbleText.value = messages[randomIndex];
  showSpeechBubble.value = true;

  if (bubbleTimer) {
    clearTimeout(bubbleTimer);
  }
  bubbleTimer = setTimeout(() => {
    showSpeechBubble.value = false;
  }, 5000);
};

// Speech bubble persists for 5s, mouseleave handler is removed

const gIsDragging = ref(false);
let lastMouseX = 0;
let lastMouseY = 0;
let lastDragTime = 0;
let dragHasMoved = false;

const startGlobalDogDrag = (event: MouseEvent) => {
  if (event.button !== 0) return; // Only allow left-clicks
  
  gIsDragging.value = true;
  dragHasMoved = false;
  
  const initialMouseX = event.clientX;
  const initialMouseY = event.clientY;
  const initialDogX = gx.value;
  const initialDogY = gy.value;
  
  lastMouseX = event.clientX;
  lastMouseY = event.clientY;
  lastDragTime = performance.now();
  
  const onDrag = (e: MouseEvent) => {
    if (!gIsDragging.value) return;
    
    dragHasMoved = true;
    
    const dx = e.clientX - initialMouseX;
    const dy = e.clientY - initialMouseY;
    
    const viewWidth = window.innerWidth;
    const viewHeight = window.innerHeight;
    
    gx.value = Math.min(viewWidth - globalDogWidth.value, Math.max(0, initialDogX + dx));
    gy.value = Math.min(viewHeight - globalDogHeight.value, Math.max(0, initialDogY + dy));
    
    const currentTime = performance.now();
    const dt = currentTime - lastDragTime;
    
    if (dt > 10) {
      const distMouseX = e.clientX - lastMouseX;
      const distMouseY = e.clientY - lastMouseY;
      
      const instVx = distMouseX / (dt / 16.67);
      const instVy = distMouseY / (dt / 16.67);
      
      gvx.value = gvx.value * 0.4 + instVx * 0.6;
      gvy.value = gvy.value * 0.4 + instVy * 0.6;
      
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      lastDragTime = currentTime;
    }
  };
  
  const stopDrag = () => {
    gIsDragging.value = false;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
    
    gBounceCount.value = 0; // Reset bounce count on release
    
    const speed = Math.sqrt(gvx.value * gvx.value + gvy.value * gvy.value);
    const maxSpeed = 8;
    const minSpeed = 1.2;
    
    if (speed > maxSpeed) {
      const ratio = maxSpeed / speed;
      gvx.value *= ratio;
      gvy.value *= ratio;
    } else if (speed < minSpeed) {
      const angle = Math.random() * Math.PI * 2;
      gvx.value = Math.cos(angle) * minSpeed;
      gvy.value = Math.sin(angle) * minSpeed;
    }
    
    // Speech bubble is now hover-based, no need for click trigger here
  };
  
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
};

const globalDogContainerStyle = computed(() => {
  return {
    position: 'fixed' as const,
    left: `${gx.value}px`,
    top: `${gy.value}px`,
    width: `${globalDogWidth.value}px`,
    height: `${globalDogHeight.value}px`,
    display: showGlobalDog.value ? 'block' : 'none',
    zIndex: 100,
    pointerEvents: 'auto' as const,
    cursor: gIsDragging.value ? 'grabbing' : 'grab',
    transform: `scale(${globalDogScale.value})`,
    transition: gIsDragging.value ? 'none' : 'transform 0.1s ease'
  };
});

const globalDogImgStyle = computed(() => {
  return {
    transform: `rotate(${gRotation.value}deg)`,
    width: '100%',
    height: '100%',
    objectFit: 'contain' as const,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    padding: '10px',
    boxSizing: 'border-box' as const,
    border: '2px solid rgba(52, 211, 153, 0.3)',
    boxShadow: '0 8px 25px rgba(52, 211, 153, 0.2), 0 4px 10px rgba(0, 0, 0, 0.3)',
    display: 'block'
  };
});

let gAnimationFrameId: number;
let gAngleOffset = 0;

const animateGlobalDog = () => {
  if (!showGlobalDog.value) return;

  const dogCenterX = gx.value + globalDogWidth.value / 2;
  const dogCenterY = gy.value + globalDogHeight.value / 2;

  // 배경 고정 블랙홀 중심 좌표 계산
  const bhCenterX = 250;
  const bhCenterY = window.innerHeight - 250;

  if (!gIsDragging.value) {
    const dx = bhCenterX - dogCenterX;
    const dy = bhCenterY - dogCenterY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // 대종말 위상에 따른 견희 강제 삼킴 및 복구 연동
    const phase = bhPhase.value;
    const prog = bhProgress.value;

    if (phase === 'collapse') {
      isSuckedIn.value = true;
      gx.value += (bhCenterX - globalDogWidth.value / 2 - gx.value) * 0.3;
      gy.value += (bhCenterY - globalDogHeight.value / 2 - gy.value) * 0.3;
      globalDogScale.value = Math.max(0, globalDogScale.value - 0.1);
      gRotation.value += 25;
      gAnimationFrameId = requestAnimationFrame(animateGlobalDog);
      return;
    }

    if (phase === 'bigbang') {
      isSuckedIn.value = false;
      globalDogScale.value = 0; // 빅뱅 폭발 시 잠시 숨김
      gAnimationFrameId = requestAnimationFrame(animateGlobalDog);
      return;
    }

    if (phase === 'recover') {
      // 폭발 후 우주 창조 시점에 서서히 스케일 업
      globalDogScale.value = prog;
    }

    if (isSuckedIn.value) {
      // 1단계: 사건의 지평선 내부로 나선 회전하며 축소 흡수
      gx.value += (bhCenterX - globalDogWidth.value / 2 - gx.value) * 0.15;
      gy.value += (bhCenterY - globalDogHeight.value / 2 - gy.value) * 0.15;
      globalDogScale.value = Math.max(0, globalDogScale.value - 0.05);
      gRotationSpeed.value = gRotationSpeed.value * 1.1 + 0.8;

      if (globalDogScale.value <= 0.02) {
        // 2단계: 완전히 빨려 들어간 뒤 맵의 모서리(랜덤)로 순간 이동 및 재생성
        isSuckedIn.value = false;
        globalDogScale.value = 1.0;
        gRotationSpeed.value = 0.4;

        const viewWidth = window.innerWidth;
        const viewHeight = window.innerHeight;
        const corners = [
          { x: 50, y: 50 },
          { x: viewWidth - globalDogWidth.value - 50, y: 50 },
          { x: 50, y: viewHeight - globalDogHeight.value - 50 },
          { x: viewWidth - globalDogWidth.value - 50, y: viewHeight - globalDogHeight.value - 50 }
        ];
        const randomCorner = corners[Math.floor(Math.random() * corners.length)];
        gx.value = randomCorner.x;
        gy.value = randomCorner.y;

        const initialAngle = Math.random() * Math.PI * 2;
        const initialSpeed = 1.4;
        gvx.value = Math.cos(initialAngle) * initialSpeed;
        gvy.value = Math.sin(initialAngle) * initialSpeed;

        bubbleText.value = '살려주세요 살려주세요 살려주세요어억!!!!';
        showSpeechBubble.value = true;
        if (bubbleTimer) clearTimeout(bubbleTimer);
        bubbleTimer = setTimeout(() => {
          showSpeechBubble.value = false;
        }, 5000);
      }

      gRotation.value = (gRotation.value + gRotationSpeed.value) % 360;
      gAnimationFrameId = requestAnimationFrame(animateGlobalDog);
      return;
    } else if (dist < 65) {
      // 아주 근접할 시 흡수 프로세스 트리거
      isSuckedIn.value = true;
      showSpeechBubble.value = true;
      if (bubbleTimer) clearTimeout(bubbleTimer);
    } else {
      // 성장기에 따라 견희의 최대 끌어당김 반경을 확장 (280px -> 최대 500px)
      const range = 280 + (phase === 'grow' ? prog * 220 : 0);
      
      if (dist < range) {
        const pullForce = (range - dist) / range;
        const angle = Math.atan2(dy, dx);
        const pullScale = 0.35 + (phase === 'grow' ? prog * 2.5 : 0);
        
        gvx.value += Math.cos(angle) * pullForce * pullScale;
        gvy.value += Math.sin(angle) * pullForce * pullScale;

        // 최대 속도 제어
        const currentSpeed = Math.sqrt(gvx.value * gvx.value + gvy.value * gvy.value);
        if (currentSpeed > 6.0) {
          gvx.value = (gvx.value / currentSpeed) * 6.0;
          gvy.value = (gvy.value / currentSpeed) * 6.0;
        }

        // 회전 속도 급증
        gRotationSpeed.value = gRotationSpeed.value * 0.95 + Math.sign(gRotationSpeed.value) * pullForce * 1.8;

        if (Math.random() < 0.02) {
          bubbleText.value = Math.random() < 0.5 ? '어어.. 끌려들어간다!' : '끄어어어억! 살려줘!';
          showSpeechBubble.value = true;
          if (bubbleTimer) clearTimeout(bubbleTimer);
          bubbleTimer = setTimeout(() => {
            showSpeechBubble.value = false;
          }, 1500);
        }
      }
    }
  }

  if (gIsDragging.value) {
    gRotation.value = (gRotation.value + gRotationSpeed.value) % 360;
    gAnimationFrameId = requestAnimationFrame(animateGlobalDog);
    return;
  }

  const viewWidth = window.innerWidth;
  const viewHeight = window.innerHeight;

  gx.value += gvx.value;
  gy.value += gvy.value;
  
  gRotation.value = (gRotation.value + gRotationSpeed.value) % 360;
  
  let bounced = false;
  
  if (gx.value < 0) {
    gx.value = 0;
    gvx.value = Math.abs(gvx.value);
    bounced = true;
  } else if (gx.value + globalDogWidth.value > viewWidth) {
    gx.value = viewWidth - globalDogWidth.value;
    gvx.value = -Math.abs(gvx.value);
    bounced = true;
  }
  
  if (gy.value < 0) {
    gy.value = 0;
    gvy.value = Math.abs(gvy.value);
    bounced = true;
  } else if (gy.value + globalDogHeight.value > viewHeight) {
    gy.value = viewHeight - globalDogHeight.value;
    gvy.value = -Math.abs(gvy.value);
    bounced = true;
  }
  
  if (bounced) {
    gRotationSpeed.value = -gRotationSpeed.value * 1.05;
    if (Math.abs(gRotationSpeed.value) > 1.5) {
      gRotationSpeed.value = Math.sign(gRotationSpeed.value) * 1.0;
    }
    
    gBounceCount.value++;
    if (gBounceCount.value >= 5) {
      const currentSpeed = Math.sqrt(gvx.value * gvx.value + gvy.value * gvy.value);
      if (currentSpeed > 0) {
        const targetSpeed = 1.6;
        const ratio = targetSpeed / currentSpeed;
        gvx.value *= ratio;
        gvy.value *= ratio;
      }
      gBounceCount.value = 0;
    }
  }
  
  gAnimationFrameId = requestAnimationFrame(animateGlobalDog);
};

const updateGlobalDogDimensions = () => {
  if (!process.client) return;
  const size = window.innerWidth > 768 ? 180 : 120;
  globalDogWidth.value = size;
  globalDogHeight.value = size;
};

const toggleGlobalDogAnimation = (isActive: boolean) => {
  if (!process.client) return;
  if (isActive) {
    const viewWidth = window.innerWidth;
    const viewHeight = window.innerHeight;
    gx.value = Math.random() * (viewWidth - globalDogWidth.value);
    gy.value = Math.random() * (viewHeight - globalDogHeight.value);

    const initialAngle = Math.random() * Math.PI * 2;
    const initialSpeed = 1.4;
    gvx.value = Math.cos(initialAngle) * initialSpeed;
    gvy.value = Math.sin(initialAngle) * initialSpeed;

    updateGlobalDogDimensions();
    window.addEventListener('resize', updateGlobalDogDimensions);
    
    cancelAnimationFrame(gAnimationFrameId);
    gAnimationFrameId = requestAnimationFrame(animateGlobalDog);
  } else {
    window.removeEventListener('resize', updateGlobalDogDimensions);
    cancelAnimationFrame(gAnimationFrameId);
  }
};

watch(showGlobalDog, (newVal) => {
  if (process.client) {
    toggleGlobalDogAnimation(newVal);
  }
}, { immediate: true });

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('mousemove', handleGlobalMouseMove);
  window.removeEventListener('mouseleave', handleGlobalMouseLeave);
  cancelAnimationFrame(animationFrameId);

  window.removeEventListener('resize', updateGlobalDogDimensions);
  cancelAnimationFrame(gAnimationFrameId);
});
</script>

<style scoped>
@import url('@/assets/styles/mini-stats.css');

.is-collapsing {
  mask-image: radial-gradient(circle at 250px var(--bh-y), transparent var(--bh-mask-radius-inner, 0px), black var(--bh-mask-radius-outer, 0px));
  -webkit-mask-image: radial-gradient(circle at 250px var(--bh-y), transparent var(--bh-mask-radius-inner, 0px), black var(--bh-mask-radius-outer, 0px));
}

.global-ripple-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: -1;
}

.global-dog-container {
  position: fixed !important;
  z-index: 0;
  pointer-events: auto;
  cursor: pointer;
  transition: transform 0.1s ease;
}

.global-bouncing-dog {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Speech bubble styling */
.speech-bubble {
  position: absolute;
  bottom: 115%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #34d399;
  color: #0f172a;
  padding: 8px 14px;
  border-radius: 16px;
  font-size: 0.9rem;
  font-weight: 800;
  white-space: nowrap;
  box-shadow: 0 8px 20px rgba(52, 211, 153, 0.3), 0 4px 8px rgba(0, 0, 0, 0.15);
  font-family: 'Outfit', 'Noto Sans KR', sans-serif;
  pointer-events: none;
  z-index: 100;
  user-select: none;
}

[data-bs-theme="dark"] .speech-bubble {
  background: rgba(15, 23, 42, 0.95);
  border-color: #34d399;
  color: #f8fafc;
  box-shadow: 0 8px 25px rgba(52, 211, 153, 0.4), 0 4px 10px rgba(0, 0, 0, 0.4);
}

/* Speech bubble arrows */
.speech-bubble::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 8px;
  border-style: solid;
  border-color: rgba(255, 255, 255, 0.95) transparent transparent transparent;
}

[data-bs-theme="dark"] .speech-bubble::after {
  border-color: rgba(15, 23, 42, 0.95) transparent transparent transparent;
}

.speech-bubble::before {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 10px;
  border-style: solid;
  border-color: #34d399 transparent transparent transparent;
}

/* Cute bounce transitions for bubble */
.fade-bubble-enter-active {
  animation: bubble-bounce 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.fade-bubble-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-bubble-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px) scale(0.9);
}

@keyframes bubble-bounce {
  0% {
    opacity: 0;
    transform: translate(-50%, 15px) scale(0.6);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
  }
}

.container {
  max-width: 1800px;
  margin: 0 auto;
  padding: 30px;
}

.main-ui-wrapper {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
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
  min-width: 0; /* Allows content area to shrink below its default content size */
  margin-left: 20px;
  position: relative;
  z-index: 1;
  pointer-events: none;
}

.content :deep(.converter-header),
.content :deep(.glass-card),
.content :deep(.editor-card),
.content :deep(.download-bar),
.content :deep(iframe),
.content :deep(.draggable) {
  pointer-events: auto;
}

/* 반응형 스타일 */
@media (max-width: 768px) {
  .container {
    padding: 15px;
  }

  .main-ui-wrapper {
    flex-direction: column;
    align-items: stretch;
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
  box-sizing: border-box; /* Ensures padding does not increase the sidebar's width */
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
  z-index: 1;
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

.black-hole-bg-widget {
  position: fixed !important;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
}

.big-bang-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  mix-blend-mode: screen;
}
</style>