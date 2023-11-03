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
          :spriteList="sprite.children"
          :registerSpriteMetaMap="registerSpriteMetaMap"
          :mode="mode"
          @updateSprite="updateSprite"
        ></sprite-tree>
      </g>
    </template>
    <template v-else>
      <component
        :is="registerSpriteMetaMap[sprite.type].component"
        :sprite="sprite"
        :mode="mode"
        @updateSprite="updateSprite"
      ></component>
    </template>
  </SpriteContainer>
</template>

<script setup lang="ts">
import { IMode } from "../../types";
import { ISprite } from "../meta-data/types";
import SpriteContainer from "./sprite-container.vue";

defineOptions({
  name: "sprite-tree",
});

defineProps<{
  spriteList: ISprite[];
  mode:IMode;
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
