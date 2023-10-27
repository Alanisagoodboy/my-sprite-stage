<!-- 矩形精灵 -->
<template>
  <g>
    <rect v-bind="bind"><slot /></rect>
    <foreignObject x="0" y="0" :width="f.width" :height="f.height">
      <div
        ref="editDivRef"
        xmlns="http://www.w3.org/1999/xhtml"
        contenteditable="true"
        spellcheck="false"
        style="width: fit-content"
        @input="handleTextInput"
      >
        <div style="text-align: left">hello</div>
      </div>
    </foreignObject>
  </g>
</template>
<script setup lang="ts">
import { ISprite } from "../../meta-data/types";
import { computed, onMounted, ref } from "vue";
defineOptions({
  name: "rect-sprite",
});

const props = defineProps<{
  sprite: ISprite;
}>();

const f = ref({
  width: 0,
  height: 0,
});
const editDivRef = ref(null);

function autoCalcTextSize() {
  const rect = (editDivRef.value as any as HTMLElement).getBoundingClientRect();
  f.value.height = rect.height;
  f.value.width = rect.width;
}
onMounted(() => {
  autoCalcTextSize();
});
function handleTextInput() {
  autoCalcTextSize();
}

const bind = computed(() => {
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
    'stroke-width': strokeWidth
    // transform: `rotate(${rotate} ${centerPoint.x} ${centerPoint.y})`,
  };
});
</script>

<style lang="scss" scoped></style>
