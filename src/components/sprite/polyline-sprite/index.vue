<template>
  <polyline stroke="#999" stroke-width="3" fill="none" v-bind="bind" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ICoordinate, type ISprite } from "../../../components/meta-data/types";
const p = defineProps<{
  sprite: ISprite;
}>();

const bind = computed(() => {
  const { boundingBox } = p.sprite;
  const { width, height } = boundingBox;
  const { points } = p.sprite.attrs;
  const pointsStr = points
    .map((m: ICoordinate) => `${m.x * width},${m.y * height}`)
    .join(" ");
  return {
    points: pointsStr,
  };
});
</script>
