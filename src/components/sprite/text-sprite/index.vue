<!-- 文本精灵 -->
<template>
  <g>
    <foreignObject
      style="overflow: visible"
      :width="sprite.boundingBox.width"
      :height="sprite.boundingBox.height"
    >
      <EditDiv
        :style="contentStyle"
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

import { ref, onMounted, watch, computed } from "vue";

defineOptions({
  name: "text-sprite",
});

const props = defineProps<{
  sprite: ISprite;
  stage: ISprite;
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

// 文本内容的属性绑定
const contentStyle = computed(() => {
  const { contentFontSize, contentColor, justifyContent, alignItems } =
    props.sprite.attrs;
  return {
    fontSize: contentFontSize + "px",
    color: contentColor,
    "justify-content": justifyContent || "center",
    "align-items": alignItems || "center",
  };
});

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
        value: info.width / props.stage.attrs.scale,
      },
      {
        path: "boundingBox.height",
        value: info.height / props.stage.attrs.scale,
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
