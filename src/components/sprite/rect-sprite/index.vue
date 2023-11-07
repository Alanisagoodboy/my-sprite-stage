<!-- 矩形精灵 -->
<template>
  <g>
    <rect v-bind="rectBind"><slot /></rect>
    <foreignObject v-bind="foBind">
      <div class="content-wrapper">
        <EditDiv
          ref="editDivRef"
          :style="contentStyle"
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
import { computed, ref} from "vue";

import useHandleTextChange from "../../../hooks/useHandleTextChange.ts";

import EditDiv from "../../common/edit-div.vue";
defineOptions({
  name: "rect-sprite",
});

const props = defineProps<{
  sprite: ISprite;
}>();
const emits = defineEmits(["updateSprite"]);
const editDivRef = ref<InstanceType<typeof EditDiv> | null>(null);
const { handleTextChange } = useHandleTextChange(props, emits, editDivRef);

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
