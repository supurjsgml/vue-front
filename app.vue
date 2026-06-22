<template>
  <div class="container" :style="containerStyle">
    <!-- 배경 그리드 및 파편 시뮬레이션 컴포넌트 -->
    <WidgetBackgroundGrid 
      v-if="isBlackHoleEnabled"
      :bhPhase="bhPhase" 
      :bhProgress="bhProgress" 
      :animationTick="animationTick" 
      :isDarkMode="isDarkMode" 
      :leftRect="leftRect"
      :contentRect="contentRect"
      :sidebarRect="sidebarRect"
      :themeRect="themeRect"
    />
    
    <!-- 배경 고정 블랙홀 위젯 -->
    <WidgetBlackHole v-if="isBlackHoleEnabled" class="black-hole-bg-widget" />
    
    <!-- 견희 캐릭터 위젯 -->
    <WidgetGlobalDog 
      :bhPhase="bhPhase" 
      :bhProgress="bhProgress" 
    />

    <div class="main-ui-wrapper" :style="containerWarpStyle">
      <!-- 왼쪽 패널 그룹 -->
      <div class="left-panel-wrapper" :style="leftPanelWarpStyle">
      <!-- 메인 네비게이션 영역 (개별 드래그) -->
      <div 
        tabindex="0"
        class="nav-container draggable-panel"
        :class="{ dragging: navIsDragging }"
        @mousedown.stop="startNavDrag"
        :style="navWarpStyle"
      >
        <div class="nav-item" @click="toggleMain">
        <NuxtLink class="custom-link" to="/" @click="() => isMainOpen = false" @mousedown.stop>main</NuxtLink>
        <ChevronRightIcon @click="toggleMain" :class="{ rotated: isMainOpen }" class="icon" />
      </div>
      <div class="sub-menu" v-if="isMainOpen">
        <NuxtLink class="custom-link" to="/camel" @mousedown.stop>camel</NuxtLink>
      </div>
      <div class="sub-menu" v-if="isMainOpen">
        <NuxtLink class="custom-link" to="/translate" @mousedown.stop>번역쓰</NuxtLink>
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
        :style="statsWarpStyle"
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
    <div class="content" :style="contentWarpStyle">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>

    <!-- 오른쪽 홍보 링크 영역 -->
    <aside class="sidebar" :style="sidebarWarpStyle">
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
    <button class="theme-toggle-btn" :style="themeWarpStyle" @click="toggleTheme" title="테마 변경">
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

const { isBlackHoleEnabled, bigBangTriggerTime, initBlackHoleSetting } = useBlackHole()
const timeOffset = ref(0)

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
  const t = (Date.now() + timeOffset.value) % loopTime;

  if (t < 35000) {
    bhPhase.value = 'grow';
    bhProgress.value = t / 35000;
  } else if (t < 40000) {
    bhPhase.value = 'collapse';
    bhProgress.value = (t - 35000) / 5000;
  } else if (t < 42000) {
    bhPhase.value = 'bigbang';
    bhProgress.value = (t - 40000) / 2000;
  } else if (t < 46000) {
    bhPhase.value = 'recover';
    bhProgress.value = (t - 42000) / 4000; // 8초에서 4초로 단축
  } else {
    bhPhase.value = 'idle';
    bhProgress.value = (t - 46000) / 14000; // 대기 시간 14초로 조정하여 루프 총 60초 유지
  }
};

const containerStyle = computed(() => {
  if (!isMounted.value) return {};
  const h = windowHeight.value;
  return {
    '--bh-y': `${h - 250}px`,
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
  const tick = animationTick.value;

  const dx = 250 - 170;
  const dy = (h - 250) - 450;

  if (phase === 'collapse') {
    const localBhX = 250 - leftRect.value.left;
    const localBhY = (h - 250) - leftRect.value.top;

    const speed = 0.15;
    const shift = 0;
    const angleX = Math.sin(tick * speed + shift) * prog * 10;
    const angleY = Math.cos(tick * speed * 0.8 + shift) * prog * 10;

    // 흡입 모션 연산
    const suckStart = 0.55;
    const suckProg = prog >= suckStart ? (prog - suckStart) / (1.0 - suckStart) : 0;
    const scaleMult = 1.0 - suckProg;
    const scaleX = (1.0 + Math.sin(tick * speed * 1.2 + shift) * prog * 0.08) * scaleMult;
    const scaleY = (1.0 + Math.cos(tick * speed * 1.1 + shift) * prog * 0.08) * scaleMult;

    const pullX = localBhX * Math.pow(suckProg, 1.8);
    const pullY = localBhY * Math.pow(suckProg, 1.8);
    const translateX = Math.cos(tick * speed * 1.5 + shift) * prog * 12 + pullX;
    const translateY = Math.sin(tick * speed * 1.3 + shift) * prog * 12 + pullY;

    const spiralRotate = suckProg * 90 * (shift % 2 === 0 ? 1 : -1);

    return {
      pointerEvents: 'none' as const,
      transition: 'none',
      '--local-bh-x': `${localBhX}px`,
      '--local-bh-y': `${localBhY}px`,
      transform: `translate3d(${translateX}px, ${translateY}px, 0) rotate(${spiralRotate}deg) skew(${angleX}deg, ${angleY}deg) scale(${scaleX}, ${scaleY})`,
      opacity: 1.0 - suckProg,
      willChange: 'transform, opacity',
    };
  } else if (phase === 'bigbang') {
    return { opacity: 0, filter: 'blur(12px)', pointerEvents: 'none' as const };
  } else if (phase === 'recover') {
    // 제자리에서 페이드인 + 블러 해제 (회전/이동/스케일 삭제)
    const localProg = Math.min(1.0, Math.max(0, (prog - 0.4) / 0.6));
    const invProg = 1.0 - localProg;

    return {
      opacity: localProg,
      filter: `blur(${invProg * 8}px)`,
      transition: 'opacity 0.5s ease-out, filter 0.5s ease-out'
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
  const tick = animationTick.value;

  const dx = 250 - (w / 2);
  const dy = (h - 250) - (h / 2);

  if (phase === 'collapse') {
    const localBhX = 250 - contentRect.value.left;
    const localBhY = (h - 250) - contentRect.value.top;

    const speed = 0.15;
    const shift = 1.2;
    const angleX = Math.sin(tick * speed + shift) * prog * 10;
    const angleY = Math.cos(tick * speed * 0.8 + shift) * prog * 10;

    // 흡입 모션 연산
    const suckStart = 0.80;
    const suckProg = prog >= suckStart ? (prog - suckStart) / (1.0 - suckStart) : 0;
    const scaleMult = 1.0 - suckProg;
    const scaleX = (1.0 + Math.sin(tick * speed * 1.2 + shift) * prog * 0.08) * scaleMult;
    const scaleY = (1.0 + Math.cos(tick * speed * 1.1 + shift) * prog * 0.08) * scaleMult;

    const pullX = localBhX * Math.pow(suckProg, 1.8);
    const pullY = localBhY * Math.pow(suckProg, 1.8);
    const translateX = Math.cos(tick * speed * 1.5 + shift) * prog * 12 + pullX;
    const translateY = Math.sin(tick * speed * 1.3 + shift) * prog * 12 + pullY;

    const spiralRotate = suckProg * 90 * (shift % 2 === 0 ? 1 : -1);

    return {
      pointerEvents: 'none' as const,
      transition: 'none',
      '--local-bh-x': `${localBhX}px`,
      '--local-bh-y': `${localBhY}px`,
      transform: `translate3d(${translateX}px, ${translateY}px, 0) rotate(${spiralRotate}deg) skew(${angleX}deg, ${angleY}deg) scale(${scaleX}, ${scaleY})`,
      opacity: 1.0 - suckProg,
      willChange: 'transform, opacity',
    };
  } else if (phase === 'bigbang') {
    return { opacity: 0, filter: 'blur(12px)', pointerEvents: 'none' as const };
  } else if (phase === 'recover') {
    // 제자리에서 페이드인 + 블러 해제 (회전/이동/스케일 삭제)
    const localProg = Math.min(1.0, Math.max(0, (prog - 0.2) / 0.6));
    const invProg = 1.0 - localProg;

    return {
      opacity: localProg,
      filter: `blur(${invProg * 8}px)`,
      transition: 'opacity 0.5s ease-out, filter 0.5s ease-out'
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
  const tick = animationTick.value;

  const dx = 250 - (w - 140);
  const dy = (h - 250) - 250;

  if (phase === 'collapse') {
    const localBhX = 250 - sidebarRect.value.left;
    const localBhY = (h - 250) - sidebarRect.value.top;

    const speed = 0.15;
    const shift = 2.4;
    const angleX = Math.sin(tick * speed + shift) * prog * 10;
    const angleY = Math.cos(tick * speed * 0.8 + shift) * prog * 10;

    // 흡입 모션 연산
    const suckStart = 0.72;
    const suckProg = prog >= suckStart ? (prog - suckStart) / (1.0 - suckStart) : 0;
    const scaleMult = 1.0 - suckProg;
    const scaleX = (1.0 + Math.sin(tick * speed * 1.2 + shift) * prog * 0.08) * scaleMult;
    const scaleY = (1.0 + Math.cos(tick * speed * 1.1 + shift) * prog * 0.08) * scaleMult;

    const pullX = localBhX * Math.pow(suckProg, 1.8);
    const pullY = localBhY * Math.pow(suckProg, 1.8);
    const translateX = Math.cos(tick * speed * 1.5 + shift) * prog * 12 + pullX;
    const translateY = Math.sin(tick * speed * 1.3 + shift) * prog * 12 + pullY;

    const spiralRotate = suckProg * 90 * (shift % 2 === 0 ? 1 : -1);

    return {
      pointerEvents: 'none' as const,
      transition: 'none',
      '--local-bh-x': `${localBhX}px`,
      '--local-bh-y': `${localBhY}px`,
      transform: `translate3d(${translateX}px, ${translateY}px, 0) rotate(${spiralRotate}deg) skew(${angleX}deg, ${angleY}deg) scale(${scaleX}, ${scaleY})`,
      opacity: 1.0 - suckProg,
      willChange: 'transform, opacity',
    };
  } else if (phase === 'bigbang') {
    return { opacity: 0, filter: 'blur(12px)', pointerEvents: 'none' as const };
  } else if (phase === 'recover') {
    // 제자리에서 페이드인 + blur 해제 (회전/이동/스케일 삭제)
    const localProg = Math.min(1.0, Math.max(0, prog / 0.5));
    const invProg = 1.0 - localProg;

    return {
      opacity: localProg,
      filter: `blur(${invProg * 8}px)`,
      transition: 'opacity 0.5s ease-out, filter 0.5s ease-out'
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
  const tick = animationTick.value;

  const dx = 250 - themeRect.value.left;
  const dy = (h - 250) - themeRect.value.top;

  if (phase === 'collapse') {
    const localBhX = 250 - themeRect.value.left;
    const localBhY = (h - 250) - themeRect.value.top;

    const speed = 0.15;
    const shift = 3.6;
    const angleX = Math.sin(tick * speed + shift) * prog * 10;
    const angleY = Math.cos(tick * speed * 0.8 + shift) * prog * 10;

    // 흡입 모션 연산
    const suckStart = 0.65;
    const suckProg = prog >= suckStart ? (prog - suckStart) / (1.0 - suckStart) : 0;
    const scaleMult = 1.0 - suckProg;
    const scaleX = (1.0 + Math.sin(tick * speed * 1.2 + shift) * prog * 0.08) * scaleMult;
    const scaleY = (1.0 + Math.cos(tick * speed * 1.1 + shift) * prog * 0.08) * scaleMult;

    const pullX = localBhX * Math.pow(suckProg, 1.8);
    const pullY = localBhY * Math.pow(suckProg, 1.8);
    const translateX = Math.cos(tick * speed * 1.5 + shift) * prog * 12 + pullX;
    const translateY = Math.sin(tick * speed * 1.3 + shift) * prog * 12 + pullY;

    const spiralRotate = suckProg * 90 * (shift % 2 === 0 ? 1 : -1);

    return {
      pointerEvents: 'none' as const,
      transition: 'none',
      '--local-bh-x': `${localBhX}px`,
      '--local-bh-y': `${localBhY}px`,
      transform: `translate3d(${translateX}px, ${translateY}px, 0) rotate(${spiralRotate}deg) skew(${angleX}deg, ${angleY}deg) scale(${scaleX}, ${scaleY})`,
      opacity: 1.0 - suckProg,
      willChange: 'transform, opacity',
    };
  } else if (phase === 'bigbang') {
    return { opacity: 0, filter: 'blur(12px)', pointerEvents: 'none' as const };
  } else if (phase === 'recover') {
    // 제자리에서 페이드인 + 블러 해제 (회전/이동/스케일 삭제)
    const localProg = Math.min(1.0, Math.max(0, prog / 0.5));
    const invProg = 1.0 - localProg;

    return {
      opacity: localProg,
      filter: `blur(${invProg * 8}px)`,
      transition: 'opacity 0.5s ease-out, filter 0.5s ease-out'
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
const statsTop = computed(() => {
  if (!isMainOpen.value) {
    return '110px';
  }
  const base = 85;
  const itemHeight = 54;
  const gap = 30;
  return `${base + (4 * itemHeight) + gap}px`;
})

const isMobile = computed(() => {
  return windowWidth.value <= 1024;
})

const navWarpStyle = computed(() => {
  if (isMobile.value) {
    return {};
  }
  return {
    transform: `translate(${navPosition.value.x}px, ${navPosition.value.y}px)`
  };
})

const statsWarpStyle = computed(() => {
  if (isMobile.value) {
    return {};
  }
  return {
    transform: `translate(${statsPosition.value.x}px, ${statsPosition.value.y}px)`,
    top: statsTop.value
  };
})

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
  if (path.startsWith('/translate')) return 'Translate';
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


const { position: navPosition, startDrag: startNavDrag, isDragging: navIsDragging } = useDraggable()
const { position: statsPosition, startDrag: startStatsDrag, hasMoved: statsHasMoved, isDragging: statsIsDragging } = useDraggable()

function openStatsModalIfNoDrag() {
  if (!statsHasMoved.value) {
    showStatsModal.value = true
  }
}
const leftRect = ref({ left: 0, top: 0, width: 0, height: 0 })
const contentRect = ref({ left: 0, top: 0, width: 0, height: 0 })
const sidebarRect = ref({ left: 0, top: 0, width: 0, height: 0 })
const themeRect = ref({ left: 0, top: 0, width: 0, height: 0 })

const getActualRect = (selector: string, defaultRect: any) => {
  if (!process.client) return defaultRect
  const parent = document.querySelector(selector)
  if (!parent) return defaultRect
  
  const children = parent.children
  if (children.length === 0) {
    const r = parent.getBoundingClientRect()
    return { left: r.left, top: r.top, width: r.width, height: r.height }
  }
  
  let minLeft = Infinity
  let minTop = Infinity
  let maxRight = -Infinity
  let maxBottom = -Infinity
  let hasValidChild = false
  
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    const rect = child.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      hasValidChild = true
      if (rect.left < minLeft) minLeft = rect.left
      if (rect.top < minTop) minTop = rect.top
      if (rect.right > maxRight) maxRight = rect.right
      if (rect.bottom > maxBottom) maxBottom = rect.bottom
    }
  }
  
  if (!hasValidChild) {
    const r = parent.getBoundingClientRect()
    return { left: r.left, top: r.top, width: r.width, height: r.height }
  }
  
  return {
    left: minLeft,
    top: minTop,
    width: maxRight - minLeft,
    height: maxBottom - minTop
  }
}

const updateRects = () => {
  if (!process.client) return
  leftRect.value = getActualRect('.left-panel-wrapper', { left: 50, top: 150, width: 240, height: 600 })
  contentRect.value = getActualRect('.content', { left: 320, top: 100, width: windowWidth.value - 640, height: windowHeight.value - 200 })
  sidebarRect.value = getActualRect('.sidebar', { left: windowWidth.value - 300, top: 80, width: 250, height: 500 })
  
  const themeEl = document.querySelector('.theme-toggle-btn')
  themeRect.value = themeEl ? themeEl.getBoundingClientRect() : { left: windowWidth.value - 65, top: 20, width: 45, height: 45 }
}

// 테마 상태 및 토글 기능
const isDarkMode = ref(true)

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  const theme = isDarkMode.value ? 'dark' : 'light'
  document.documentElement.setAttribute('data-bs-theme', theme)
  localStorage.setItem('theme', theme)
}

let phaseAnimationFrameId = 0;
const runPhaseLoop = () => {
  updateBlackHolePhase();
  animationTick.value++;
  
  // 붕괴/빅뱅/복구 시에는 패널이 트랜스폼으로 인해 일그러지므로 원본의 안정한 레이아웃 좌표 유지를 위해 갱신 정지
  if (bhPhase.value === 'idle' || bhPhase.value === 'grow') {
    updateRects();
  }
  
  phaseAnimationFrameId = requestAnimationFrame(runPhaseLoop);
};

onMounted(async () => {
  isMounted.value = true;
  await recordHit();
  fetchStats();
  initBlackHoleSetting();
  
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark'
  } else {
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  document.documentElement.setAttribute('data-bs-theme', isDarkMode.value ? 'dark' : 'light')

  if (process.client && isBlackHoleEnabled.value) {
    phaseAnimationFrameId = requestAnimationFrame(runPhaseLoop);
  }
});

watch(isBlackHoleEnabled, (newVal) => {
  if (process.client) {
    if (newVal) {
      cancelAnimationFrame(phaseAnimationFrameId);
      phaseAnimationFrameId = requestAnimationFrame(runPhaseLoop);
    } else {
      cancelAnimationFrame(phaseAnimationFrameId);
      bhPhase.value = 'idle';
      bhProgress.value = 0;
    }
  }
});

watch(bigBangTriggerTime, (newVal) => {
  if (newVal > 0 && process.client) {
    const loopTime = 60000;
    const currentModulo = Date.now() % loopTime;
    let offset = 40000 - currentModulo;
    if (offset < 0) {
      offset += loopTime;
    }
    timeOffset.value += offset;
  }
});

onUnmounted(() => {
  if (process.client) {
    cancelAnimationFrame(phaseAnimationFrameId);
  }
});
</script>

<style scoped>
@import url('@/assets/styles/mini-stats.css');


.container {
  width: 100%;
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
  margin-top: 34px;
  min-height: 1050px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.nav-container {
  position: absolute !important;
  top: 0;
  left: 0;
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



.sidebar {
  width: 280px;
  padding: 20px;
  box-sizing: border-box; /* Ensures padding does not increase the sidebar's width */
  border-radius: 16px;
  position: sticky;
  top: 20px;
  margin-top: 34px;
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

.mini-stats-widget {
  position: absolute !important;
  left: 0;
  width: 100%;
  transition: top 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 반응형 스타일 (CSS 오버라이드를 위해 최하단 배치) */
@media (max-width: 1024px) {
  .container {
    padding: 15px;
  }

  .theme-toggle-btn {
    right: 15px !important;
    top: 15px !important;
  }

  .main-ui-wrapper {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .left-panel-wrapper {
    width: 100%;
    margin-top: 0;
    min-height: auto;
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
    transition: none !important;
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
</style>