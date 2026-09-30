<template>
  <div class="container" :style="containerStyle">
    <!-- 배경 그리드 및 파편 시뮬레이션 컴포넌트 -->
    <WidgetBackgroundGrid 
      v-if="isBlackHoleEnabled && bhVersion === 'b1'"
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
      :isIdle="isIdle"
      :isCaged="isDogCaged"
    />

    <!-- 자율 주행 3D 동물 펫 위젯 -->
    <WidgetGlobalPet3D 
      :bhPhase="bhPhase" 
      :bhProgress="bhProgress" 
      :isIdle="isIdle"
    />

    <div class="main-ui-wrapper" :style="containerWarpStyle">
      <!-- 왼쪽 패널 그룹 -->
      <div class="left-panel-wrapper" :style="leftPanelWarpStyle">
      <!-- 메인 네비게이션 영역 (공통 컴포넌트) -->
      <NavigationMenu 
        :is-dragging="navIsDragging"
        :warp-style="navWarpStyle"
        @start-drag="startNavDrag"
      />

      </div> <!-- End of left-panel-wrapper -->

    <!-- 콘텐츠 영역 -->
    <div class="content" :style="contentWarpStyle">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>

    <!-- 오른쪽 홍보 링크 및 주간 방문자 패널 그룹 -->
    <div class="right-panel-wrapper" :style="sidebarWarpStyle">
      <!-- 상단 홍보 및 외부 서비스 링크 사이드바 -->
      <PromoSidebar />

      <!-- 주간 방문자 차트 미니 위젯 -->
      <MiniStatsWidget @open-modal="showStatsModal = true" />
    </div>

    </div>

    <!-- 우측 상단 퀵 토글 버튼 그룹 (1레벨 호버 전개) -->
    <QuickToggleGroup :keep-open="showAmbientSettings" :warp-style="themeWarpStyle">
      <!-- 테마 토글 버튼 -->
      <button class="theme-toggle-btn" @click="toggleTheme" title="테마 변경">
        <SunIcon v-if="isDarkMode" class="theme-icon" />
        <MoonIcon v-else class="theme-icon" />
      </button>

      <!-- 견희 우리 가두기 토글 버튼 -->
      <button 
        type="button" 
        class="dog-cage-toggle-btn" 
        :class="{ 'is-caged': isDogCaged }" 
        @click="toggleDogCage" 
        :title="isDogCaged ? '풀어주기' : '구속'"
      >
        <img src="/dog.jpg" alt="견희" class="dog-btn-avatar" />
        <div v-if="isDogCaged" class="cage-bars-mini">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      <!-- 블랙홀 버전 토글 버튼 -->
      <button 
        class="bh-version-toggle-btn" 
        @click="toggleBlackHoleVersion" 
        :title="`블랙홀 버전 변경 ${bhVersion.toUpperCase()}`"
      >
        <span class="bh-version-text">{{ bhVersion.toUpperCase() }}</span>
      </button>

      <!-- 우주 감상 및 투명도 컨트롤 버튼 -->
      <div class="ambient-control-wrapper">
        <button 
          type="button"
          class="ambient-control-btn" 
          @click.stop="toggleAmbientSettings" 
          :class="{ active: showAmbientSettings, 'zen-active': isIdle }"
          title="우주 감상 및 UI 투명도 설정"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ambient-icon">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
          </svg>
        </button>

        <!-- 팝오버 설정 패널 -->
        <div v-if="showAmbientSettings" class="ambient-popover" @click.stop>
          <div class="ambient-popover-header">
            <div class="ambient-header-left">
              <span class="ambient-popover-title">컴포넌트 투명도 설정</span>
            </div>
            <button type="button" class="ambient-close-btn" @click="showAmbientSettings = false">×</button>
          </div>

          <div class="ambient-item">
            <div class="ambient-label-row">
              <span>UI 투명도</span>
              <span class="ambient-val-badge">{{ uiOpacity }}%</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="100" 
              step="5" 
              v-model.number="uiOpacity" 
              @input="updateOpacity(uiOpacity)"
              class="ambient-slider" 
            />
            <div class="ambient-slider-hint">
              <span>투명 우주 뷰</span>
              <span>선명 작업 뷰</span>
            </div>
          </div>

          <div class="ambient-divider"></div>

          <div class="ambient-item">
            <div class="ambient-label-row">
              <span>투과 글래스 뷰</span>
              <label class="ambient-toggle-switch">
                <input type="checkbox" :checked="isClearGlass" @change="toggleClearGlass" />
                <span class="ambient-switch-track"></span>
              </label>
            </div>
            <p class="ambient-desc-text">블러를 끄고 배경 별빛이 맑게 투과되도록 합니다.</p>
          </div>

          <div class="ambient-divider"></div>

          <div class="ambient-item">
            <div class="ambient-label-row">
              <span>유휴 시간 자동 감상</span>
              <label class="ambient-toggle-switch">
                <input type="checkbox" :checked="isIdleModeEnabled" @change="toggleIdleMode" />
                <span class="ambient-switch-track"></span>
              </label>
            </div>
            <p class="ambient-desc-text">입력이 없으면 화면이 사라져 우주를 감상합니다.</p>
            <div v-if="isIdleModeEnabled" class="ambient-time-chips">
              <button 
                type="button" 
                v-for="sec in [5, 10, 30, 60]" 
                :key="sec" 
                class="ambient-chip" 
                :class="{ active: idleTimeoutSeconds === sec }"
                @click="setIdleSeconds(sec)"
              >
                {{ sec >= 60 ? '1분' : `${sec}초` }}
              </button>
            </div>
          </div>

        </div>
      </div>
    </QuickToggleGroup>

    <StatisticsPanel v-if="showStatsModal" @close="showStatsModal = false" />
    <div class="big-bang-overlay" :style="bigBangOverlayStyle"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useHead, useRoute } from '#imports'
import { SunIcon, MoonIcon } from '@heroicons/vue/24/solid'
import NavigationMenu from '~/components/nav/NavigationMenu.vue'
import PromoSidebar from '~/components/sidebar/PromoSidebar.vue'
import MiniStatsWidget from '~/components/widget/MiniStatsWidget.vue'
import QuickToggleGroup from '~/components/button/QuickToggleGroup.vue'
import { getAPI } from '~/api/get'

const { isBlackHoleEnabled, isActionEnabled, bigBangTriggerTime, timeOffset, bhVersion, toggleBlackHoleVersion, initBlackHoleSetting } = useBlackHole()
const route = useRoute()

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
  if (!isActionEnabled.value) {
    bhPhase.value = 'grow';
    bhProgress.value = 0.5;
    return;
  }
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

// 우주 감상 및 투명도 조절 상태 관리
const uiOpacity = ref(100);
const isIdle = ref(false);
const isIdleModeEnabled = ref(true);
const idleTimeoutSeconds = ref(10);
const showAmbientSettings = ref(false);
let idleTimer: any = null;

// 투과 글래스 뷰 (다운로드 버튼 스타일 투과 vs 이전 블러 글래스)
const isClearGlass = ref(true);

const applyClearGlassMode = (enabled: boolean) => {
  if (!process.client) return;
  document.documentElement.setAttribute('data-glass-mode', enabled ? 'clear' : 'blur');
  document.documentElement.classList.toggle('clear-glass-mode', enabled);
};

const toggleClearGlass = () => {
  isClearGlass.value = !isClearGlass.value;
  if (process.client) {
    localStorage.setItem('ambient_clear_glass', String(isClearGlass.value));
  }
  applyClearGlassMode(isClearGlass.value);
};

const initAmbientSettings = () => {
  if (!process.client) return;
  const savedOpacity = localStorage.getItem('ambient_ui_opacity');
  if (savedOpacity !== null) {
    uiOpacity.value = Math.max(10, Math.min(100, parseInt(savedOpacity, 10)));
  }
  const savedIdleEnabled = localStorage.getItem('ambient_idle_enabled');
  if (savedIdleEnabled !== null) {
    isIdleModeEnabled.value = savedIdleEnabled === 'true';
  }
  const savedIdleTime = localStorage.getItem('ambient_idle_seconds');
  if (savedIdleTime !== null) {
    idleTimeoutSeconds.value = parseInt(savedIdleTime, 10) || 10;
  }
  const savedClearGlass = localStorage.getItem('ambient_clear_glass');
  if (savedClearGlass !== null) {
    isClearGlass.value = savedClearGlass === 'true';
  } else {
    isClearGlass.value = true;
  }
  applyClearGlassMode(isClearGlass.value);
};

const resetIdleTimer = () => {
  if (isIdle.value) {
    isIdle.value = false;
  }
  if (idleTimer) {
    clearTimeout(idleTimer);
    idleTimer = null;
  }
  if (route.path.startsWith('/grafana')) return;
  if (!isIdleModeEnabled.value) return;

  idleTimer = setTimeout(() => {
    isIdle.value = true;
    showAmbientSettings.value = false;
  }, idleTimeoutSeconds.value * 1000);
};

const toggleAmbientSettings = () => {
  showAmbientSettings.value = !showAmbientSettings.value;
};

const updateOpacity = (val: number) => {
  uiOpacity.value = val;
  if (process.client) {
    localStorage.setItem('ambient_ui_opacity', String(val));
  }
};

const toggleIdleMode = () => {
  isIdleModeEnabled.value = !isIdleModeEnabled.value;
  if (process.client) {
    localStorage.setItem('ambient_idle_enabled', String(isIdleModeEnabled.value));
  }
  resetIdleTimer();
};

const setIdleSeconds = (sec: number) => {
  idleTimeoutSeconds.value = sec;
  if (process.client) {
    localStorage.setItem('ambient_idle_seconds', String(sec));
  }
  resetIdleTimer();
};

const handleWindowClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (showAmbientSettings.value && !target.closest('.ambient-control-wrapper')) {
    showAmbientSettings.value = false;
  }
};

// 견희 우리(케이지) 상태 관리
const isDogCaged = ref(false);

const toggleDogCage = () => {
  isDogCaged.value = !isDogCaged.value;
  if (process.client) {
    localStorage.setItem('is_dog_caged', String(isDogCaged.value));
  }
};

const containerWarpStyle = computed(() => {
  if (isIdle.value) {
    return {
      opacity: 0,
      pointerEvents: 'none' as const,
      transform: 'scale(0.98)',
      transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
    };
  }
  return {
    opacity: uiOpacity.value / 100,
    transition: 'opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  };
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

const showStatsModal = ref(false)

const getPageNameByPath = (path: string): string => {
  if (path === '/') return 'Main';
  if (path.startsWith('/camel')) return 'Camel';
  if (path.startsWith('/translate')) return 'Translate';
  if (path.startsWith('/diff')) return 'Diff';
  if (path.startsWith('/jasypt')) return 'Jasypt';
  if (path.startsWith('/grafana')) return 'Grafana';
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

// SPA 라우트 이동 감지하여 페이지뷰 기록 및 그라파나 유휴 타이머 제어
watch(() => route.path, (newPath) => {
  recordHit();
  if (newPath.startsWith('/grafana')) {
    isIdle.value = false;
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
  } else {
    resetIdleTimer();
  }
})

const { position: navPosition, startDrag: startNavDrag, isDragging: navIsDragging } = useDraggable()

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
  sidebarRect.value = getActualRect('.right-panel-wrapper', { left: windowWidth.value - 300, top: 80, width: 280, height: 600 })
  
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
  initBlackHoleSetting();
  
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark'
  } else {
    isDarkMode.value = true
  }
  document.documentElement.setAttribute('data-bs-theme', isDarkMode.value ? 'dark' : 'light')

  if (process.client && isBlackHoleEnabled.value) {
    phaseAnimationFrameId = requestAnimationFrame(runPhaseLoop);
  }

  if (process.client) {
    initAmbientSettings();
    const savedDogCaged = localStorage.getItem('is_dog_caged');
    if (savedDogCaged !== null) {
      isDogCaged.value = savedDogCaged === 'true';
    }
    window.addEventListener('mousemove', resetIdleTimer, { passive: true });
    window.addEventListener('keydown', resetIdleTimer, { passive: true });
    window.addEventListener('mousedown', resetIdleTimer, { passive: true });
    window.addEventListener('touchstart', resetIdleTimer, { passive: true });
    window.addEventListener('click', handleWindowClick);
    resetIdleTimer();
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

watch(isActionEnabled, (newVal) => {
  if (process.client) {
    if (!newVal) {
      bhPhase.value = 'grow';
      bhProgress.value = 0.5;
    } else {
      const loopTime = 60000;
      const currentModulo = Date.now() % loopTime;
      let offset = 0 - currentModulo;
      if (offset < 0) {
        offset += loopTime;
      }
      timeOffset.value = offset;
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
    timeOffset.value = offset;
  }
});

onUnmounted(() => {
  if (process.client) {
    cancelAnimationFrame(phaseAnimationFrameId);
    if (idleTimer) clearTimeout(idleTimer);
    window.removeEventListener('mousemove', resetIdleTimer);
    window.removeEventListener('keydown', resetIdleTimer);
    window.removeEventListener('mousedown', resetIdleTimer);
    window.removeEventListener('touchstart', resetIdleTimer);
    window.removeEventListener('click', handleWindowClick);
  }
});
</script>

<style scoped src="@/assets/styles/main.css"></style>