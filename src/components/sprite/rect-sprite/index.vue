<!-- 矩形精灵 -->
<template>
  <g>
    <rect v-bind="rectBind"><slot /></rect>
    <foreignObject v-bind="foBind">
      <div class="content-wrapper" :style="contentStyle">
        <EditDiv
          ref="editDivRef"
          :content="sprite.attrs.content"
          size-type="auto"
          @text-change="handleTextChange"
        />
      </div>
    </foreignObject>

    <!-- 定义单组线性渐变 -->
    <DefsSvgLinearGradient :computed-gradient="computedGradient" />
  </g>
</template>
<script setup lang="ts">
import { ISprite } from "../../meta-data/types";
import { computed, ref } from "vue";
import DefsSvgLinearGradient from "@/components/common/defs-svg-linear-gradient.vue";

import useHandleTextChange from "../../../hooks/useHandleTextChange.ts";
import useComputedGradient from "@/hooks/useComputedGradient";

import EditDiv from "../../common/edit-div.vue";
defineOptions({
  name: "rect-sprite",
});

const props = defineProps<{
  sprite: ISprite;
}>();
const emits = defineEmits(["updateSprite"]);
const { computedGradient } = useComputedGradient(props);
const editDivRef = ref<InstanceType<typeof EditDiv> | null>(null);
const { handleTextChange } = useHandleTextChange(props, emits, editDivRef);

const foBind = computed(() => {
  const { width, height } = props.sprite?.boundingBox;
  return {
    width,
    height,
  };
});

const boundingBox = computed(() => {
  return props.sprite.boundingBox;
});

// 矩形属性的绑定
const rectBind = computed(() => {
  const { width, height } = boundingBox.value;
  const { fill, gradientFill, stroke, strokeWidth } = props.sprite.attrs;

  console.log(computedGradient.value, "computedGradient");

  return {
    width,
    height,
    fill: gradientFill
      ? `url(#${computedGradient.value?.linearGradient.id})`
      : fill,
    stroke,
    "stroke-width": strokeWidth,
  };
});

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
</script>

<style scoped>
.content-wrapper {
  height: 100%;
  width: 100%;

  display: flex;
}
</style>
