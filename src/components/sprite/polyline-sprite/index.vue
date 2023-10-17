<template>
  <polyline
    stroke="#999"
    stroke-width="3"
    fill="none"
    v-bind="bind"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ICoordinate, type ISprite } from "../../../components/meta-data/types";
const p = defineProps<{
  sprite: ISprite;
}>();

const bind = computed(() => {
  const { points, ...otherBind } = p.sprite.attrs;
  const pointsStr = points.map((m: ICoordinate)=> `${m.x},${m.y}`).join(' ')
  return {
    points: pointsStr,
    ...otherBind
  };
});
</script>
