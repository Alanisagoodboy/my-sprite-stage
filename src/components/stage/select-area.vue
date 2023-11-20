<!-- 区域选框 -->
<template>
  <rect
    v-bind="selectArea"
    stroke="#0067ed"
    strokeWidth="1"
    fill="#e6f6ff"
    :opacity="0.5"
  >
  </rect>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, inject } from "vue";
import { ISprite } from "../meta-data/types";

const props = defineProps<{
  stage: ISprite;
  spriteList: ISprite[];
}>();
const emits = defineEmits(["select-area-move"]);
const svgRef: any = inject("svgRef");
const selectArea = reactive<any>({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
});

function setSelectArea(info: any) {
  Object.keys(info).forEach((key: string) => {
    selectArea[key] = info[key];
  });
}

let stageInfo = { x: 0, y: 0, width: 0, height: 0 };

const startPoint: any = {
  x: 0,
  y: 0,
};

const endPoint: any = {
  x: 0,
  y: 0,
};

function setStartPoint(info: any) {
  for (const key in info) {
    startPoint[key] = info[key];
  }
}

function setEndPoint(info: any) {
  for (const key in info) {
    endPoint[key] = info[key];
  }
}

onMounted(() => {
  document.addEventListener("pointerdown", handleDown, false);
});
onUnmounted(() => {
  document.removeEventListener("pointerdown", handleDown, false);
});

function handleDown(e: MouseEvent) {
  if (e.ctrlKey) return;
  const spriteType = (e.target as HTMLElement).getAttribute("data-sprite-type");
  console.log(spriteType, "spriteType");

  // 如果点击不在舞台上，return
  if (spriteType !== "stage") return;
  console.log(spriteType, "spriteType");

  stageInfo = svgRef.value.getBoundingClientRect();

  setStartPoint({
    x: (e.clientX - stageInfo.x) / props.stage.attrs.scale,
    y: (e.clientY - stageInfo.y) / props.stage.attrs.scale,
  });

  setSelectArea({
    width: 0,
    height: 0,
  });

  document.addEventListener("pointerup", handleUp, false);
  document.addEventListener("pointermove", handleMove, false);
}

function handleMove(e: MouseEvent) {
  e.preventDefault();

  setEndPoint({
    x: (e.clientX - stageInfo.x) / props.stage.attrs.scale,
    y: (e.clientY - stageInfo.y) / props.stage.attrs.scale,
  });

  const minX = Math.min(startPoint.x, endPoint.x);
  const minY = Math.min(startPoint.y, endPoint.y);
  const maxX = Math.max(startPoint.x, endPoint.x);
  const maxY = Math.max(startPoint.y, endPoint.y);
  setSelectArea({
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  });

  const activeList = props.spriteList.filter((f) => {
    const { x, y, width, height } = f.boundingBox;
    return (
      selectArea.x <= x &&
      selectArea.y <= y &&
      selectArea.width + selectArea.x >= width + x &&
      selectArea.height + selectArea.y >= y + height
    );
  });

  emits("select-area-move", [...activeList]);
}

function handleUp() {
  setSelectArea({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  document.removeEventListener("pointerup", handleUp, false);
  document.removeEventListener("pointermove", handleMove, false);
}
</script>
