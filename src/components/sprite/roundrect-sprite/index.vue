<!-- 圆角矩形精灵 -->
<template>
  <path
    :d="d"
    stroke="#000"
    fill="#f6f6f6"
    stroke-width="1"
    fill-opacity="0.5"
  />
</template>
<script setup lang="ts">
import { ISprite } from "../../meta-data/types";
import { computed } from "vue";
defineOptions({
  name: "round-rect-sprite",
});

const props = defineProps<{
  sprite: ISprite;
}>();

const d = computed(() => {
  const { width, height } = props.sprite?.boundingBox || {};
  const { borderRadius } = props.sprite?.attrs || {};
  const radius = Math.min(borderRadius, 50);
  const r = height * (radius / 100);
  const _d = `M0,${r}
   A${r},${r} 0 0,1 ${r},0
   L${width - r},0
   A${r},${r} 0 0,1 ${width},${r}
   L${width},${height - r}
   A${r},${r} 0 0,1 ${width - r},${height}
   L${r},${height} 
   A${r},${r} 0 0,1 0,${height - r} 
   Z`;
  return _d;
});
</script>

<style lang="scss" scoped></style>
