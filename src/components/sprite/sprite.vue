<template>
  <g
    ref="dragRef"
    class="sprite-container"
    :transform="transform"
    @mousedown="onMousedown"
  >
    <rect
      fill="transparent"
      :width="dragData.width"
      :height="dragData.height"
    />
    <slot>
      <text>{{ dragData.x }}---{{ dragData.y }}</text>
    </slot>

    <rect
      v-for="dot of dotList"
      :key="dot.side"
      :width="dotSize"
      :height="dotSize"
      fill="transparent"
      stroke-width="1"
      stroke="#000"
      v-bind="getHandlePoint(dragData, dot.side, dotSize)"
      @mousedown="onDotMousedown(dot, $event)"
    />

    <g
      @mousedown="onRotateMousedown"
      :transform="`translate(${+dragData.width / 2 - 5} , -30)`"
    >
      <!-- <text y="-10">{{ parseInt(dragData.angle) }}</text> -->
      <rect width="10" height="10"></rect>
      <!-- <path
        transform="scale(0.02)"
        d="M482.773333 66.517333l148.181334 151.168a21.333333 21.333333 0 0 1 0 29.866667l-147.84 150.826667a21.333333 21.333333 0 0 1-28.16 2.090666l-2.346667-2.090666-27.050667-27.605334a21.333333 21.333333 0 0 1 0-29.866666l69.888-71.338667a304.64 304.64 0 1 0 318.421334 352.682667l1.024-6.826667c0.170667-1.408 0.426667-3.285333 0.64-5.632a21.333333 21.333333 0 0 1 22.314666-19.114667l42.666667 2.261334a21.333333 21.333333 0 0 1 20.224 22.4l-0.085333 1.024-1.194667 10.496A389.973333 389.973333 0 1 1 484.821333 184.746667l-59.306666-60.458667a21.333333 21.333333 0 0 1 0-29.866667l27.093333-27.605333a21.333333 21.333333 0 0 1 30.165333-0.298667z" /> -->
    </g>
  </g>
</template>

<script setup lang="ts">
import {
  getRotatedPoint,
  getHandlePoint,
  calculateTopLeft,
  calculateLeftMiddle,
  calcResizedBoxInfo,
} from "../../utils/index";
import { HANDLER } from "../../utils/types";

import { computed, ref, inject, onMounted, type Ref } from "vue";

const svgRef = inject("svgRef") as Ref<HTMLElement>;
onMounted(() => {
  console.log(svgRef, "kkkk");
});
const initCoordinate = {
  x: 0,
  y: 0,
};

const initSize = {
  width: 0,
  height: 0,
};

function setInitCoordinate(x: number, y: number) {
  initCoordinate.x = x;
  initCoordinate.y = y;
}

function setInitSize(width: number, height: number) {
  initSize.width = width;
  initSize.height = height;
}

const dotSize = 10;

const props = defineProps({
  boundary: {
    // 边界
    type: Boolean,
  },
  width: {
    type: Number,
    default: 100,
  },
  height: {
    type: Number,
    default: 100,
  },
  x: {
    type: Number,
    default: 0,
  },
  y: {
    type: Number,
    default: 0,
  },
  color: {
    type: String,
    default: "#3a7afe",
  },
});
const emit = defineEmits(["move", "resize", "rotate"]);

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

  const [startX, startY] = [e.pageX, e.pageY]
  const { width, height, x: left, y: top } = dragData.value;

  const editorRectInfo = svgRef.value.getBoundingClientRect();

  // 当前点击坐标
  const curPoint = {
    x: e.clientX - editorRectInfo.left,
    y: e.clientY - editorRectInfo.top,
  };

  const point = {
    x:dragData.value.x,
     y:dragData.value.y
  }

  // 中心点
  let center = {
    x: left + width / 2,
    y: top + height / 2,
  };

  // 计算旋转之前的坐标
  const rect = getRotatedPoint(point, center, -dragData.value.rotate)

  // 对称点
  const symmetricPoint = {
    x: center.x - (curPoint.x - center.x),
    y: center.y - (curPoint.y - center.y),
  };

  const onMousemove = (e: MouseEvent) => {
    // // 移动的x距离
    const disX = e.pageX - startX;
    // // 移动的y距离
    const disY = e.pageY - startY;
    const curPositon = {
      x: e.clientX - editorRectInfo.left,
      y: e.clientY - editorRectInfo.top,
    };

    console.log(rect, 'rect');
    
    switch (dotInfo.side) {
      case HANDLER.BR:
        // dragData.value.x = rect.x - disX
        // dragData.value.y = rect.x - disY
        dragData.value.height = height + disY
        dragData.value.width = width +disX
        break;
    
      default:
        break;
    }

    // // 获取形变后的新的盒子信息
    const resizedBoxInfo = calcResizedBoxInfo(dotInfo.side, {
      recordInfo: { ...dragData.value },
      curPositon,
      symmetricPoint,
    });



    // dragData.value = resizedBoxInfo;

    emit("resize", dragData.value);
  };
  const onMouseup = (_e: MouseEvent) => {
    document.removeEventListener("mousemove", onMousemove);
    document.removeEventListener("mouseup", onMouseup);
  };
  document.addEventListener("mousemove", onMousemove);
  document.addEventListener("mouseup", onMouseup);
}

// 拖拽元素
const dragRef = ref<HTMLElement | null>(null);
// 是否按下鼠标
const isMousedown = ref(false);
// 拖拽数据
const dragData = ref({
  width: props.width,
  height: props.height,
  x: props.x,
  y: props.y,
  rotate: 0,
});

/**
 * 鼠标按下事件
 */
function onMousedown(e: MouseEvent) {
  // const el = dragRef.value!;
  isMousedown.value = true;

  // 记录按下的位置
  const downX = e.clientX;
  const downY = e.clientY;

  // 鼠标在盒子里的位置
  // const mouseX = downX - rect.x
  // const mouseY = downY - rect.y
  // return;
  const lastPoint = {
    x: dragData.value.x,
    y: dragData.value.y,
  };
  const onMousemove = (e: MouseEvent) => {
    const x = e.clientX - downX + lastPoint.x;
    const y = e.clientY - downY + lastPoint.y;
    dragData.value.x = x;
    dragData.value.y = y;
    emit("move", dragData.value);
  };

  const onMouseup = (_e: MouseEvent) => {
    isMousedown.value = false;
    // 移除document事件
    document.removeEventListener("mousemove", onMousemove);
    document.removeEventListener("mouseup", onMouseup);
  };
  // 位document注册鼠标移动事件
  document.addEventListener("mousemove", onMousemove);
  // 鼠标抬起事件
  document.addEventListener("mouseup", onMouseup);
}

function onRotateMousedown(e: MouseEvent) {
  const el = dragRef.value!;
  e.stopPropagation();
  e.preventDefault();

  const startY = e.clientY;
  const startX = e.clientX;

  console.log(el, "yy");

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
    emit("rotate", dragData.value);
  }

  const onMouseup = (_e: MouseEvent) => {
    document.removeEventListener("mousemove", onMousemove);
    document.removeEventListener("mouseup", onMouseup);
  };
  document.addEventListener("mousemove", onMousemove);
  document.addEventListener("mouseup", onMouseup);
}
</script>

<style lang="scss"></style>
