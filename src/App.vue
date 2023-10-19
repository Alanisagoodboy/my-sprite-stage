<template>
  <div class="editor-container">
    <div class="header">
      <div class="header-bar">
        <ul class="ul">
          <li
            class="li"
            v-for="item of componentList"
            @click="addSpriteToStage(item)"
          >
            {{ item.title }}
          </li>
        </ul>

        <button @click="handleGroup">组合</button>
        <button @click="handleCancelGroup">解组</button>
      </div>
    </div>
    <div class="content">
      <div class="left"></div>
      <div class="center">
        <Stage :width="stage.width" :height="stage.height">
          <!-- 网格线 -->
          <GridLines
            :width="stage.width"
            :height="stage.height"
            :spacing="50"
          ></GridLines>

          <!-- 精灵树渲染 -->
          <SpriteTree
            :spriteList="spriteList"
            :registerSpriteMetaMap="registerSpriteMetaMap"
          ></SpriteTree>

          <!-- 辅助线 -->
          <AuxiliaryLine :lineList="auxiliaryLineList" />

          <!-- 活跃的精灵容器：提供移动旋转缩放选中的能力 -->
          <ActiveSpritesContainer
            v-show="activeSpriteList.length"
            :stageSize="{ width: stage.width, height: stage.height }"
            :activeSpriteList="activeSpriteList"
            :spriteList="spriteList"
            :registerSpriteMetaMap="registerSpriteMetaMap"
            @move="move"
            @rotate="rotate"
            @resize="resize"
            @select="select"
          />

          <!-- 锚点渲染器: 为线条或者部分图形增加辅助功能 -->
          <AnchorPoints
            :activeSpriteList="activeSpriteList"
            @select="select"
            @anchor-point-move="handleAnchorPointMove"
          />

          <!-- 选框: 用于多选 -->
          <selectArea
            :spriteList="spriteList"
            @select-area-move="handleSelectAreaMove"
          />
        </Stage>
      </div>
      <div class="right"></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import Stage from "./components/stage/index.vue";
// import SpriteContainer from "./components/sprite/sprite-container.vue";
import SpriteTree from "./components/sprite/sprite-tree.vue";
import ActiveSpritesContainer from "./components/sprite/active-sprites-container.vue";
import AnchorPoints from "./components/stage/anchor-point/anchor-points.vue";
import GridLines from "./components/stage/grid-line.vue";
import selectArea from "./components/stage/select-area.vue";
import AuxiliaryLine from "./components/stage/auxiliary-line.vue";

import { ref, shallowRef, provide, reactive } from "vue";

import { default_sprite_data } from "./components/meta-data/index";

import { getWrapperBoxInfo } from "./utils/index.ts";

import {
  ISprite,
  ISpriteMeta,
  SPRITE_NAME,
} from "./components/meta-data/types";

const componentList = Object.values(default_sprite_data).map((m) => {
  return {
    name: m.type,
    title: m.title,
  };
});

// 舞台信息
const stage = reactive({
  width: 800,
  height: 600,
});
// 精灵列表
const a = {
  id: "0.6850321120002762",
  type: "GroupSprite",
  attrs: { fill: "#eee" },
  boundingBox: {
    x: 50,
    y: 200,
    width: 200,
    height: 200,
  },
  children: [
    {
      id: "0.5809304020102564",
      type: "RectSprite",
      attrs: { fill: "#eee" },
      boundingBox: { x: 100, y: 100, width: 160, height: 100 },
    },
    {
      id: "0.8790513958246835",
      type: "RectSprite",
      attrs: { fill: "#eee" },
      boundingBox: {
        x: 210.40000915527344,
        y: 235.99998474121094,
        width: 160,
        height: 100,
      },
    },
  ],
};
const spriteList = reactive<ISprite[]>([]);
// 活跃（被选中）状态的精灵列表
const activeSpriteList = ref<Array<ISprite>>([]);

// 已经注册的精灵map
const registerSpriteMetaMap: any = shallowRef({});

// 对齐线
const auxiliaryLineList = ref<any[]>([]);

// const boundingRectInfo = computed()

/**
 *
 * 注册精灵
 */

function registerSprite(spriteMeta: ISpriteMeta) {
  if (registerSpriteMetaMap.value?.[spriteMeta.type]) {
    console.warn(`Sprite ${spriteMeta.type} 已经注册`);
    return;
  }
  registerSpriteMetaMap.value[spriteMeta.type] = spriteMeta;
}

/**
 * 添加精灵到画布
 * @param {ISprite | ISprite[]} sprite
 */
function addSpriteToStage({ name }: { name: SPRITE_NAME }) {
  const spriteMeta = default_sprite_data[name];
  console.log(spriteMeta, "spriteMeta");

  registerSprite(spriteMeta);

  const sprite = spriteMeta.createInitData();
  // if (Array.isArray(sprite)) {
  //   // spriteList.push(...sprite);
  // } else {
  spriteList.push(sprite);
  activeSpriteList.value = [sprite];
  // }
}

/**
 * 更新精灵列表
 */
function updateSpriteList(info: any) {
  const { target, lines = [] } = info;
  activeSpriteList.value.forEach((item: ISprite, index: number) => {
    item.boundingBox.x = target[index].x;
    item.boundingBox.y = target[index].y;
    item.boundingBox.width = target[index].width;
    item.boundingBox.height = target[index].height;
  });
  auxiliaryLineList.value = lines;
}

function move(info: any) {
  updateSpriteList(info);
}

function rotate(info: any) {
  updateSpriteList(info);
}

function resize(info: any) {
  updateSpriteList(info);
}

// 选中精灵 时 根据id找到当前点击的精灵的信息
function select(info: any) {
  const { target } = info;
  console.log(target, "target");
  if (target) {
    activeSpriteList.value = target;
  }
}

// 锚点移动时 待优化 todo
function handleAnchorPointMove(info: any) {
  const find = spriteList.find((f) => f.id === info.id);
  if (find) {
    Object.assign(find, info.sprite);
  }
}

// 锚点移动结束
// function handleAnchorPointMoveEnd(info: any) {}

/**
 *
 */
function handleSelectAreaMove(activeList: ISprite[]) {
  activeSpriteList.value = [...activeList];
  console.log(activeSpriteList.value, "activeList");
}

// 组合
function handleGroup() {
  // 1.组合只针对被选中的精灵
  const groupMeta = default_sprite_data[SPRITE_NAME.GROUP];
  registerSprite(groupMeta);
  const groupSpriteData = groupMeta.createInitData(
    activeSpriteList.value.map((m) => m.boundingBox)
  );
  const { x, y } = groupSpriteData.boundingBox;
  groupSpriteData.children.push(
    ...activeSpriteList.value.map((m) => {
      return {
        ...m,
        boundingBox: {
          x: m.boundingBox.x - x,
          y: m.boundingBox.y - y,
          width: m.boundingBox.width,
          height: m.boundingBox.height,
        },
      };
    })
  );

  for (let i = spriteList.length - 1; i >= 0; i--) {
    if (activeSpriteList.value.find((f) => f.id === spriteList[i].id))
      spriteList.splice(i, 1);
  }
  activeSpriteList.value = [groupSpriteData];
  spriteList.push(groupSpriteData);
}

/**
 * 解组
 * 解除最最近的一个组
 * 对应的数据是
 */

function handleCancelGroup() {
  // 如果被选中的是一个并且是组
  if (activeSpriteList.value.length === 1) {
    const groupSpriteData = activeSpriteList.value[0];
    if (groupSpriteData.children.length > 0) {
      const { x, y } = groupSpriteData.boundingBox;
      const filter = groupSpriteData.children
        .filter((f) => !f.children)
        .map((m) => {
          return {
            ...m,
            boundingBox: {
              x: m.boundingBox.x + x,
              y: m.boundingBox.y + y,
              width: m.boundingBox.width,
              height: m.boundingBox.height,
            },
          };
        });

      console.log(filter, "filter");

      for (let i = groupSpriteData.children.length - 1; i >= 0; i--) {
        if (filter.find((f) => f.id === groupSpriteData.children[i].id))
          groupSpriteData.children.splice(i, 1);
      }

      if (groupSpriteData.children.length === 0) {
        console.log(groupSpriteData, "groupSpriteData");

        const aIndex = spriteList.findIndex((f) => f.id === groupSpriteData.id);
        spriteList.splice(aIndex, 1);

        const bIndex = activeSpriteList.value.findIndex(
          (f) => f.id === groupSpriteData.id
        );
        activeSpriteList.value.splice(bIndex, 1);
        console.log(aIndex, bIndex, "k");
      } else {
        const newBoundingBoxList = groupSpriteData.children.map((m) => {
          return {
            ...m.boundingBox,
            x: m.boundingBox.x + groupSpriteData.boundingBox.x,
            y: m.boundingBox.y + groupSpriteData.boundingBox.y,
          };
        });

        console.log(newBoundingBoxList, "newBoundingBoxList");
        const newBoundingBox = getWrapperBoxInfo(newBoundingBoxList);
        console.log(newBoundingBox, "newBoundingBox");

        groupSpriteData.boundingBox = newBoundingBox;
        groupSpriteData.children.forEach((f) => {
          f.boundingBox.x -= newBoundingBox.x;
          f.boundingBox.y -= newBoundingBox.y;
        });

        console.log(groupSpriteData, "groupSpriteData");
      }

      spriteList.push(...filter);
      activeSpriteList.value.push(...filter);
    }
  }
}

// 向后代注入当前注册的精灵信息
provide("registerSpriteMetaMap", registerSpriteMetaMap);

defineOptions({
  name: "NewPage",
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
}
#app,
html,
body {
  width: 100%;
  height: 100%;
}

.editor-container {
  width: 100%;
  height: 100%;
  background-color: #f0f2f5;
}

.header {
  height: 80px;
}

.header-bar {
  height: 30px;
  line-height: 30px;
  width: 80%;
  background-color: #fff;
  margin: auto;
}

.ul {
  display: inline-flex;
  align-items: center;
}
.li {
  border: 1px solid #398cfe;
  list-style: none;
  margin-right: 2px;
}

.content {
  height: calc(100% - 80px);
  display: flex;
}

.center {
  flex: 1;

  display: flex;
  justify-content: center;
  align-items: center;
}

.left {
  /* background-color: aqua; */
  width: 300px;
  height: 100%;
}

.right {
  /* background-color: bisque; */
  width: 300px;
  height: 100%;
}
</style>
