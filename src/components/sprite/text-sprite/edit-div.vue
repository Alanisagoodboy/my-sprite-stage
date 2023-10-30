<!-- 文本组件 -->
<template>
  <g>
    <foreignObject
      x="0"
      y="0"
      :width="textInfo.width"
      :height="textInfo.height"
      @dblclick="toEditMode"
    >
      <div
        v-if="mode === 'edit'"
        ref="editDivRef"
        xmlns="http://www.w3.org/1999/xhtml"
        contenteditable="true"
        spellcheck="false"
        class="text"
        @input="handleTextInput"
        @blur="handleBlur"
      ></div>
      <div v-else class="text" v-html="content"></div>
    </foreignObject>
  </g>
</template>
<script setup lang="ts">
import { nextTick, onMounted, reactive, ref } from "vue";
defineOptions({
  name: "text-sprite",
});

const props = defineProps<{
  content: any;
  width: number;
  height: number;
}>();
const emits = defineEmits(["text-change", "size-change"]);

const mode = ref("edit");

const textInfo = reactive({
  width: 0,
  height: 0,
  content: "",
});
const editDivRef = ref(null);

function autoCalcTextSize() {
  const rect = editDivRef.value!.getBoundingClientRect();
  textInfo.height = rect.height;
  textInfo.width = Math.max(48, rect.width);
}
onMounted(async () => {
  await nextTick();
  initTextInfo();
});
function handleTextInput(e: any) {
  textInfo.content = e.target.innerHTML;
  autoCalcTextSize();

  emits("size-change", { width: textInfo.width, height: textInfo.height });
}

async function initTextInfo() {
  textInfo.content = props.content || " ";
  await nextTick();
  autoCalcTextSize();
  emits("size-change", { width: textInfo.width, height: textInfo.height });
  emits("text-change", textInfo.content);
}

async function toEditMode() {
  if (mode.value !== "edit") {
    mode.value = "edit";
    // 等待渲染
    await nextTick();

    editDivRef.value!.innerHTML = `${props.content}` || " ";

    editDivRef.value!.focus();
  }
}

// 失去焦点
function handleBlur() {
  mode.value = "view";
  emits("text-change", textInfo.content);
}
</script>

<style scoped>
.text {
  display: inline-block;
  white-space: nowrap;
}
</style>
