<template>
  <polygon
    stroke="#999"
    :stroke-width="strokeWidth"
    fill="none"
    v-bind="bind"
    @mousedown="addPoint"
  />
</template>

<script setup lang="ts">
import { computed, inject } from "vue";
import { ICoordinate, type ISprite } from "../../../components/meta-data/types";
import {
  calculateFixPointOnLine,
  distance,
  findNearestSegment,
} from "../../../utils";
// import { calculateIntersectionPoin } from "../../../utils";
const p = defineProps<{
  sprite: ISprite;
}>();

const strokeWidth = 10;

const emits = defineEmits(["updateProps"]);

const bind = computed(() => {
  const { boundingBox } = p.sprite;
  const { width, height } = boundingBox;
  const { points } = p.sprite.attrs;
  const pointsStr = points
    .map((m: ICoordinate) => `${m.x * width},${m.y * height}`)
    .join(" ");
  return {
    points: pointsStr,
  };
});

const mode = inject("mode");

function addPoint(e: MouseEvent) {
  console.log(e, "event");

  console.log(mode.value, "mode");

  if (mode.value !== "addPoint") return;
  const { boundingBox } = p.sprite;
  const { x, y, width, height } = boundingBox;
  const { points } = p.sprite.attrs;

  const curPoint = getPointInStage(e);
  const pointsInStage = points.map((m: ICoordinate) => {
    return {
      x: m.x * width + x,
      y: m.y * height + y,
    };
  });
  const nearIndexInfo = findNearestSegment(curPoint, pointsInStage);
  // console.log(index, "a");
  console.log(nearIndexInfo, "near");

  if (nearIndexInfo) {
    const { startIndex, endIndex } = nearIndexInfo;

    const fixPoint = calculateFixPointOnLine(
      curPoint,
      pointsInStage[startIndex],
      pointsInStage[endIndex]
    );

    const curRatioPoint = {
      x: (fixPoint.x - x) / width,
      y: (fixPoint.y - y) / height,
    };
    // console.log(pointList, "hahah");
    const newPoints = JSON.parse(JSON.stringify(points));
    newPoints.splice(endIndex, 0, curRatioPoint);
    emits(
      "updateProps",
      {
        id: p.sprite.id,
        path: "attrs.points",
        value: newPoints,
      },
      {
        handleType: "mode",
        value: "",
      }
    );
  }
}

const svgRef: any = inject("svgRef");
function getPointInStage(e: any) {
  const stageInfo = svgRef.value.getBoundingClientRect();

  return {
    x: e.clientX - stageInfo.x,
    y: e.clientY - stageInfo.y,
  };
}

function findClickSideStartIndex(
  curPoint: ICoordinate,
  pointList: ICoordinate[]
) {
  console.log(pointList, "pointList");

  const index = pointList.findIndex((point, i) => {
    let prePoint = pointList[i - 1];
    if (i === 0) {
      prePoint = pointList[pointList.length - 1];
    }

    // 假设端点为A,B， 点的点是C
    // 两端点的距离
    const AB = distance(prePoint, point);
    const BC = distance(curPoint, prePoint);
    const AC = distance(curPoint, point);

    const flag = AC + BC <= Math.sqrt(AB ** 2 + (strokeWidth / 2) ** 2);
    return flag;
  });

  return index;
}

// 实现已知两个点A{x, y}, B{x, y}，现在有第三个点，求第三个点作垂线与前面两个点相交的点坐标
</script>
