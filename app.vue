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
    </div>
    <!-- 콘텐츠 영역 -->
    <div class="content">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
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
  justify-content: flex-start;
  max-width: 1800px;
  margin: 0 auto;
  padding: 20px;
}

.nav-container {
  width: 160px;
  margin-top: 11rem;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background-color: #2c3e50; /* 네비게이션 항목 배경색 */
  border-radius: 8px; /* 둥근 모서리 */
  margin-bottom: 10px; /* 항목 간 간격 */
}

.icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
  cursor: pointer;
  color: #fff; /* 아이콘 색상 */
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
  text-decoration: none; /* 밑줄 제거 */
  color: #fff; /* 링크 글자 색상 */
  padding: 10px 15px;
  background-color: #3498db; /* 링크 배경색 */
  border-radius: 8px; /* 둥근 모서리 */
  transition: background-color 0.3s ease, color 0.3s ease;
  display: inline-block; /* 링크를 버튼처럼 보이게 */
}

.custom-link:hover {
  background-color: #2980b9; /* hover 시 배경색 변경 */
  color: #fff; /* hover 시 글자색 변경 */
}

.sub-menu .custom-link {
  background-color: #34495e; /* 서브 메뉴 링크 배경색 */
}

.sub-menu .custom-link:hover {
  background-color: #2c3e50; /* 서브 메뉴 hover 시 배경색 */
}
.content {
  flex: 1;
  margin-left: 20px;
  max-width: calc(100% - 200px);
}
</style>
