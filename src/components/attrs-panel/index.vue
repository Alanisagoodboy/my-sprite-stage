<template>
  <div class="panel-wrapper" v-if="attrsConfig">
    <div>id: {{ form.id }}</div>
    <el-collapse
      class="panel-content"
      :model-value="classList.map((m: IClassifyItem) => m.name)"
    >
      <el-collapse-item
        :name="col.name"
        v-for="col of classList"
        :key="col.name"
      >
        <template #title>
          <span style="margin-left: 10px"> {{ col.title }}</span>
        </template>
        <el-card shadow="hover">
          <el-form label-width="80px">
            <el-form-item
              v-for="item of col.configList"
              :label="item.label"
              :prop="item.prop"
              :key="item.prop"
            >
              <el-input
                v-if="item.renderComponent === 'input'"
                :model-value="getValueFromModel(item)"
                @update:modelValue="setValueToModel($event, item)"
              ></el-input>
              <el-input
                type="textarea"
                v-if="item.renderComponent === 'text-area'"
                :model-value="getValueFromModel(item)"
                @update:modelValue="setValueToModel($event, item)"
              ></el-input>
              <el-color-picker
                v-if="item.renderComponent === 'color-picker'"
                :model-value="getValueFromModel(item)"
                @update:modelValue="setValueToModel($event, item)"
              ></el-color-picker>
            </el-form-item>
          </el-form>
        </el-card>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ISprite, IStage } from "../meta-data/types";
import { default_sprite_data } from "../meta-data/index";

// @ts-ignore
import _ from "lodash";
import {
  IClassifyItem,
  IConfigSchema,
} from "../meta-data/rect-sprite-meta/attrs-meta/types";

const props = defineProps<{
  // 画布数据
  stage: IStage;
  // 活跃的精灵列表
  activeSpriteList: ISprite[];
}>();

const emits = defineEmits(["updateSprite"]);

// 属性配置
const attrsConfig = computed(() => {
  try {
    if (props.activeSpriteList.length === 1) {
      const sprite = props.activeSpriteList[0];
      const { type } = sprite;
      const attrsConfig = default_sprite_data[type].attrsConfig;
      return attrsConfig || null;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
});

// 分类列表
const classList = computed(() => {
  try {
    if (attrsConfig.value) {
      const { configSchemaMap, classifyList } = attrsConfig.value;
      return classifyList.map((m: IClassifyItem) => {
        return {
          ...m,
          configList: m.configList.map((n) => {
            const v: IConfigSchema = configSchemaMap[n];
            return v;
          }),
        };
      });
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
});

const form = computed(() => {
  if (props.activeSpriteList.length === 1) {
    return props.activeSpriteList[0];
  } else {
    return { id: null };
  }
});

// 获取传入数据
function getValueFromModel(item: IConfigSchema) {
  const val = _.get(form.value, item.path);
  const finalVal = item.inValFormat
    ? item.inValFormat({
        schema: item,
        value: val,
      })
    : val;

  console.log(finalVal, "finalVal");

  return finalVal;
}

// 设置传出数据
function setValueToModel(val: any, item: IConfigSchema) {
  console.log("999");

  emits("updateSprite", {
    id: form.value!.id,
    stateSet: {
      path: item.path,
      value: item.outValFormat
        ? item.outValFormat({
            schema: item,
            value: val,
          })
        : val,
    },
  });
}
</script>
<style scoped>
.panel-wrapper {
  height: 100%;
  padding: 5px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.panel-content {
  flex: 1;
  min-height: 0;
  overflow: auto;

  /* background: #000; */
}
</style>
