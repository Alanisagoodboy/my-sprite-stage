<template>
  <circle
    ref="pointRef"
    :style="{ cursor: 'pointer', ...style }"
    filter="drop-shadow(rgba(0, 0, 0, 0.4) 0 0 5)"
    :class="className"
    :stroke="stroke"
    :strokeWidth="strokeWidth"
    :fill="fill"
    :cx="x"
    :cy="y"
    :r="radius"
    @mouseDown="onMouseDown"
  />
</template>

<script setup lang="ts">

import { useRefState } from "../../../hooks/useState";
import { onMounted, ref } from "vue";

defineProps<{
  x?: number;
  y?: number;
  radius?: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  id?: string;
  className?: string;
  style?: Record<string, any>;
  //   onChange?: (point: IPoint) => void;
  //   onMouseDown?: (point: IPoint, e: MouseEvent) => void;
  //   onMouseMove?: (point: IPoint, e: MouseEvent) => void;
  //   onMouseUp?: (point: IPoint, e: MouseEvent) => void;
}>();

const emits = defineEmits([
  "onChange",
  "onMouseDown",
  "onMouseMove",
  "onMouseUp",
]);

const initPoint = { x: -1, y: -1 };
const pointRef = ref();
const [startPoint, setStartPoint] = useRefState(initPoint);
const [startAnchorPoint, setStartAnchorPoint] = useRefState(initPoint);
const [currentPoint, setCurrentPoint] = useRefState(initPoint);
const [moving, setMoving] = useRefState(false);

const getStatePoint = (e: MouseEvent) => {
  const { pageX, pageY } = e;
  // 计算在鼠标相对锚点的坐标
  const point = {
    x: pageX - startPoint.value.x + startAnchorPoint.value.x,
    y: pageY - startPoint.value.y + startAnchorPoint.value.y,
  };
  return point;
};
// 鼠标拖动锚点
function onMouseMove(e: MouseEvent) {
  const newPoint = getStatePoint(e);
  setCurrentPoint(newPoint);
  emits("onChange", newPoint);
  //   onChange(newPoint);
  //   mouseMove(newPoint, e);
  emits("onMouseMove", newPoint, e);
}

// 鼠标抬起锚点
function onMouseUp(e: MouseEvent) {
  document.removeEventListener("mousemove", onMouseMove, true);
  document.removeEventListener("mouseup", onMouseUp, true);
  setStartPoint(initPoint);
  setMoving(false);
  //   mouseUp(currentPoint, e);
  emits("onMouseUp", currentPoint, e);
  

  document.removeEventListener("mousemove", onMouseMove, true);
  document.removeEventListener("mouseup", onMouseUp, true);
}
// 鼠标按下锚点
function onMouseDown(e: MouseEvent) {
  const { pageX: x, pageY: y } = e;
  setStartPoint({ x, y });
  setStartAnchorPoint({ x, y });
  setMoving(true);
  //   mouseDown({ x, y }, e);
  emits("onMouseDown", { x, y }, e);

  document.addEventListener("mousemove", onMouseMove, true);
  document.addEventListener("mouseup", onMouseUp, true);
}

onMounted(() => {});
</script>
