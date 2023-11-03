<template>
  <polyline
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
  findNearestSegment,
} from "../../../utils";
// import { calculateIntersectionPoin } from "../../../utils";
const p = defineProps<{
  sprite: ISprite;
}>();

const strokeWidth = 10;

const emits = defineEmits(["updateSprite"]);

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
      "updateSprite",
      {
        id: p.sprite.id,
        stateSet: {
          path: "attrs.points",
          value: newPoints,
        },
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

</script>
