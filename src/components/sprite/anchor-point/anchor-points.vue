<template>
  <g>
    <circle
      r="3"
      :cx="item.x"
      :cy="item.y"
      v-for="(item, index) of anchorPoints"
      :key="index"
      @pointerdown="handleDown($event, index)"
    ></circle>
  </g>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ISprite } from "../../meta-data/types";
import { default_sprite_data } from "../../meta-data";

const p = defineProps<{
  sprite: ISprite;
}>();

const emits = defineEmits(["anchor-point-move", 'select']);

// 渲染的锚点信息
const anchorPoints = computed(() => {
  const sprite = p.sprite;
  const metaData = default_sprite_data[sprite.type];
  const { anchors } = metaData;
  if (anchors) {
    return anchors.getPoints({ sprite });
  }
  return [];
});


// 初始化 记录的点坐标
let recordPointInfo = {
  initPoint: {
    x: 0,
    y: 0,
  },
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

  setIndex(index: number) {
    this.index = index;
  },

  setInitAnchorPoints (index: number, point: { x: number; y: number }) {
    this.initAnchorPoints[index] = point
  }
};

// 按下
function handleDown(e: MouseEvent, index: number) {
  // 阻止冒泡 防止触发移动事件
  e.stopPropagation();
  emits("select", p.sprite.id)
  // 记录此时的坐标信息
console.log('--');

  // 记录操作的是哪个点
  recordPointInfo.setIndex(index)

  // 缓存点的坐标系初始位置
  recordPointInfo.setInitPoint({
    x: anchorPoints.value[index].x,
    y: anchorPoints.value[index].y,
  });

  // 记录鼠标按下视口坐标系的位置
  recordPointInfo.setDownPoint({
    x: e.clientX,
    y: e.clientY,
  });

  document.addEventListener("mousemove", handleMove, false);
  document.addEventListener("mouseup", handleUp, false);
}

// 移动
function handleMove(e: MouseEvent) {
  console.log('k');
  
  const { initPoint, downPoint, index } = recordPointInfo;
  const x = e.clientX - downPoint.x + +initPoint.x;
  const y = e.clientY - downPoint.y + +initPoint.y;

  // 锚点移动事件 抛给父组件
  recordPointInfo.setInitAnchorPoints(index, {x, y})
  emits("anchor-point-move", { x, y, index, anchorPoints: recordPointInfo.initAnchorPoints });
}

// 抬起
function handleUp() {
  document.removeEventListener("mousemove", handleMove, false);
  document.removeEventListener("mouseup", handleUp, false);
}
</script>
