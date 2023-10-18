<template>
  <g>
    <circle
      r="10"
      :cx="item.x"
      :cy="item.y"
      v-for="(item, index) of anchorPoints"
      :key="index"
      fill="#1e7fff"
      filter="drop-shadow(rgba(0, 0, 0, 0.4) 0 0 5)"
      @pointerdown="handleDown($event, index)"
    ></circle>
  </g>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ICoordinate, ISprite } from "../../meta-data/types";
import { default_sprite_data } from "../../meta-data";
import { getWrapperBoxByPoint } from "../../../utils/index.ts";

const p = defineProps<{
  spriteList: ISprite[];
  sprite: ISprite;
}>();

const emits = defineEmits([
  "anchor-point-move",
  "select",
  "anchor-point-move-end",
]);

// 渲染的锚点信息
const anchorPoints = computed(() => {
  const sprite = p.sprite;
  const { width, height } = sprite.boundingBox;
  const metaData = default_sprite_data[sprite.type];
  const { anchors } = metaData;
  if (anchors) {
    const ratePoint = anchors.getPoints({ sprite });
    const point = ratePoint.map((m: ICoordinate) => {
      return {
        x: m.x * width,
        y: m.y * height,
      };
    });
    return point;
  }
  return [];
});

// 初始化 记录的点坐标
let recordPointInfo = {
  // 线段左上角的坐标信息
  ltInfoInStage: {
    x: 0,
    y: 0,
  },
  initPoint: {
    x: 0,
    y: 0,
  },
  targetAnchorPoints: [],
  initAnchorPoints: [],
  downPoint: {
    x: 0,
    y: 0,
  },

  index: 0, // 记录操作的是第几个锚点

  setInitPoint({ x, y }: { x: number; y: number }) {
    this.initPoint.x = x;
    this.initPoint.y = y;
  },

  setDownPoint({ x, y }: { x: number; y: number }) {
    this.downPoint.x = x;
    this.downPoint.y = y;
  },

  setLtInfoInStage({ x, y }: { x: number; y: number }) {
    this.ltInfoInStage.x = x;
    this.ltInfoInStage.y = y;
  },

  setIndex(index: number) {
    this.index = index;
  },

  setInitAnchorPoints(index: number, point: { x: number; y: number }) {
    this.initAnchorPoints[index] = point;
  },

  setTargetAnchorPoints(index: number, point: { x: number; y: number }) {
    this.targetAnchorPoints[index] = point;
  },
};

// 按下
function handleDown(e: MouseEvent, index: number) {
  console.log(222);

  // 阻止冒泡 防止触发移动事件
  e.stopPropagation();
  // 阻止默认拖拽等事件，防止无法触发up事件
  e.preventDefault();
  console.log(p.sprite.id, "p.sprite.id");

  emits("select", p.sprite.id);
  const { points } = JSON.parse(JSON.stringify(p.sprite.attrs));
  const { x, y, width, height } = p.sprite.boundingBox;
  // 记录操作的是哪个点
  recordPointInfo.setIndex(index);

  // recordPointInfo.targetAnchorPoints = [...anchorPoints.value];

  recordPointInfo.ltInfoInStage = {
    x,
    y,
    width,
    height,
  };
  // 缓存点的坐标系初始位置，转化为坐标轴上的点
  recordPointInfo.targetAnchorPoints = points.map((m) => {
    return {
      x: m.x * width + x,
      y: m.y * height + y,
    };
  });
  // // 缓存点的坐标系初始位置，转化为坐标轴上的点
  recordPointInfo.setInitPoint({
    ...recordPointInfo.targetAnchorPoints[index],
  });

  // 记录鼠标按下视口坐标系的位置
  recordPointInfo.setDownPoint({
    x: e.clientX,
    y: e.clientY,
  });

  document.addEventListener("pointerup", handleUp, false);
  document.addEventListener("pointermove", handleMove, false);
}

// 移动
function handleMove(e: MouseEvent) {
  const { initPoint, downPoint, index } = recordPointInfo;
  console.log(downPoint, "downPoint", initPoint);

  const x = e.clientX - downPoint.x + +initPoint.x;
  const y = e.clientY - downPoint.y + +initPoint.y;

  // 锚点移动事件 抛给父组件
  recordPointInfo.setTargetAnchorPoints(index, { x, y });

  const boundingBox = getWrapperBoxByPoint(recordPointInfo.targetAnchorPoints);

  const points = recordPointInfo.targetAnchorPoints.map((m) => {
    return {
      x: (m.x - boundingBox.x) / boundingBox.width,
      y: (m.y - boundingBox.y) / boundingBox.height,
    };
  });

  const _sprite = JSON.parse(JSON.stringify(p.sprite));
  emits("anchor-point-move", {
    id: p.sprite.id,
    sprite: {
      ..._sprite,
      boundingBox,
      attrs: {
        ..._sprite.attrs,
        points,
      },
    },
  });
}

// 抬起
function handleUp() {
  emits("anchor-point-move-end", {
    initPoint: { ...recordPointInfo.initPoint },
    targetAnchorPoints: [...recordPointInfo.targetAnchorPoints],
    anchorPoints: [...anchorPoints.value],
  });
  document.removeEventListener("pointerup", handleUp, false);
  document.removeEventListener("pointermove", handleMove, false);
}
</script>
