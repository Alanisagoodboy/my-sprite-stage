<!-- 文本精灵 -->
<template>
  <g>
    <EditDiv
      :width="sprite.boundingBox.width"
      :height="sprite.boundingBox.height"
      :content="sprite.attrs.content"
      @text-change="handleTextChange"
      @size-change="handleSizeChange"
    />
  </g>
</template>

<script setup lang="ts">
import EditDiv from "./edit-div.vue";
import { ISprite } from "../../meta-data/types";
defineOptions({
  name: "text-sprite",
});

const props = defineProps<{
  sprite: ISprite;
}>();

const emits = defineEmits(["updateSprite"]);

function handleTextChange(content: any) {
  emits("updateSprite", {
    id: props.sprite.id,
    stateSet: [
      {
        path: "attrs.content",
        value: content,
      },
    ],
  });
}
function handleSizeChange(info: any) {
  const { width, height } = info;
  emits("updateSprite", {
    id: props.sprite.id,
    stateSet: [
      {
        path: "boundingBox.width",
        value: width,
      },
      {
        path: "boundingBox.height",
        value: height,
      },
    ],
  });
}
</script>

<style scoped></style>
