<template>
  <Camel></Camel>
</template>

<script setup lang="ts">
import { getStore } from "~/stores/get";

const store = getStore();

onMounted(() => {
  //잠자고있는 API서버를 깨우기
  store.getAlive();
})

</script>
