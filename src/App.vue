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
      </div>
    </div>
    <div class="content">
      <div class="left"></div>
      <div class="center">
        <Stage :width="stage.width" :height="stage.height">
          <!-- 网格线 -->
          <GridLine
            :width="stage.width"
            :height="stage.height"
            :spacing="50"
          ></GridLine>

          <!-- 精灵容器 -->
          <SpriteContainer
            v-for="sprite of spriteList"
            :sprite="sprite"
            :key="sprite.id"
          >
            <component
              :is="registerSpriteMetaMap[sprite.type].component"
              :sprite="sprite"
            ></component>

            <!-- 在精灵容器中加入锚点渲染器 -->
            <AnchorPoints
              :spriteList="spriteList"
              :sprite="sprite"
              @select="select"
              @anchor-point-move="handleAnchorPointMove"
            />
          </SpriteContainer>

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

          <!-- 选框 -->
          <selectArea
            v-if="false"
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
import SpriteContainer from "./components/sprite/sprite-container.vue";
import ActiveSpritesContainer from "./components/sprite/active-sprites-container.vue";
import AnchorPoints from "./components/stage/anchor-point/anchor-points.vue";
import GridLine from "./components/stage/grid-line.vue";
import selectArea from "./components/stage/select-area.vue";
import AuxiliaryLine from "./components/stage/auxiliary-line.vue";

import { ref, computed, shallowRef, provide, reactive } from "vue";

import { default_sprite_data } from "./components/meta-data/index";

import {
  IBoxMove,
  ISprite,
  ISpriteMeta,
  SPRITE_NAME,
} from "./components/meta-data/types";
import { HANDLER, IBox } from "./utils/types";
import { getAuxiliaryLine, handleAdsorb } from "./utils";

const componentList = Object.values(default_sprite_data).map((m) => {
  return {
    name: m.type,
    title: m.title,
  };
});

// 舞台信息
const stage = reactive({
  width: 800,
  height: 400,
});
// 精灵列表
const spriteList = reactive<ISprite[]>([]);
// 活跃（被选中）状态的精灵列表
const activeSpriteList = ref<Array<ISprite>>([]);

// 已经注册的精灵map
const registerSpriteMetaMap: any = shallowRef({});

// 对齐线
const auxiliaryLineList = ref<any[]>([]);

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

  const _data = spriteMeta.createInitData();
  const sprite = {
    ..._data,
    id: name + Math.random(),
  };
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
  Object.assign(find, info.sprite);

  // 如果是圆角矩形
  // if (sprite.type === SPRITE_NAME.ROUND_RECT) {
  //   // 根据锚点最新位置计算圆角大小
  //   const { boundingBox } = sprite;
  //   const { width, height } = boundingBox;
  //   const len = Math.min(width, height);
  //   const x = Math.max(0, Math.min(len / 2, info.x));
  //   const borderRadius = (100 * x) / len;
  //   sprite.attrs.borderRadius = borderRadius;
  // }
}

// 锚点移动结束
// function handleAnchorPointMoveEnd(info: any) {}

function getBoxInfoByPoint(point: { x: number; y: number }[]) {
  const xList = point.map((m) => m.x);
  const yList = point.map((m) => m.y);

  const minX = Math.min(...xList);
  const maxX = Math.max(...xList);
  const minY = Math.min(...yList);
  const maxY = Math.max(...yList);

  // console.log({ minX, maxY, maxX, minY });

  return {
    x: +minX,
    y: +minY,
    width: +maxX - +minX,
    height: +maxY - +minY,
    rotate: 0,
  };
}

/**
 *
 */
function handleSelectAreaMove(activeList: ISprite[]) {
  activeSpriteList.value = [...activeList];
  console.log(activeSpriteList.value, "activeList");
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
