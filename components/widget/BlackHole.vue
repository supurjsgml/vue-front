<template>
  <WidgetBlackHoleV1 v-if="bhVersion === 'b1'" />
  <WidgetBlackHoleV2 v-else />
</template>

<script setup lang="ts">
import { useBlackHole } from '~/composables/commonUtils';

const { bhVersion } = useBlackHole();
</script>
