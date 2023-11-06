<template>
  <g
    v-for="{ anchorPoints, sprite } of anchorPointsList"
    :key="sprite.id"
    :transform="`translate(${sprite.boundingBox.x} ${sprite.boundingBox.y})`"
  >
    <circle
      :r="r"
      :cx="point.x"
      :cy="point.y"
      v-for="(point, index) of anchorPoints"
      :key="index"
      fill="#FFF"
      stroke="#398cfe"
      stroke-width="1"
      filter="drop-shadow(rgba(0, 0, 0, 0.4) 0 0 5)"
      @pointerdown="handleDown($event, { anchorPoints, sprite }, +index)"
    ></circle>
  </g>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ICoordinate, ISprite, IStage } from "../../meta-data/types";
import { default_sprite_data } from "../../meta-data";

const p = defineProps<{
  // 画布数据
  stage: IStage;
  // 所有精灵
  spriteList: ISprite[];
  // 活跃的精灵列表
  activeSpriteList: ISprite[];
}>();

const emits = defineEmits([
  "anchor-point-move",
  "select",
  "anchor-point-move-end",
]);

const r = computed(()=> {
  const size = 4
  return size / p.stage.scale
})

// 渲染的锚点信息
const anchorPointsList = computed(() => {
  let arr: { sprite: ISprite; anchorPoints: ICoordinate[] }[] = [];
  p.activeSpriteList.forEach((sprite) => {
    const { anchors } = default_sprite_data[sprite.type];
    if (anchors) {
      const { width, height } = sprite.boundingBox;
      const ratePoint = anchors.getPoints({ sprite });
      const anchorPoints = ratePoint.map((m: ICoordinate) => {
        return {
          x: m.x * width,
          y: m.y * height,
        };
      });
      arr.push({
        sprite,
        anchorPoints,
      });
    }
  });

  return arr;
});

// 初始化 记录的点坐标
let recordPointInfo: Record<string, any> = {
  initPoint: {
    x: 0,
    y: 0,
  },
  targetAnchorPoints: [] as ICoordinate[],
  downPoint: {
    x: 0,
    y: 0,
  },

  index: 0, // 记录操作的是第几个锚点

  setInitPoint({ x, y }: { x: number; y: number }) {
    this.initPoint.x = x;
    this.initPoint.y = y;
  },

  // 当前操作的锚点属于哪个精灵
  activeInfo: {} as {
    sprite: ISprite;
    anchorPoints: ICoordinate[];
  },

  // 记录按下鼠标的视口坐标
  setDownPoint({ x, y }: { x: number; y: number }) {
    this.downPoint.x = x;
    this.downPoint.y = y;
  },

  // 记录当前操作的数据哪个精灵锚点的第几个索引
  setIndex(index: number) {
    this.index = index;
  },

  setTargetAnchorPoints(index: number, point: { x: number; y: number }) {
    this.targetAnchorPoints[index] = point;
  },
};

// 按下
function handleDown(
  e: MouseEvent,
  activeInfo: { sprite: ISprite; anchorPoints: ICoordinate[] },
  index: number
) {
  console.log(222);

  // 阻止冒泡 防止触发移动事件
  e.stopPropagation();
  // 阻止默认拖拽等事件，防止无法触发up事件
  e.preventDefault();
  recordPointInfo.activeInfo = activeInfo;

  emits("select", activeInfo.sprite.id);

  const { x, y } = activeInfo.sprite.boundingBox;
  // 记录操作的是哪个点
  recordPointInfo.setIndex(index);

  recordPointInfo.targetAnchorPoints = JSON.parse(
    JSON.stringify(activeInfo.anchorPoints)
  ).map((m: ICoordinate) => {
    return {
      x: m.x + x,
      y: m.y + y,
    };
  });

  // 缓存点的坐标系初始位置，转化为坐标轴上的点
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
  const {
    initPoint,
    downPoint,
    index,
    activeInfo: { sprite },
  } = recordPointInfo;

  const x = (e.clientX - downPoint.x) / p.stage.scale + +initPoint.x;
  const y = (e.clientY - downPoint.y) / p.stage.scale + +initPoint.y;

  // 设置新的锚点坐标
  recordPointInfo.setTargetAnchorPoints(index, { x, y });
  const _sprite: ISprite = JSON.parse(JSON.stringify(sprite));
  const info = default_sprite_data[_sprite.type].anchors.pointChange({
    sprite: _sprite,
    targetPointsInStage: recordPointInfo.targetAnchorPoints,
  });
  emits("anchor-point-move", info);
}

// 抬起
function handleUp() {
  emits("anchor-point-move-end", {
    // initPoint: { ...recordPointInfo.initPoint },
    // targetAnchorPoints: [...recordPointInfo.targetAnchorPoints],
    // anchorPoints: [...anchorPoints.value],
  });
  document.removeEventListener("pointerup", handleUp, false);
  document.removeEventListener("pointermove", handleMove, false);
}
</script>
