<template>
  <!-- <line
    v-for="(line, index) of lineList"
    :key="index"
    v-bind="line"
    stroke="#0067ed"
    strokeDasharray="4 4"
  ></line> -->
</template>

<script setup lang="ts">
defineProps<{
  lineList: Array<Record<string, any>>;
}>();
</script>
