<template>
  <g ref="dragRef" class="active-sprites-container" :transform="transform">
    <!-- 这里只能fill: none 防止点击不到下面的精灵 -->
    <g v-show="isMoving">
      <line
        v-for="line of auxiliaryLine"
        v-bind="line"
        stroke="#000"
        stroke-dasharray="5"
      ></line>
    </g>
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
  findById,
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
import { IBoundingBox, IStage, ISprite, SPRITE_NAME } from "../meta-data/types";

import { getWrapperBoxInfo } from "../../utils/index";

function handleSelectExactly(e: MouseEvent) {
  setIsMoving(false);
  // 双击选中
  // 1.如果是组，则选中确切点击的组
  const spriteDom = findParentByClass(e.target, "sprite-container");
  if (!spriteDom) return;

  // 查找 id 点击的精灵的id
  const id = spriteDom?.getAttribute("data-sprite-id");

  const find = findById(props.spriteList, id);
  if (find) {
    // 如果不是第一层,那么选中
    // if (!props.spriteList.find((f) => f.id === id)) {

    // }

    // 如果不是组，则开启编辑模式
    emits("select", {
      target: find,
      mode: find.type === SPRITE_NAME.GROUP ? "default" : "edit",
    });
  }
}

// const svgRef = inject("svgRef") as Ref<HTMLElement>;
onMounted(() => {
  document.addEventListener("pointerdown", onMousedown, false);
  document.addEventListener("dblclick", handleSelectExactly, false);
});

onUnmounted(() => {
  document.removeEventListener("pointerdown", onMousedown, false);
  document.removeEventListener("dblclick", handleSelectExactly, false);
});

const dotSize = computed(() => {
  const size = 6;
  return size / props.stage.scale;
});

// 是否正在拖拽
const isMoving = ref(false);

function setIsMoving(val: boolean) {
  isMoving.value = val;
}

const props = defineProps<{
  // 舞台尺寸
  stage: IStage;
  // 精灵列表
  spriteList: ISprite[];
  // 活跃的精灵列表
  activeSpriteList: ISprite[];
  // 已经注册的精灵元数据map
  registerSpriteMetaMap: Record<string, any>;
  // 辅助线
  auxiliaryLineList: any[];
}>();
const emits = defineEmits([
  "move",
  "move-end",
  "resize",
  "resize-end",
  "rotate",
  "select",
  "updateSprite",
]);

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

const auxiliaryLine = computed(() => {
  return props.auxiliaryLineList.map((m) => {
    return {
      x1: m.x1 - dragData.value.x,
      x2: m.x2 - dragData.value.x,
      y1: m.y1 - dragData.value.y,
      y2: m.y2 - dragData.value.y,
    };
  });
});

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
  // return dotList;
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

// 做一个缓存，保存当前拖拽的盒子信息，坐标是舞台上的坐标
let boxInfoInStage = {};

function onDotMousedown(dotInfo: IDot, e: MouseEvent) {
  e.stopPropagation();
  e.preventDefault();
  setIsMoving(false);

  // 1.按下去的一瞬间 缓存当前的盒子信息
  const lastDragInfo = getActiveBoxInfo();

  const needChangeRect: IBoundingBox[] = JSON.parse(
    JSON.stringify(props.activeSpriteList)
  ).map((m: ISprite) => m.boundingBox);

  const staticRectList = props.spriteList
    .filter((f) => {
      return props.activeSpriteList.find((item) => item.id !== f.id);
    })
    .map((m) => m.boundingBox);
  // 5.计算中心点的坐标

  const onMousemove = (moveEv: MouseEvent) => {
    setIsMoving(true);
    boxInfoInStage = calcResizeBoxInfoWithoutRotate({
      stage: props.stage,
      handleType: dotInfo.side,
      rect: lastDragInfo,
      needChangeRect,
      staticRectList,
      startEv: e,
      moveEv: moveEv,
    });
    emitData("resize");
  };
  const onMouseup = (_e: MouseEvent) => {
    setIsMoving(false);

    emitData("resize-end");
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
  setIsMoving(false);
  const spriteDom = findParentByClass(e.target, "sprite-container");
  if (!spriteDom) return;

  // 查找 id 点击的精灵的id
  const id = spriteDom?.getAttribute("data-sprite-id");
  console.log(id, "id");

  const { target, boundingBox } = getSelectList({
    id,
    activeList: props.activeSpriteList,
    allList: props.spriteList,
  });

  //代码丑陋, 输入只是点击，有可能会后触发mouseup，导致坐标数据是以前的，所以在计算出选中后吗，立马更新坐标数据
  boxInfoInStage = boundingBox;
  emits("select", { target });



  // Object.assign(boxInfoInStage, selectSprite.boundingBox);
  // 如果不是鼠标左键 return
  if (e.button !== 0) return;

  // 传出事件，再等待新的props
  await nextTick();

  // const editMode = target.some((s) => s.mode === "edit");
  // console.log(editMode, 'editMode');
  
  // 如果是编辑模式，直接 return
  // if (editMode) return;

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
    setIsMoving(true);
    boxInfoInStage = calcMoveBoxInfoWithoutRotate({
      rect: lastDragInfo,
      stage: props.stage,
      needChangeRect,
      staticRectList,
      startEv: e,
      moveEv: ev,
    });
    emitData("move");
  };

  const onMouseup = async (_e: MouseEvent) => {
    emitData("move-end");
    setIsMoving(false);
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

function emitData(
  type: "move" | "move-end" | "resize" | "resize-end" | "rotate"
) {
  // 如果是组内选中，那么肯定是由一个活跃精灵列表肯定只有一个
  // 并且不在第一层
  // if (props.activeSpriteList.length === 1) {
  //   const sprite = props.activeSpriteList[0];
  //   const find = props.spriteList.find((f) => f.id === sprite.id);
  //   if (!find) {
  //     // 将坐标转化为组内坐标
  //     const pos = getCoordinateInGroupFromStage(sprite.id, props.spriteList);
  //     console.log(pos, 'pos');

  //     pos && emit(type, { ...boxInfoInStage, x: pos.x, y: pos.y });
  //     console.log("8888");

  //     return;
  //   } else {
  //     emit(type, { ...boxInfoInStage });
  //   }
  // } else {

  emits(type, { ...boxInfoInStage });
  // }
}
</script>

<style lang="scss"></style>
