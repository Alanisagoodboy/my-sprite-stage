<template>
  <div class="panel-wrapper">
    <div>id: {{ form?.id }}</div>
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
              <el-input-number
                v-if="item.renderComponent === 'input-number'"
                :model-value="getValueFromModel(item)"
                @update:modelValue="setValueToModel($event, item)"
              ></el-input-number>

              <el-color-picker
                v-if="item.renderComponent === 'color-picker'"
                show-alpha
                :model-value="getValueFromModel(item)"
                @update:modelValue="setValueToModel($event, item)"
              ></el-color-picker>
              <ColorPicker
                v-if="item.renderComponent === 'color-pickers'"
                :key="form.id"
                useType="both"
                :pureColor="getValueFromModel(item).pureColor"
                :gradientColor="getValueFromModel(item).gradientColor"
                @update:pureColor="setValueToModel($event, item, 'pureColor')"
                @update:gradientColor="
                  setValueToModel($event, item, 'gradientColor')
                "
              ></ColorPicker>

              <text-justify-align
                v-bind="getValueFromModel(item)"
                @change="setValueToModel($event, item)"
                v-if="
                  item.renderComponent === ENUM_RenderComponent.textJustifyAlign
                "
              ></text-justify-align>

              <textFontFamily
                v-bind="getValueFromModel(item)"
                @change="setValueToModel($event, item)"
                v-if="
                  item.renderComponent === ENUM_RenderComponent.textFontFamily
                "
              ></textFontFamily>
            </el-form-item>
          </el-form>
        </el-card>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { ColorPicker } from "colorpickers";
import "colorpickers/style.css";
import TextJustifyAlign from "@/components/common/text-justify-align.vue";
import textFontFamily from "@/components/common/text-font-family.vue";
import { computed } from "vue";
import { ISprite, SPRITE_NAME, ENUM_RenderComponent } from "../meta-data/types";
import { default_sprite_data } from "../meta-data/index";

// @ts-ignore
import _ from "lodash";
import {
  IClassifyItem,
  IConfigSchema,
} from "../meta-data/rect-sprite-meta/attrs-meta/types";
import { findById } from "../../utils";

const props = defineProps<{
  // 画布数据
  stage: ISprite;
  // 所有精灵
  spriteList: ISprite[];
  // 活跃精灵ids Set
  activeIdsSet: Set<string>;
}>();

const emits = defineEmits(["updateSprite"]);

// 计算活跃精灵的数据
const activeSpriteList = computed(() => {
  const list: ISprite[] = [];
  props.activeIdsSet.forEach((id) => {
    const sprite = findById(props.spriteList, id);
    sprite && list.push(sprite);
  });
  return list;
});

// 属性配置
const attrsConfig = computed(() => {
  try {
    // 如果单选一个精灵，则获取其属性配置
    if (activeSpriteList.value.length === 1) {
      const { type } = activeSpriteList.value[0];
      const attrsConfig = default_sprite_data[type].attrsConfig;
      return attrsConfig;
    }
    // 如果选中多个精灵，则默认展示展示组的属性配置
    else if (activeSpriteList.value.length > 1) {
      const attrsConfig = default_sprite_data[SPRITE_NAME.GROUP].attrsConfig;
      return attrsConfig || null;
    } else {
      // 否则显示舞台的属性配置
      const attrsConfig = default_sprite_data[SPRITE_NAME.STAGE].attrsConfig;
      return attrsConfig || null;
    }
    // 其他情况不显示属性配置列表
  } catch (error) {
    return null;
  }
});

// 属性配置中的分类列表
const classList = computed(() => {
  try {
    if (attrsConfig.value) {
      const { classifyList } = attrsConfig.value;
      return classifyList;
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
});

// 表单渲染
const form = computed(() => {
  if (activeSpriteList.value.length === 1) {
    // 单个精灵时，默认展示第一个精灵的数据
    // 但第一个精灵为组的时候,默认展示组内的第一个精灵的数据
    if (activeSpriteList.value[0].type === SPRITE_NAME.GROUP) {
      const children = activeSpriteList.value[0].children!;
      return children[0];
    }
    return activeSpriteList.value[0];
  } else if (activeSpriteList.value.length > 1) {
    // 多个精灵时，默认展示第一个精灵的数据
    return { ...activeSpriteList.value[0], id: "多个" };
  } else {
    // 显示舞台
    return { ...props.stage };
  }
});

// 获取传入数据
function getValueFromModel(item: IConfigSchema) {
  // 如果是组合属性，案例说是获取不到值，，需要借助 inValFormat 函数
  const val = _.get(form.value, item.path);
  const finalVal = item.inValFormat
    ? item.inValFormat({
        schema: item,
        form: form.value,
      })
    : val;

  return finalVal;
}

// 设置传出数据
function setValueToModel(val: any, item: IConfigSchema, otherParams?: any) {
  // 如果是舞台，则更新舞台数据
  if (activeSpriteList.value.length === 0) {
    const changeState = item.outValFormat!({
      schema: item,
      value: val,
      otherParams,
    });
    Object.keys(changeState).forEach((path) => {
      const value = changeState[path];
      emits("updateSprite", {
        type: SPRITE_NAME.STAGE,
        stateSet: {
          path,
          value,
        },
      });
    });

    return;
  }
  const groupList = activeSpriteList.value.filter(
    (f) => f.type === SPRITE_NAME.GROUP
  );
  const nonGroupList = activeSpriteList.value.filter(
    (f) => f.type !== SPRITE_NAME.GROUP
  );

  // 如果是组，则更新组内第一级精灵
  // 如果是非组，则更新所有精灵
  const id = [
    ...nonGroupList.map((m) => m.id),
    ...groupList.flatMap((n) => n.children!.map((o: ISprite) => o.id)),
  ];

  if (item.outValFormat) {
    const changeState = item.outValFormat({
      schema: item,
      value: val,
      otherParams,
    });
    Object.keys(changeState).forEach((path) => {
      const value = changeState[path];
      emits("updateSprite", {
        id: id,
        stateSet: {
          path,
          value,
        },
      });
    });
  } else {
    emits("updateSprite", {
      id: id,
      stateSet: {
        path: item.path,
        value: val,
      },
    });
  }
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
