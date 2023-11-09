<!-- 文本精灵 -->
<template>
  <g>
    <foreignObject
      style="overflow: visible"
      :width="sprite.boundingBox.width"
      :height="sprite.boundingBox.height"
    >
      <EditDiv
        ref="editDivRef"
        :content="sprite.attrs.content"
        size-type="fit-content"
        @text-change="handleTextChange"
        @size-change="handleSizeChange"
      />
    </foreignObject>
  </g>
</template>

<script setup lang="ts">
import EditDiv from "../../common/edit-div.vue";
import { ISprite, IStage } from "../../meta-data/types";

import { ref, onMounted, watch } from "vue";

defineOptions({
  name: "text-sprite",
});

const props = defineProps<{
  sprite: ISprite;
  stage: IStage
}>();
const emits = defineEmits(["updateSprite"]);
const editDivRef = ref<InstanceType<typeof EditDiv> | null>(null);

watch(
  () => props.sprite.mode,
  (val) => {
    if (val === "edit") {
      editDivRef.value!.changeMode(true);
    }
  }
);

function handleTextChange(info: any) {
  emits("updateSprite", {
    id: props.sprite.id,
    stateSet: [
      {
        path: "attrs.content",
        value: info.content,
      },
      {
        path: "mode",
        value: info.contenteditable ? "edit" : "default",
      },
    ],
  });
}

function handleSizeChange(info: any) {
  console.log(info, "dasdasd "); 
  emits("updateSprite", {
    id: props.sprite.id,
    stateSet: [
      {
        path: "boundingBox.width",
        value: info.width / props.stage.scale,
      },
      {
        path: "boundingBox.height",
        value: info.height / props.stage.scale,
      },
      {
        path: "mode",
        value: info.contenteditable ? "edit" : "default",
      },
    ],
  });
}

onMounted(() => {
  // nextTick(()=> {
  //   editDivRef.value!.changeMode(true);
  // })
});
</script>

<style scoped></style>
