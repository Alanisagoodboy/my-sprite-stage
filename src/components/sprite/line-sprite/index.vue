<template>
  <line
    stroke="#999"
    stroke-width="2"
    v-bind="bind"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { type ISprite } from "../../../components/meta-data/types";
const props = defineProps<{
  sprite: ISprite;
}>();

const bind = computed(() => {
  const { boundingBox, attrs } = props.sprite
  const {x, y, width, height} = boundingBox
  const { points } = attrs;
  const { x: x1_rate, y: y1_rate } = points[0];
  const { x: x2_rate, y: y2_rate } = points[1];
  return {
    x1: x1_rate * width,
    y1: y1_rate * height,
    x2: x2_rate * width,
    y2: y2_rate * height,
  };
});
</script>
