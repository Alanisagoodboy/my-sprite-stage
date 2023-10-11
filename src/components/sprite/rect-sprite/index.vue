<template>
    <rect v-bind="bind" fill="#398cfe" stroke-width="3"><slot /></rect>
</template>
<script setup lang="ts">
import { ISprite } from "../../meta-data/types";
import { computed } from "vue";
defineOptions({
  name: "rect-sprite",
});

const props = defineProps<{
  sprite: ISprite;
}>();

const bind = computed(() => {  
  const { angle: rotate, coordinate, size } = props.sprite?.attrs || {};
  const { x, y } = coordinate;
  const { width, height } = size;
  const centerPoint = {
    x: x + width / 2,
    y: y + height / 2,
  };
  return {
    x:0,
    y:0,
    width,
    height,
    // transform: `rotate(${rotate} ${centerPoint.x} ${centerPoint.y})`,
  };
});
</script>

<style lang="scss" scoped></style>
