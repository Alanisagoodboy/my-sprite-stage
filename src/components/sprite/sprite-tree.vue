<!-- 精灵渲染器 -->
<template>
  <SpriteContainer
    v-for="sprite of spriteList"
    :sprite="sprite"
    :key="sprite.id"
  >
    <template v-if="sprite.children && sprite.children.length > 0">
      <sprite-tree
        :spriteList="sprite.children"
        :registerSpriteMetaMap="registerSpriteMetaMap"
      ></sprite-tree>
    </template>
    <template v-else>
      <component
        :is="registerSpriteMetaMap[sprite.type].component"
        :sprite="sprite"
      ></component>
    </template>
  </SpriteContainer>
</template>

<script setup lang="ts">
import { ISprite } from "../meta-data/types";
import SpriteContainer from "./sprite-container.vue";

defineOptions({
  name: "sprite-tree",
});

defineProps<{
  spriteList: ISprite[];
  registerSpriteMetaMap: any;
}>();
</script>
