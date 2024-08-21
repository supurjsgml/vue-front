<template>
  <div class="container">
    <!-- 왼쪽 광고 영역 -->
    <div class="ad-container">
      <ins class="adsbygoogle"
           style="display:inline-block;width:160px;height:600px;"
           data-ad-client="ca-pub-3254218470937690"
           data-ad-slot="1234567890"
           data-ad-format="auto"></ins>
    </div>

    <!-- 콘텐츠 영역 -->
    <!-- <div class="content">
      <NuxtLink to="/">main</NuxtLink>
      >
      <NuxtLink to="/camel">camel</NuxtLink>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
  </div> -->
</template>

<script lang="ts" setup>
import { useHead } from '#imports'

useHead({
  title: '카멜따리 ~',
  script: [
    {
      async: true,
      src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3254218470937690',
      crossorigin: 'anonymous'
    }
  ]
})

onMounted(() => {
  // Google AdSense 초기화
  (window.adsbygoogle = window.adsbygoogle || []).push({});
})
</script>

<style scoped>
.container {
  display: flex;
  align-items: center; /* 세로 중앙 정렬 */
  justify-content: center; /* 수평 중앙 정렬 */
  max-width: 1800px; /* 최대 너비 설정 */
  margin: 0 auto; /* 자동 좌우 마진으로 중앙 정렬 */
  padding: 0 20px; /* 좌우 패딩 */
}

.ad-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 160px; /* 광고의 너비와 동일 */
  height: 100%;
}

.adsbygoogle {
  display: inline-block;
  width: 160px; /* 광고의 너비 */
  height: 600px; /* 광고의 높이 */
}

.content {
  flex: 1; /* 나머지 공간을 차지 */
  margin-left: 20px; /* 광고와 콘텐츠 사이 간격 */
  max-width: calc(100% - 200px); /* 전체 너비에서 광고와 간격을 뺀 값 */
}
</style>