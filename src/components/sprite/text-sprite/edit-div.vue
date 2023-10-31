<!-- 文本组件 -->
<template>
  <div
    ref="editDivRef"
    xmlns="http://www.w3.org/1999/xhtml"
    :contenteditable="mode === 'edit'"
    spellcheck="false"
    :class="[sizeType === 'auto' ? 'auto-size' : 'fit-content']"
    @input="handleTextInput"
    @blur="handleBlur"
    :style="{ cursor: mode === 'edit' ? 'text' : 'default' }"
  ></div>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref, nextTick, watch } from "vue";
defineOptions({
  name: "text-div",
});

const props = defineProps<{
  // 文本内容
  content: any;
  // 尺寸类型 fit-content跟随内容大小，auto 固定大小
  sizeType: "fit-content" | "auto";
}>();
const emits = defineEmits(["text-change", "size-change"]);

const mode = ref<"edit" | "view">("view");

const textInfo = reactive({
  width: 0,
  height: 0,
  content: "",
});
const editDivRef = ref<HTMLDivElement | null>(null);

// 自动计算文本大小
function autoCalcTextSize() {
  const rect = editDivRef.value!.getBoundingClientRect();
  textInfo.height = rect.height;
  textInfo.width = Math.max(48, rect.width);
}
onMounted(async () => {
  //   首次进入预览模式
  //   await nextTick();
  changeMode("view");
});

watch(
  () => props.content,
  () => {
    if (mode.value === "view") {
      changeMode("view");
    }
  }
);

// 输入的时候，计算文本大小，并回传数据
function handleTextInput(e: any) {
  textRender(e.target.innerHTML, false);
}

// 改变模式
function changeMode(modeType: "edit" | "view") {
  if (modeType === "edit") {
    mode.value = "edit";
    textRender(props.content, true);
    nextTick(() => {
      setFocus();
    });
  } else {
    mode.value = "view";
    textRender(props.content, true);
  }
}

function textRender(
  content: string = props.content,
  updateInner: boolean = false
) {
  // 等待渲染
  //   await nextTick();
  if (updateInner) {
    editDivRef.value!.innerHTML = content;
  }
  textInfo.content = content;

  autoCalcTextSize();
  emits("text-change", {
    width: textInfo.width,
    height: textInfo.height,
    content: textInfo.content,
    mode: mode.value,
  });
}

// 设置焦点
function setFocus() {
  //   editDivRef.value!.focus();
  let srcObj = editDivRef.value;
  // 获取当前光标的位置
  let selection = window.getSelection();
  // 创建Range对象
  let range = document.createRange();
  
  // range对象选择可编辑div元素
  range.selectNodeContents(srcObj);
  // 移除所有的range对象
  selection.removeAllRanges();
  // 增加当前range对象到selection选区中
  selection.addRange(range);
  // 设置range对象开始位置
  range.setStart(srcObj, 1);
  // 设置range对象结束位置
  range.setEnd(srcObj, 1);

  // },
}

// 失去焦点
function handleBlur() {
  changeMode("view");
}

defineExpose({
  changeMode,
});
</script>

<style scoped>
.auto-size {
  width: 100%;
  height: 100%;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  outline: none;
  word-break: break-all;
}

.fit-content {
  display: inline-block;
  white-space: nowrap;
  outline: none;
}
</style>
