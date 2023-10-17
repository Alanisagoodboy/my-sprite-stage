<template>
  <svg
    data-sprite-type="stage"
    class="stage-container"
    xmlns="http://www.w3.org/2000/svg"
    :height="height"
    :width="width"
    style="outline: 1px solid #398cfe"
    ref="svgRef"
  >
    <slot />
  </svg>
</template>
<script setup lang="ts">
import { ref, provide, onMounted, onUnmounted } from "vue";
defineOptions({
  name: "NewPage",
});

defineProps({
  width: [Number, String],
  height: [Number, String],
});
const svgRef = ref<HTMLElement | null>(null);

provide("svgRef", svgRef);

// onMounted(() => {
//   document.addEventListener("pointerdown", onMousedown, false);
// });

// onUnmounted(() => {
//   document.removeEventListener("pointerdown", onMousedown, false);
// });

// /**
//  * 鼠标按下事件
//  */
//  async function onMousedown(e: MouseEvent) {
//   console.log(e.target, "e.target");

//   const spriteDom = findParentByClass(e.target, "sprite-container");
//   console.log(spriteDom, "spriteDom");

//   if (!spriteDom) return;

//   // 查找 id 点击的精灵的id
//   const id = spriteDom?.getAttribute("data-sprite-id");
//   emit("select", id);
//   // 传出事件，再等待新的props
//   await nextTick();
//   console.log(id, "id");

//   const lastDragInfo = getActiveBoxInfo();
//   dragData.value = { ...lastDragInfo };

//   console.log(dragData.value, "dragData.value");

//   isMousedown.value = true;

//   // 记录按下的位置
//   const downX = e.clientX;
//   const downY = e.clientY;

//   const onMousemove = (e: MouseEvent) => {
//     console.log("move");

//     const x = e.clientX - downX + +lastDragInfo.x;
//     const y = e.clientY - downY + +lastDragInfo.y;
//     dragData.value.x = x;
//     dragData.value.y = y;

//     emit("move", { ...dragData.value });

//     // // 吸附改动实时更新一次
//     // const _lastDragInfo = getActiveBoxInfo();
//     // dragData.value = { ..._lastDragInfo };
//   };

//   const onMouseup = (_e: MouseEvent) => {
//     // isMousedown.value = false;
//     // 移除document事件
//     document.removeEventListener("pointermove", onMousemove, false);
//     document.removeEventListener("pointerup", onMouseup, false);
//   };
//   // 位document注册鼠标移动事件
//   document.addEventListener("pointermove", onMousemove, false);
//   // 鼠标抬起事件
//   document.addEventListener("pointerup", onMouseup, false);
// }


</script>

<style lang="scss" scoped></style>
