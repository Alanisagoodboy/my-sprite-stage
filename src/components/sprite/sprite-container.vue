<template>
  <g
    :data-sprite-id="sprite.id"
    class="sprite-container"
    :transform="transform"
  >
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
  const { x, y, height, width } = props.sprite?.boundingBox || {};
  const centerPoint = {
    x: x + width / 2,
    y: y + height / 2,
  };
  const rotateStr = `rotate(${0},${centerPoint.x} ${centerPoint.y})`;
  const translateStr = `translate(${x},${y})`;
  return `${rotateStr} ${translateStr}`;
});
</script>

<style lang="scss" scoped></style>
