<template>
  <div class="container">
    <!-- 왼쪽 네비게이션 영역 -->
    <div class="nav-container">
      <div class="nav-item" @click="toggleMain">
        <!-- NuxtLink를 버튼 스타일로 꾸밉니다 -->
        <NuxtLink class="custom-link" to="/" @click="() => isMainOpen = false">main</NuxtLink>
        <ChevronRightIcon @click="toggleMain" :class="{ rotated: isMainOpen }" class="icon" />
      </div>
      <div class="sub-menu" v-if="isMainOpen">
        <NuxtLink class="custom-link" to="/camel">camel</NuxtLink>
      </div>
      <div class="sub-menu" v-if="isMainOpen">
        <NuxtLink class="custom-link" to="/google">googleDownLink</NuxtLink>
      </div>
      <div class="sub-menu" v-if="isMainOpen">
        <!-- <a class="custom-link" target="_blank" :href="useRuntimeConfig().public.restApi">redoc swagger</a> -->
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

.sub-menu .custom-link {
  /* background-color: #34495e; 서브 메뉴 링크 배경색 */
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