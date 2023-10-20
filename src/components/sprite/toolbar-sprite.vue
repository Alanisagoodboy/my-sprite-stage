<!-- 工具栏 -->
<template>
  <g :transform="transform">
    <foreignObject
      style="overflow: visible"
      :x="0"
      :y="0"
      :height="0"
      :width="0"
    >
      <ul class="toolbar-wrapper">
        <li class="toolbar-item" :key="item" v-for="item of 5">{{ item }}</li>
      </ul> </foreignObject
    >
  </g>
</template>
<script setup lang="ts">
import { getWrapperBoxInfo } from "../../utils";
import { ISprite } from "../meta-data/types";
import { computed } from "vue";
const props = defineProps<{
  // 活跃的精灵列表
  activeSpriteList: ISprite[];
}>();

const transform = computed(() => {
  if (props.activeSpriteList.length === 0) {
    return `translate(${1000} ${-1000})`;
  }
  const { x, y } = getWrapperBoxInfo(
    props.activeSpriteList.map((m) => m.boundingBox)
  );
  const _y = y - 60;
  return `translate(${x} ${_y})`;
});
</script>

<style scoped>
.toolbar-wrapper {
  user-select: none;

  --duration: 1s;
  --transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);

  display: flex;
  align-items: center;

  width: fit-content;
  /* height: fit-content; */

  padding: 6px;
  border: 1px solid rgba(239, 240, 240, 0.9);
  /* border: 1px solid #ccc; */
  box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.08),
    0 2px 6px 0 rgba(0, 0, 0, 0.04), 0 4px 8px 1px rgba(0, 0, 0, 0.02);
  background-color: #fff;
  border-radius: 8px;
}

.toolbar-item {
  height: 30px;
  width: 30px;
  text-align: center;
  line-height: 30px;
  list-style: none;
  transition: all var(--duration) var(--transition-timing-function);
}
.toolbar-item:hover {
  background-color: #e7e9e8;
}
</style>
