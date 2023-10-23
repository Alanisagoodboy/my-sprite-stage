<template>
  <svg
    data-sprite-type="stage"
    class="stage-container"
    xmlns="http://www.w3.org/2000/svg"
    :height="height"
    :width="width"
    style="outline: 1px solid #398cfe"
    ref="svgRef"
    :transform="`scale(${scale})`"
    @mousewheel="mousewheel"
  >
    <slot />
  </svg>
</template>
<script setup lang="ts">
import { ref, provide, reactive } from "vue";

defineOptions({
  name: "stage-page",
});

const props = defineProps({
  width: [Number, String],
  height: [Number, String],
  scale: [Number],
});
const emits = defineEmits(["stage-scale"]);

const svgRef = ref<HTMLElement | null>(null);

provide("svgRef", svgRef);
defineExpose({ svgRef });

function mousewheel(e: WheelEvent) {
  const prevScale = props.scale || 0;
  const v = prevScale + (e.deltaY < 0 ? 0.1 : -0.1);
  const _scale = Math.max(Math.min(1.5, v), 0.2);
  emits("stage-scale", _scale);
}
</script>

<style lang="scss" scoped></style>
