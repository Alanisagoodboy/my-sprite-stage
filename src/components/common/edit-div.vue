<!-- 文本组件 -->
<template>
  <div
    ref="editDivRef"
    :contenteditable="textInfo.contenteditable"
    spellcheck="false"
    :class="{
      'auto-size': sizeType === 'auto',
      'fit-content': sizeType !== 'auto',
      preview: !textInfo.contenteditable,
    }"
    @input="handleTextInput"
    @blur="handleBlur"
    v-html="content"
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
  // 尺寸类型 fit-content跟随内容大小，auto 跟随容器大小
  sizeType: "fit-content" | "auto";
}>();
const emits = defineEmits(["text-change", "size-change"]);

const textInfo = reactive({
  width: 0, // 宽
  height: 0, // 高
  content: "", // 内容
  contenteditable: false,
});
const editDivRef = ref<HTMLDivElement | null>(null);

// 自动计算文本大小
function autoCalcTextSize() {
  const rect = editDivRef.value!.getBoundingClientRect();
  textInfo.height = rect.height;
  textInfo.width = Math.max(48, rect.width);

  emits("size-change", {
    width: textInfo.width,
    height: textInfo.height,
    content: textInfo.content,
  });
}
onMounted(async () => {
  handleBlur();
});

watch(
  () => props.content,
  () => {
    textInfo.content = props.content || "&nbsp;";
  }
);

// 输入的时候，计算文本大小，并回传数据
function handleTextInput(e: any) {
  console.log("123");

  autoCalcTextSize();
  textInfo.content = e.target.innerHTML || "&nbsp;";
}

// 改变模式
function changeMode(flag: boolean) {
  textInfo.contenteditable = flag;
  if (textInfo.contenteditable) {
    autoCalcTextSize();
    nextTick(() => {
      setFocus();
    });
  } else {
    autoCalcTextSize();
  }
}

// 设置焦点
function setFocus() {
  //   editDivRef.value!.focus();
  const ele = editDivRef.value!;
  // 获取当前光标的位置
  let selection = window.getSelection();
  // 创建Range对象
  let range = document.createRange();

  // range对象选择可编辑div元素
  range.selectNodeContents(ele);
  // 移除所有的range对象
  selection!.removeAllRanges();
  // 增加当前range对象到selection选区中
  selection!.addRange(range);
  // 设置range对象开始位置
  range.setStart(ele, 1);
  // 设置range对象结束位置
  range.setEnd(ele, 1);

  // },
}

// 失去焦点
function handleBlur() {
  changeMode(false);
  emits("text-change", {
    width: textInfo.width,
    height: textInfo.height,
    content: textInfo.content || "&nbsp;",
    contenteditable: textInfo.contenteditable,
  });
}

defineExpose({
  changeMode,
  handleBlur,
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
  word-wrap: break-all;
  /* 不换行 */
  white-space: nowrap;
}

.preview {
  user-select: none;
  cursor: default;
}
</style>
