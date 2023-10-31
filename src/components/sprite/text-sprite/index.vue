<!-- 文本精灵 -->
<template>
  <g>
    <foreignObject
      :width="sprite.boundingBox.width"
      :height="sprite.boundingBox.height"
    >
      <EditDiv
        @dblclick="handleToEdit"
        ref="editDivRef"
        size-type="fit-content"
        :content="sprite.attrs.content"
        @text-change="handleTextChange"
      />
    </foreignObject>
  </g>
</template>

<script setup lang="ts">
import EditDiv from "./edit-div.vue";
import { ISprite } from "../../meta-data/types";
import { ref } from "vue";
defineOptions({
  name: "text-sprite",
});

const props = defineProps<{
  sprite: ISprite;
}>();

const emits = defineEmits(["updateSprite"]);
const editDivRef = ref<InstanceType<typeof EditDiv>>();
function handleTextChange(info: any) {
  const { width, height, content } = info;
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
      {
        path: "attrs.content",
        value: content,
      },
    ],
  });
}

async function handleToEdit() {
  await editDivRef.value?.changeMode('edit');
}
</script>

<style scoped></style>
