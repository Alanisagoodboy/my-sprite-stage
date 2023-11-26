<template>
  <svg
    width="100%"
    height="100%"
    :viewBox="`0 0 ${stage.attrs.width} ${stage.attrs.height}`"
  >
    <rect
      x="0"
      y="0"
      :width="stage.attrs.width"
      :height="stage.attrs.height"
      stroke="#398cfe"
      stroke-width="1"
      :fill="stage.attrs.backgroundColor"
    ></rect>
    <!-- 精灵树渲染 -->
    <SpriteTree
      :stage="stage"
      :spriteList="spriteList"
      :registerSpriteMetaMap="registerSpriteMetaMap"
    />
  </svg>
</template>

<script setup lang="ts">
import { ISprite} from "../../meta-data/types";
import SpriteTree from "../sprite-tree.vue";
defineProps<{
  stage: ISprite;
  spriteList: ISprite[];
  registerSpriteMetaMap: Record<string, ISprite>;
}>();
</script>
