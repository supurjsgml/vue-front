<template>
  <div class="container">
    <!-- 왼쪽 네비게이션 영역 (드래그 가능) -->
    <div 
      class="nav-container"
      ref="navContainer"
      @mousedown="startDrag"
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
        <NuxtLink class="custom-link" to="/google" @mousedown.stop>googleDownLink</NuxtLink>
      </div>
    </div>

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
            <img src="@/assets/styles/img/logo/swaggerLogo.png" alt="Swagger Logo" class="sidebar-logo" />
          </a>
        </li>
        <li>
          <a href="https://chromewebstore.google.com/detail/%EC%9E%A1%EC%BD%94%EB%A6%AC%EC%95%84-%EC%9D%B4%EB%A0%A5%EC%84%9C-%EA%B0%B1%EC%8B%A0/chjbcemdkiommdpeklplkbfpemefejcp" target="_blank">
            <img src="@/assets/styles/img/logo/chromeWebStoreLogo.png" alt="Swagger Logo" class="sidebar-logo" />
          </a>
        </li>
      </ul>
    </aside>

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

function toggleMain(event: Event) {
  event.stopPropagation()
  isMainOpen.value = !isMainOpen.value
}

const navContainer = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const navPosition = ref({ x: 0, y: 0 }) // 드래그 위치

// 드래그 시작
function startDrag(event: MouseEvent) {
  if (!navContainer.value) return
  isDragging.value = true
  dragOffset.value = {
    x: event.clientX - navPosition.value.x,
    y: event.clientY - navPosition.value.y
  }

  document.addEventListener("mousemove", onDrag)
  document.addEventListener("mouseup", stopDrag)
}

// 드래그 중
function onDrag(event: MouseEvent) {
  if (!isDragging.value) return

  // 화면 밖으로 나가지 않도록 제한
  const maxX = window.innerWidth - 200
  const maxY = window.innerHeight - 100
  const minX = 0
  const minY = 0

  navPosition.value.x = Math.min(maxX, Math.max(minX, event.clientX - dragOffset.value.x))
  navPosition.value.y = Math.min(maxY, Math.max(minY, event.clientY - dragOffset.value.y))
}

// 드래그 종료
function stopDrag() {
  isDragging.value = false
  document.removeEventListener("mousemove", onDrag)
  document.removeEventListener("mouseup", stopDrag)
}

// 초기 위치 설정
onMounted(() => {
  // navPosition.value = { x: 20, y: 100 }
})

// 이벤트 정리
onBeforeUnmount(() => {
  document.removeEventListener("mousemove", startDrag)
})
</script>

<style scoped>
.container {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  max-width: 1800px;
  margin: 0 auto;
  padding: 20px;
}

.nav-container {
    position: relative;
    z-index: 10; /* 이미지보다 앞에 위치 */
    width: 180px;
    margin-top: 11rem;
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
    display: inline-block;
    text-align: center;
    font-weight: bold;
    border: 1px solid var(--nav-border);
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

  .nav-container {
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