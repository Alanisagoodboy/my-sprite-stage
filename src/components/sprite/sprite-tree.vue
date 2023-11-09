<!-- 精灵渲染器 -->
<template>
  <SpriteContainer
    v-for="sprite of spriteList"
    :sprite="sprite"
    :key="sprite.id"
  >
    <template v-if="sprite.children && sprite.children.length > 0">
      <g class="g">
        <rect
          class="rect"
          :width="sprite.boundingBox.width"
          :height="sprite.boundingBox.height"
          fill="transparent"
        ></rect>
        <sprite-tree
          :stage="stage"
          :spriteList="sprite.children"
          :registerSpriteMetaMap="registerSpriteMetaMap"
          @updateSprite="updateSprite"
        ></sprite-tree>
      </g>
    </template>
    <template v-else>
      <component
        :is="registerSpriteMetaMap[sprite.type].component"
        :sprite="sprite"
        :stage="stage"
        @updateSprite="updateSprite"
      ></component>
    </template>
  </SpriteContainer>
</template>

<script setup lang="ts">
import { ISprite, IStage } from "../meta-data/types";
import SpriteContainer from "./sprite-container.vue";

defineOptions({
  name: "sprite-tree",
});

const props = defineProps<{
  stage: IStage;
  spriteList: ISprite[];
  registerSpriteMetaMap: any;
}>();

const emits = defineEmits(["updateSprite"]);

function updateSprite(...arg: any[]) {
  emits("updateSprite", ...arg);
}
</script>

<style scoped>
.g:hover > .rect {
  stroke: rgba(57, 140, 254, 0.5);
  stroke-width: 1px;
}
</style>
