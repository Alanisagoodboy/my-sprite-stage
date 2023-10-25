<template>
  <div>
    <el-form>
      <el-form-item
        v-for="item of formList"
        :label="item.label"
        :prop="item.prop"
        :key="item.prop"
      >
        <el-input
          v-if="item.type === 'input'"
          :model-value="_.get(form, item.path, 'not-found')"
          @update:modelValue="setVal($event, item)"
        ></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { computed, watchEffect, ref } from "vue";
import { ICoordinate, ISprite, IStage } from "../../meta-data/types";
import { default_sprite_data } from "../meta-data/index";

import _ from "lodash";

const props = defineProps<{
  // 画布数据
  stage: IStage;
  // 活跃的精灵列表
  activeSpriteList: ISprite[];
}>();

const emits = defineEmits(["updateProps"]);

const formList = computed(() => {
  if (props.activeSpriteList.length === 1) {
    const sprite = props.activeSpriteList[0];
    const { type } = sprite;
    const attrsConfig = default_sprite_data[type].attrsConfig;
    return attrsConfig || [];
  } else {
    return [];
  }
});

// const form = ref({});

function setVal(value, item) {
  emits("updateProps", {
    id: form.value.id,
    path: item.path,
    value:
      typeof item.valueType === "function"
        ? item.valueType(value)
        : value,
  });
}

const form = computed(()=>{
  if (props.activeSpriteList.length === 1) {
    return props.activeSpriteList[0];
  } else {
    return {};
  }
})

// watchEffect(() => {

// });
</script>
