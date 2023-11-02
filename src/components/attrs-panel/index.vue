<template>
  <div class="panel-wrapper">
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
import { computed, inject, watchEffect, type Ref, ref } from "vue";
import { ISprite, SPRITE_NAME } from "../meta-data/types";
import { default_sprite_data } from "../meta-data/index";

// @ts-ignore
import _ from "lodash";
import {
  IClassifyItem,
  IConfigSchema,
} from "../meta-data/rect-sprite-meta/attrs-meta/types";

// const spriteList = inject<ISprite[]>("spriteList", []);
// const activeSpriteList = inject<ISprite[]>("activeSpriteList", []);

const stageApi = inject<{
  spriteList: Ref<ISprite[]>;
  activeSpriteList: Ref<ISprite[]>;
}>("stageApi", {
  spriteList: ref([]),
  activeSpriteList: ref([]),
});

const emits = defineEmits(["updateSprite"]);

// 属性配置
const attrsConfig = computed(() => {
  try {
    if (stageApi.activeSpriteList.value.length === 1) {
      const sprite = stageApi.activeSpriteList.value[0];
      const { type } = sprite;
      const attrsConfig = default_sprite_data[type].attrsConfig;
      return attrsConfig || null;
    } else if (stageApi.activeSpriteList.value.length > 1) {
      const attrsConfig = default_sprite_data[SPRITE_NAME.GROUP].attrsConfig;
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
  if (stageApi.activeSpriteList.value.length === 1) {
    return stageApi.activeSpriteList.value[0];
  } else if (stageApi.activeSpriteList.value.length > 1) {
    return { ...stageApi.activeSpriteList.value[0], id: "多个" };
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

  return finalVal;
}

// 设置传出数据
function setValueToModel(val: any, item: IConfigSchema) {
  emits("updateSprite", {
    id: stageApi.activeSpriteList.value
      .filter((f) => f.type !== SPRITE_NAME.GROUP)
      .map((m) => m.id),
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
