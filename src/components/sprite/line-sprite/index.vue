<template>
  <line
    :x1="0"
    :y1="0"
    :x2="0"
    :y2="0"
    stroke="#999"
    stroke-width="2"
    v-bind="bind"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { type ISprite } from "../../../components/meta-data/types";
const p = defineProps<{
  sprite: ISprite;
}>();

const bind = computed(() => {
  const { start, end, ...otherBind } = p.sprite.props;
  const { x: x1, y: y1 } = start;
  const { x: x2, y: y2 } = end;
  return {
    x1,
    y1,
    x2,
    y2,
    ...otherBind
  };
});
</script>
