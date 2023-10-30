<template>
  <svg
    width="100%"
    height="100%"
    :viewBox="`0 0 ${stage.width} ${stage.height}`"
  >
    <rect
      x="0"
      y="0"
      :width="stage.width"
      :height="stage.height"
      stroke="#398cfe"
      stroke-width="1"
      fill="#ccc"
    ></rect>
    <!-- 精灵树渲染 -->
    <SpriteTree
      :spriteList="spriteList"
      :registerSpriteMetaMap="registerSpriteMetaMap"
    />
  </svg>
</template>



<script setup lang="ts">
import { ISprite, IStage } from "../../meta-data/types";
import SpriteTree from "../sprite-tree.vue"
defineProps<{
    stage: IStage;
    spriteList: ISprite[];
    registerSpriteMetaMap: Record<string, ISprite>;
}>()
</script>
