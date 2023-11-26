<template>
  <defs v-if="computedGradient">
    <linearGradient v-bind="computedGradient.linearGradient">
      <stop
        v-for="(item, index) of computedGradient.stopList"
        :key="index"
        :offset="item.offset"
        :stop-color="item.stopColor"
        :stop-opacity="item.stopOpacity"
      />
    </linearGradient>
  </defs>
</template>

<script setup lang="ts">
defineProps<{
  computedGradient: any/*  {
    originColor: string;
    linearGradient: {
      id: string;
      x1: string;
      y1: string;
      x2: string;
      y2: string;
    };
    stopList: {
      offset: string;
      stopColor: string;
      stopOpacity: number;
    }[];
  } | null */;
}>();
</script>
