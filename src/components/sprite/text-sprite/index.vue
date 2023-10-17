<!-- 文本精灵 -->
<template>
  <g>
    <foreignObject x="0" y="0" :width="f.width" :height="f.height">
      <div
        ref="editDivRef"
        xmlns="http://www.w3.org/1999/xhtml"
        contenteditable="true"
        spellcheck="false"
        style="width: fit-content;"
        @input="handleTextInput"
      >
        {{ '你好' }}
      </div>
    </foreignObject>
  </g>
</template>
<script setup lang="ts">
import { ISprite } from "../../meta-data/types";
import { computed, onMounted, ref } from "vue";
defineOptions({
  name: "text-sprite",
});

const props = defineProps<{
  sprite: ISprite;
}>();

const f = ref({
  width: 0,
  height: 0
})
const editDivRef = ref(null)

function autoCalcTextSize () {
  const rect = (editDivRef.value)!.getBoundingClientRect()
  f.value.height = rect.height;
  f.value.width = rect.width
}
onMounted(()=>{
  autoCalcTextSize()
})
function handleTextInput() {
  autoCalcTextSize()
}

const bind = computed(() => {
  const {  width, height} = props.sprite?.boundingBox || {};
  return {
    x: 0,
    y: 0,
    width,
    height,
    // transform: `rotate(${rotate} ${centerPoint.x} ${centerPoint.y})`,
  };
});
</script>

<style lang="scss" scoped></style>
