<template>
  <svg
    data-sprite-type="stage"
    class="stage-container"
    xmlns="http://www.w3.org/2000/svg"
    :height="stage.attrs.height"
    :width="stage.attrs.width"
    :style="{
      'background-color': stage.attrs.backgroundColor,
      'background-image': stage.attrs.backgroundGradient,
    }"
    ref="svgRef"
    :viewBox="`0, 0, ${stage.attrs.width}, ${stage.attrs.height}`"
    :transform="`scale(${stage.attrs.scale}) translate(${d.dx}, ${d.dy})`"
    @mousewheel="mousewheel"
    @mousedown="mousedown"
  >
    <g ref="groupRef">
      <slot />
    </g>
  </svg>
</template>
<script setup lang="ts">
import { ref, provide, onMounted, reactive } from "vue";

defineOptions({
  name: "stage-page",
});

const d = reactive({
  dx: 0,
  dy: 0,
});

const props = defineProps({
  stage:{
    type: Object,
    default: () => ({}),
  }
});
const emits = defineEmits(["stage-scale"]);

const svgRef = ref<HTMLElement | null>(null);
const groupRef = ref<SVGSVGElement | null>(null);

provide("svgRef", svgRef);
defineExpose({ svgRef });

function mousewheel(e: WheelEvent) {
  e.preventDefault();
  const prevScale = props.stage.attrs.scale || 0;
  const v = prevScale + (e.deltaY < 0 ? 0.1 : -0.1);
  const _scale = Math.max(Math.min(1.5, v), 0.2);
  emits("stage-scale", _scale);
}

onMounted(() => {});

function mousedown(e: MouseEvent) {
  if (!e.ctrlKey) return;
  let downX = e.clientX;
  let downY = e.clientY;

  const lastPoint = {
    ...d,
  };
  // const gx = group.transform("translateX") as any as number;
  // const gy = group.transform("translateY") as any as number;

  function mousemove(event: MouseEvent) {
    d.dx = (event.clientX - downX + lastPoint.dx) / props.stage.attrs.scale!;
    d.dy = (event.clientY - downY + lastPoint.dy) / props.stage.attrs.scale!;
  }

  function mouseup() {
    document!.removeEventListener("mousemove", mousemove, false);
    document!.removeEventListener("mouseup", mouseup, false);
  }
  document!.addEventListener("mousemove", mousemove, false);
  document!.addEventListener("mouseup", mouseup, false);
}
</script>

<style lang="scss" scoped></style>
