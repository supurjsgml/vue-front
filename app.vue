<template>
  <div class="container">
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

    <StatisticsPanel v-if="showStatsModal" @close="showStatsModal = false" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useHead } from '#imports'
import { ChevronRightIcon } from '@heroicons/vue/24/solid'

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
</script>

<style scoped>
@import url('@/assets/styles/mini-stats.css');

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
</style>