<template>
  <g
    :data-sprite-id="sprite.id"
    class="sprite-container"
    :transform="transform"
  >
    <text>{{ sprite.id.slice(-5, 0) }}</text>
    <slot></slot>
  </g>
</template>
<script setup lang="ts">
import { ISprite } from "../meta-data/types";
import { computed } from "vue";
defineOptions({
  name: "sprite-container",
});

const props = defineProps<{
  sprite: ISprite;
}>();

const transform = computed(() => {
  const { angle, coordinate, size } = props.sprite?.attrs || {};
  const { x, y } = coordinate;
  const { width, height } = size;
  const centerPoint = {
    x: x + width / 2,
    y: y + height / 2,
  };
  const rotateStr = `rotate(${angle || 0}, ${centerPoint.x} ${centerPoint.y})`;
  const translateStr = `translate(${x},${y})`;
  return `${angle === 0 ? "" : rotateStr} ${translateStr}`;
});
</script>

<style lang="scss" scoped></style>
