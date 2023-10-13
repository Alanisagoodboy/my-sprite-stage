<template>
  <g ref="dragRef"  class="active-sprites-container" :transform="transform">
    <!-- <rect
      x="0"
      y="0"
      :width="dragData.width"
      :height="dragData.height"
      stroke="#398cfe"
      fill="transparent"
    /> -->
    <!-- <path
      :d="`M0,0 L${dragData.width},${0} L${dragData.width},${
        dragData.height
      } Z`"
    ></path> -->

    <slot>
      <!-- <text>{{ dragData.x }}---{{ dragData.y }}</text> -->
    </slot>
    <!-- <rect
      x="0"
      y="0"
      :width="dragData.width"
      :height="dragData.height"
      stroke="#398cfe"
      fill="transparent"
    >
    </rect> -->
    <rect
      v-for="dot of resizePoints"
      :key="dot.side"
      :width="dotSize"
      :height="dotSize"
      fill="#fff"
      stroke-width="1"
      stroke="#398cfe"
      v-bind="getHandlePoint(dragData, dot.side, dotSize)"
      @mousedown="onDotMousedown(dot, $event)"
    />

    <g
      v-if="isShowRotate"
      @mousedown="onRotateMousedown"
      :transform="`translate(${+dragData.width / 2 - 5} , -30)`"
    >
      <circle r="5" stroke="#398cfe" fill="#fff"></circle>
    </g>
  </g>
</template>

<script setup lang="ts">
import {
  getHandlePoint,
  calcResizedBoxInfo,
  findParentByClass,
} from "../../utils/index";
import { HANDLER } from "../../utils/types";

import {
  computed,
  ref,
  inject,
  onMounted,
  onUnmounted,
  type Ref,
  nextTick,
} from "vue";
import { ISprite } from "../meta-data/types";

const svgRef = inject("svgRef") as Ref<HTMLElement>;
onMounted(() => {
  document.addEventListener("pointerdown", onMousedown, false);
});

onUnmounted(() => {
  document.removeEventListener("pointerdown", onMousedown, false);
});

const dotSize = 6;

const props = defineProps({
  activeIndex: {
    type: [Number],
    default: "0",
  },
  spriteList: {
    type: Array,
    default: [],
  },
  registerSpriteMetaMap: {
    type: Object,
    default: () => ({ a: 1 }),
  },
});
const emit = defineEmits(["move", "resize", "rotate", "select"]);

type IDot = {
  side: HANDLER;
  cursor?: string;
};
const dotList: IDot[] = [
  { side: HANDLER.TM, cursor: "n-resize" },
  { side: HANDLER.BM, cursor: "n-resize" },
  { side: HANDLER.ML, cursor: "e-resize" },
  { side: HANDLER.MR, cursor: "e-resize" },
  { side: HANDLER.TL, cursor: "se-resize" },
  { side: HANDLER.TR, cursor: "sw-resize" },
  { side: HANDLER.BL, cursor: "sw-resize" },
  { side: HANDLER.BR, cursor: "se-resize" },
];

// 形变点数组渲染
const resizePoints = computed(() => {
  const { registerSpriteMetaMap, activeIndex, spriteList } = props;
  const activeMeta =
    registerSpriteMetaMap[(spriteList[activeIndex] as ISprite).type];
  // 拥有所有的形变点
  if (activeMeta.resizePoints === "all") {
    return dotList;
  }

  if (activeMeta.resizePoints === "empty") {
    return [];
  }
});

// 旋转操作杆渲染
const isShowRotate = computed(() => {
  const { registerSpriteMetaMap, activeIndex, spriteList } = props;
  const activeMeta =
    registerSpriteMetaMap[(spriteList[activeIndex] as ISprite).type];
  return activeMeta.isShowRotateHandle;
});

// 坐标变换
const transform = computed(() => {
  const centerX = dragData.value.x + dragData.value.width / 2;
  const centerY = dragData.value.y + dragData.value.height / 2;
  const translateStr = `translate(${dragData.value.x}, ${dragData.value.y})`;
  const rotateStr = `rotate(${dragData.value.rotate} ${centerX} ${centerY})`;
  return `${rotateStr} ${translateStr}`;
});

function onDotMousedown(dotInfo: IDot, e: MouseEvent) {
  e.stopPropagation();
  e.preventDefault();

  // 1.按下去的一瞬间 缓存当前的盒子信息
  const { width, height, x: left, y: top } = dragData.value;
  // 2.计算原始中心点
  const originCenter = {
    x: left + width / 2,
    y: top + height / 2,
  };

  // 3. 计算画布的信息
  const editorRectInfo = svgRef.value.getBoundingClientRect();

  // 4.精确计算句柄的坐标
  const handleRectInfo = e.target!.getBoundingClientRect();

  const handlePoint = {
    x: handleRectInfo.left - editorRectInfo.left + handleRectInfo.width / 2,
    y: handleRectInfo.top - editorRectInfo.top + handleRectInfo.height / 2,
  };

  console.log(handlePoint, "handlePoint");

  // 获取对称点的坐标
  const symmetricPoint = {
    x: originCenter.x - (+handlePoint.x - originCenter.x),
    y: originCenter.y - (+handlePoint.y - originCenter.y),
  };

  // 5.计算中心点的坐标

  const onMousemove = (moveEv: MouseEvent) => {
    const box = calcResizedBoxInfo({
      handleType: dotInfo.side,
      originCenter,
      editorRectInfo,
      handlePoint,
      svgEl: svgRef.value,
      startMouse: e,
      moveMouse: moveEv,
      originBoxInfo: dragData.value,
      symmetricPoint,
    });

    dragData.value = box;

    emit("resize", { ...dragData.value }, dotInfo.side);

    // 吸附改动实时更新一次
    const _lastDragInfo = getActiveBoxInfo();
    dragData.value = { ..._lastDragInfo };
  };
  const onMouseup = (_e: MouseEvent) => {
    document.removeEventListener("pointermove", onMousemove);
    document.removeEventListener("pointerup", onMouseup);
  };
  document.addEventListener("pointermove", onMousemove);
  document.addEventListener("pointerup", onMouseup);
}

// 拖拽元素
const dragRef = ref<HTMLElement | null>(null);
// 是否按下鼠标
const isMousedown = ref(false);

// 拖拽数据
const dragData = ref({
  width: props.spriteList[props.activeIndex]?.attrs?.size?.width || 0,
  height: props.spriteList[props.activeIndex]?.attrs?.size?.height || 0,
  x: props.spriteList[props.activeIndex]?.attrs?.coordinate?.x || 0,
  y: props.spriteList[props.activeIndex]?.attrs?.coordinate?.y || 0,
  rotate: props.spriteList[props.activeIndex]?.attrs?.angle || 0,
});

function getActiveBoxInfo() {
  const active: any = props.spriteList[props.activeIndex];
  const { coordinate, size, angle } = JSON.parse(JSON.stringify(active.attrs));
  return {
    x: coordinate.x,
    y: coordinate.y,
    width: size.width,
    height: size.height,
    rotate: angle,
  };
}

/**
 * 鼠标按下事件
 */
async function onMousedown(e: MouseEvent) {
  console.log(e.target, 'e.target');
  
  const spriteDom = findParentByClass(e.target, "sprite-container");
  console.log(spriteDom, "spriteDom");

  if (!spriteDom) return;

  // 查找 id 点击的精灵的id
  const id = spriteDom?.getAttribute("data-sprite-id");
  emit("select", id);
  // 传出事件，再等待新的props
  await nextTick();
  console.log(id, "id");
  console.log(props.activeIndex, "props.activeIndex");

  const lastDragInfo = getActiveBoxInfo();
  dragData.value = { ...lastDragInfo };

  console.log(dragData.value, "dragData.value");

  isMousedown.value = true;

  // 记录按下的位置
  const downX = e.clientX;
  const downY = e.clientY;

  const onMousemove = (e: MouseEvent) => {
    console.log("move");

    const x = e.clientX - downX + +lastDragInfo.x;
    const y = e.clientY - downY + +lastDragInfo.y;
    dragData.value.x = x;
    dragData.value.y = y;

    emit("move", { ...dragData.value });

    // 吸附改动实时更新一次
    const _lastDragInfo = getActiveBoxInfo();
    dragData.value = { ..._lastDragInfo };
  };

  const onMouseup = (_e: MouseEvent) => {
    isMousedown.value = false;
    // 移除document事件
    document.removeEventListener("pointermove", onMousemove, false);
    document.removeEventListener("pointerup", onMouseup, false);
  };
  // 位document注册鼠标移动事件
  document.addEventListener("pointermove", onMousemove, false);
  // 鼠标抬起事件
  document.addEventListener("pointerup", onMouseup, false);
}

function onRotateMousedown(e: MouseEvent) {
  const el = dragRef.value!;
  e.stopPropagation();
  e.preventDefault();

  const startY = e.clientY;
  const startX = e.clientX;

  const rect = el.getBoundingClientRect();
  // 旋转中心位置
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // 旋转前的角度
  const rotateDegreeBefore =
    Math.atan2(startY - centerY, startX - centerX) / (Math.PI / 180);

  function onMousemove(e: MouseEvent) {
    const curX = e.clientX;
    const curY = e.clientY;
    // Math.atan2(y,x) 返回从原点 (0,0) 到 (x,y) 点的线段与 x 轴正方向之间的平面角度 (弧度值)

    // 旋转后的角度
    const rotateDegreeAfter =
      Math.atan2(curY - centerY, curX - centerX) / (Math.PI / 180);
    // 获取旋转的角度值， startRotate 为初始角度值
    const rotate = 0 + rotateDegreeAfter - rotateDegreeBefore;

    dragData.value.rotate = rotate; // 角度
    emit("rotate", { ...dragData.value });
  }

  const onMouseup = (_e: MouseEvent) => {
    document.removeEventListener("pointermove", onMousemove);
    document.removeEventListener("pointerup", onMouseup);
  };
  document.addEventListener("pointermove", onMousemove);
  document.addEventListener("pointerup", onMouseup);
}
</script>

<style lang="scss"></style>
