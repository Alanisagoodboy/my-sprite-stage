<template>
  <g ref="dragRef" class="active-sprites-container" :transform="transform">
    <!-- 这里只能fill: none 防止点击不到下面的精灵 -->
    <rect
      x="0"
      y="0"
      :width="dragData.width"
      :height="dragData.height"
      stroke="#398cfe"
      fill="none"
    />
    <slot />
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
  findParentByClass,
  calcResizeBoxInfoWithoutRotate,
  calcMoveBoxInfoWithoutRotate,
  getSelectList,
} from "../../utils/index";
import { HANDLER } from "../../utils/types";

import {
  computed,
  ref,
  // inject,
  onMounted,
  onUnmounted,
  // type Ref,
  nextTick,
} from "vue";
import { IBoundingBox, ISize, ISprite } from "../meta-data/types";

import { getWrapperBoxInfo } from "../../utils/index";

// const svgRef = inject("svgRef") as Ref<HTMLElement>;
onMounted(() => {
  document.addEventListener("pointerdown", onMousedown, false);
});

onUnmounted(() => {
  document.removeEventListener("pointerdown", onMousedown, false);
});

const dotSize = 6;

const props = defineProps<{
  // 舞台尺寸
  stageSize: ISize,
  // 精灵列表
  spriteList: ISprite[];
  // 活跃的精灵列表
  activeSpriteList: ISprite[];
  // 已经注册的精灵元数据map
  registerSpriteMetaMap: Record<string, any>;
}>();
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
  if (props.activeSpriteList.length === 1) {
    const { registerSpriteMetaMap, activeSpriteList } = props;
    const activeMeta =
      registerSpriteMetaMap[(activeSpriteList[0] as ISprite).type];
    if (activeMeta.resizePoints === "all") {
      return dotList;
    }
    if (activeMeta.resizePoints === "empty") {
      return [];
    }
  } else {
    return dotList;
  }
  return [];
});

// 旋转操作杆渲染
const isShowRotate = computed(() => {
  // const { registerSpriteMetaMap, activeIndex, spriteList } = props;
  // const activeMeta =
  //   registerSpriteMetaMap[(spriteList[activeIndex] as ISprite).type];
  return false;
});

// 计算外包裹拖拽盒子信息
const dragData = computed(() => {
  const points: IBoundingBox[] = props.activeSpriteList.map((m: ISprite) => {
    return m.boundingBox;
  });
  const boundingBox = getWrapperBoxInfo(points);
  return {
    ...boundingBox,
  };
});

// 坐标变换
const transform = computed(() => {
  const centerX = dragData.value.x + dragData.value.width / 2;
  const centerY = dragData.value.y + dragData.value.height / 2;
  const translateStr = `translate(${dragData.value.x}, ${dragData.value.y})`;
  const rotateStr = `rotate(${0} ${centerX} ${centerY})`;
  return `${rotateStr} ${translateStr}`;
});

function onDotMousedown(dotInfo: IDot, e: MouseEvent) {
  e.stopPropagation();
  e.preventDefault();

  // 1.按下去的一瞬间 缓存当前的盒子信息
  const { width, height, x, y } = dragData.value;

  const rect = { width, height, x, y };

  const downPointActiveList: ISprite[] = JSON.parse(
    JSON.stringify(props.activeSpriteList)
  );
  // 5.计算中心点的坐标

  const onMousemove = (moveEv: MouseEvent) => {
    const box = calcResizeBoxInfoWithoutRotate({
      handleType: dotInfo.side,
      rect,
      needChangeRect: downPointActiveList.map((m) => m.boundingBox),
      startEv: e,
      moveEv: moveEv,
    });
    emit("resize", { ...box, downPointActiveList }, dotInfo.side);
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

function getActiveBoxInfo() {
  const points = props.activeSpriteList.map((m: ISprite) => {
    return m.boundingBox;
  });
  const boundingBox = getWrapperBoxInfo(points);
  return {
    ...boundingBox,
  };
}

/*
 * 鼠标按下事件
 */
async function onMousedown(e: MouseEvent) {
  const spriteDom = findParentByClass(e.target, "sprite-container");
  if (!spriteDom) return;

  // 查找 id 点击的精灵的id
  const id = spriteDom?.getAttribute("data-sprite-id");
  const selectBox = getSelectList({
    id,
    activeList: props.activeSpriteList,
    allList: props.spriteList,
  });
  emit("select", { ...selectBox });
  // 传出事件，再等待新的props
  await nextTick();
  const lastDragInfo = getActiveBoxInfo();
  const needChangeRect: IBoundingBox[] = JSON.parse(
    JSON.stringify(props.activeSpriteList)
  ).map((m: ISprite) => m.boundingBox);

  const staticRectList = props.spriteList
    .filter((f) => {
      return props.activeSpriteList.find((item) => item.id !== f.id);
    })
    .map((m) => m.boundingBox);
  isMousedown.value = true;

  const onMousemove = (ev: MouseEvent) => {
    const boxInfo = calcMoveBoxInfoWithoutRotate({
      rect: lastDragInfo,
      stageSize: props.stageSize,
      needChangeRect,
      staticRectList,
      startEv: e,
      moveEv: ev,
    });
    emit("move", { ...boxInfo });
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
  console.log(e);

  // const el = dragRef.value!;
  // e.stopPropagation();
  // e.preventDefault();

  // const startY = e.clientY;
  // const startX = e.clientX;

  // const rect = el.getBoundingClientRect();
  // 旋转中心位置
  // const centerX = rect.left + rect.width / 2;
  // const centerY = rect.top + rect.height / 2;

  // // 旋转前的角度
  // const rotateDegreeBefore =
  //   Math.atan2(startY - centerY, startX - centerX) / (Math.PI / 180);

  // function onMousemove(e: MouseEvent) {
  //   // const curX = e.clientX;
  //   // const curY = e.clientY;
  //   // Math.atan2(y,x) 返回从原点 (0,0) 到 (x,y) 点的线段与 x 轴正方向之间的平面角度 (弧度值)

  //   // // 旋转后的角度
  //   // const rotateDegreeAfter =
  //   //   Math.atan2(curY - centerY, curX - centerX) / (Math.PI / 180);
  //   // // 获取旋转的角度值， startRotate 为初始角度值
  //   // const rotate = 0 + rotateDegreeAfter - rotateDegreeBefore;

  //   // // dragData.value.rotate = rotate; // 角度
  //   emit("rotate", { ...dragData.value });
  // }

  // const onMouseup = (_e: MouseEvent) => {
  //   document.removeEventListener("pointermove", onMousemove);
  //   document.removeEventListener("pointerup", onMouseup);
  // };
  // document.addEventListener("pointermove", onMousemove);
  // document.addEventListener("pointerup", onMouseup);
}
</script>

<style lang="scss"></style>
