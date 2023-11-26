<template>
  <div>
    <el-select v-model="form.fontFamily" @change="handleChange">
      <el-option v-for="item in fontFamilyList" :key="item" :value="item">
        <span :style="{ 'font-family': item }">{{ item }}</span>
      </el-option>
    </el-select>
  </div>
</template>

<script setup lang="ts">

const initFontFamilyList = () => {
  const list = ["Helvetica Neue", "Helvetica", "Arial", "PingFang SC", "Hiragino Sans GB", "Heiti SC", "Microsoft YaHei", "WenQuanYi Micro Hei", 'sans-serif']
  return list
}

const props = defineProps<{
  fontFamily: string;
}>();

const emits = defineEmits(["change"]);
import { ref, watch } from "vue";

const fontFamilyList = ref(initFontFamilyList())
const form = ref({
  fontFamily: fontFamilyList.value[0],
});

watch(
  () => props.fontFamily,
  (val) => {
    form.value.fontFamily = val;
  },
  {
    immediate: true,
  }
);

function handleChange(value: string) {
  emits("change", {
    key: "fontFamily",
    value: value,
  });
}
</script>

<style scoped>
.el-radio {
  margin-right: 5px;
}
</style>
