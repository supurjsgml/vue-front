<template>  
  <iframe  
    v-if="iframeSrc"  
    :src="iframeSrc"  
    width="100%"  
    height="1500"  
    frameborder="0"  
  />
  <div v-else>Loading Grafana dashboard...</div>
</template>  

<script setup lang="ts">  
const { data: iframeSrc } = useFetch('/api/grafana/iframe-src');
</script>  

<style scoped>  
</style> 