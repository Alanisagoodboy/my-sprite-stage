<template>
  <path :d="d" v-bind="style" />
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps({
  width: Number,
  height: Number,
  spacing: Number,
});

const style = {
  stroke: "#777",
  strokeWidth: 1,
  strokeDasharray: "none",
};

const d = ref("");

const { xLines, yLines } = getLines(
  props.width || 600,
  props.height || 600,
  props.spacing || 50
);
const lines = [...xLines, ...yLines];
const path = lines.map((line: any) => getPath(line)).join(" ");

d.value = path

// 把网格线转化成path路径
function getPath(line: any) {
  return `M${line.x1},${line.y1} L${line.x2},${line.y2}`;
}

// 计算网格线
function getLines(width: number, height: number, spacing: number) {
  const getLineList = (size: number, spacing: number) => {
    const length = Math.floor(size / spacing);
    return new Array(length)
      .fill(1)
      .map((_: any, index: number) => [0, size, index * spacing]);
  };
  const xLines = getLineList(height, spacing).map((arr: number[]) => ({
    x1: 0,
    y1: arr[2],
    x2: width,
    y2: arr[2],
  }));
  const yLines = getLineList(width, spacing).map((arr: number[]) => ({
    x1: arr[2],
    y1: 0,
    x2: arr[2],
    y2: height,
  }));
  // console.log(xLines, yLines, "xLines, yLines ");

  return { xLines, yLines };
}
</script>
