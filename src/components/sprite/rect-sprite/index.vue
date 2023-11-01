<!-- 矩形精灵 -->
<template>
  <g>
    <rect v-bind="rectBind"><slot /></rect>
    <foreignObject v-bind="foBind">
      <div class="content-wrapper">
        <EditDiv
          :style="contentStyle"
          ref="editDivRef"
          :content="sprite.attrs.content"
          size-type="auto"
          @text-change="handleTextChange"
        />
      </div>
    </foreignObject>
  </g>
</template>
<script setup lang="ts">
import { ISprite } from "../../meta-data/types";
import { computed, ref } from "vue";

import EditDiv from "../text-sprite/edit-div.vue";
defineOptions({
  name: "rect-sprite",
});

const props = defineProps<{
  sprite: ISprite;
}>();
const emits = defineEmits(["updateSprite"]);
const editDivRef = ref<InstanceType<typeof EditDiv>>();
// 进入文本编辑模式
function toEdit() {
  editDivRef.value?.changeMode("edit");
}

function handleTextChange(info: any) {
  emits("updateSprite", {
    id: props.sprite.id,
    stateSet: [
      {
        path: "attrs.content",
        value: info.content,
      },
    ],
  });
}

const foBind = computed(() => {
  const { width, height } = props.sprite?.boundingBox;
  return {
    width,
    height,
  };
});

const rectBind = computed(() => {
  const { /*  x, y, */ width, height } = props.sprite?.boundingBox;
  // const centerPoint = {
  //   x: x + width / 2,
  //   y: y + height / 2,
  // };
  const { fill, stroke, strokeWidth } = props.sprite.attrs;
  return {
    width,
    height,
    fill,
    stroke,
    "stroke-width": strokeWidth,
    // transform: `rotate(${rotate} ${centerPoint.x} ${centerPoint.y})`,
  };
});

const contentStyle = computed(() => {
  const { contentFontSize, contentColor } = props.sprite.attrs;
  return {
    fontSize: contentFontSize + "px",
    color: contentColor,
  };
});
</script>

<style scoped>
.content-wrapper {
  height: 100%;
  width: 100%;

  line-height: 1;
  text-align: center;
}
</style>
