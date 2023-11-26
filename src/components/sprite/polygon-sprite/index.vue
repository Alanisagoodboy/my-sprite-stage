<template>
  <g>
    <polygon v-bind="bind" />
    <!-- 定义单组线性渐变 -->
    <DefsSvgLinearGradient :computed-gradient="computedGradient" />
  </g>
</template>

<script setup lang="ts">
import { computed, inject } from "vue";
import { ICoordinate, type ISprite } from "../../../components/meta-data/types";
import DefsSvgLinearGradient from "@/components/common/defs-svg-linear-gradient.vue";
import useComputedGradient from "@/hooks/useComputedGradient";
import {
  calculateFixPointOnLine,
  distance,
  findNearestSegment,
} from "../../../utils";
// import { calculateIntersectionPoin } from "../../../utils";
const props = defineProps<{
  sprite: ISprite;
}>();

const emits = defineEmits(["updateSprite"]);
const { computedGradient } = useComputedGradient(props);
const bind = computed(() => {
  const { boundingBox } = props.sprite;
  const { width, height } = boundingBox;
  const { points, fill, gradientFill, stroke, strokeWidth, ...restAttrs } =
    props.sprite.attrs;
  const pointsStr = points
    .map((m: ICoordinate) => `${m.x * width},${m.y * height}`)
    .join(" ");
  return {
    points: pointsStr,
    fill: gradientFill
      ? `url(#${computedGradient.value?.linearGradient.id})`
      : fill,
    stroke,
    "stroke-width": strokeWidth,
    ...restAttrs,
  };
});

// const mode = inject("mode");

// function addPoint(e: MouseEvent) {
//   console.log(e, "event");

//   console.log(mode.value, "mode");

//   if (mode.value !== "addPoint") return;
//   const { boundingBox } = p.sprite;
//   const { x, y, width, height } = boundingBox;
//   const { points } = p.sprite.attrs;

//   const curPoint = getPointInStage(e);
//   const pointsInStage = points.map((m: ICoordinate) => {
//     return {
//       x: m.x * width + x,
//       y: m.y * height + y,
//     };
//   });
//   const nearIndexInfo = findNearestSegment(curPoint, pointsInStage);
//   // console.log(index, "a");
//   console.log(nearIndexInfo, "near");

//   if (nearIndexInfo) {
//     const { startIndex, endIndex } = nearIndexInfo;

//     const fixPoint = calculateFixPointOnLine(
//       curPoint,
//       pointsInStage[startIndex],
//       pointsInStage[endIndex]
//     );

//     const curRatioPoint = {
//       x: (fixPoint.x - x) / width,
//       y: (fixPoint.y - y) / height,
//     };
//     // console.log(pointList, "hahah");
//     const newPoints = JSON.parse(JSON.stringify(points));
//     newPoints.splice(endIndex, 0, curRatioPoint);
//     emits(
//       "updateSprite",
//       {
//         id: p.sprite.id,
//         stateSet: {
//           path: "attrs.points",
//           value: newPoints,
//         },
//       },
//       {
//         handleType: "mode",
//         value: "",
//       }
//     );
//   }
// }

// const svgRef: any = inject("svgRef");
// function getPointInStage(e: any) {
//   const stageInfo = svgRef.value.getBoundingClientRect();

//   return {
//     x: e.clientX - stageInfo.x,
//     y: e.clientY - stageInfo.y,
//   };
// }
</script>
