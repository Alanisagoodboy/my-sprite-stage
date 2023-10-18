<template>
  <svg
    data-sprite-type="stage"
    class="stage-container"
    xmlns="http://www.w3.org/2000/svg"
    :height="height"
    :width="width"
    style="outline: 1px solid #398cfe"
    ref="svgRef"
  >
    <slot />
  </svg>
</template>
<script setup lang="ts">
import { ref, provide } from "vue";
defineOptions({
  name: "stage-page",
});

defineProps({
  width: [Number, String],
  height: [Number, String],
});
const svgRef = ref<HTMLElement | null>(null);

provide("svgRef", svgRef);
</script>

<style lang="scss" scoped></style>
