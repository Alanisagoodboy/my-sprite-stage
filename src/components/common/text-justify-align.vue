<template>
  <div>
    <el-radio-group v-model="form.x" @change="handleChange($event, 'x')">
      <el-radio-button :label="'flex-start'">左</el-radio-button>
      <el-radio-button  :label="'center'">中</el-radio-button>
      <el-radio-button  :label="'flex-end'">右</el-radio-button>
    </el-radio-group>

    <el-radio-group v-model="form.y" @change="handleChange($event, 'y')">
      <el-radio-button :label="'flex-start'">上</el-radio-button>
      <el-radio-button  :label="'center'">中</el-radio-button>
      <el-radio-button  :label="'flex-end'">下</el-radio-button>
    </el-radio-group>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  x: string;
  y: string;
}>();

const emits = defineEmits(["change"]);
import { ref, watch } from "vue";
const form = ref({
  x: "center",
  y: "center",
});

watch(
  () => [props.x, props.y],
  ([x, y]) => {
    form.value.x = x;
    form.value.y = y;
  },
  {
    immediate: true,
  }
);

function handleChange(value: string, type: "x" | "y") {
  emits("change", {
    key: type,
    value: value,
  });
}
</script>

<style scoped>
.el-radio {
  margin-right: 5px;
}
</style>
