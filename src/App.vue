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
        <Stage width="800" height="400">
          <!-- 网格线 -->
          <GridLine :width="800" :height="400" :spacing="50"></GridLine>

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
              :sprite="sprite"
              @select="handleSelect"
              @anchor-point-move="handleAnchorPointMove"
            />
          </SpriteContainer>

          <!-- 辅助线 -->
          <!-- <line
          v-for="line of auxiliaryLineList"
          :key="JSON.stringify(line)"
          v-bind="line"
          stroke="#0067ed"
          strokeDasharray="4 4"
        ></line> -->

          <!-- 活跃的精灵容器：提供移动旋转缩放选中的能力 -->
          <ActiveSpritesContainer
            v-if="activeSpriteList.length"
            :activeSpriteList="activeSpriteList"
            :spriteList="spriteList"
            :registerSpriteMetaMap="registerSpriteMetaMap"
            @move="move"
            @rotate="rotate"
            @resize="resize"
            @select="handleSelect"
          ></ActiveSpritesContainer>

          <!-- 选框 -->
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
import SpriteContainer from "./components/sprite/sprite-container.vue";
import ActiveSpritesContainer from "./components/sprite/active-sprites-container.vue";
import AnchorPoints from "./components/stage/anchor-point/anchor-points.vue";
import GridLine from "./components/stage/grid-line.vue";
import selectArea from "./components/stage/select-area.vue";

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
// 精灵列表
const spriteList = reactive<ISprite[]>([]);
// 活跃（被选中）状态的精灵列表
const activeSpriteList = ref<Array<ISprite>>([]);

// 已经注册的精灵map
const registerSpriteMetaMap: any = shallowRef({});

// 对齐线
const auxiliaryLineList = ref<any[]>([]);

// 不活跃的数据
const inactiveList = computed(() => {
  return spriteList
    .filter((item) => activeSpriteList.value.find((f) => f.id !== item.id))
    .map((m) => {
      return {
        ...m.boundingBox,
      };
    });
});

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
function updateSpriteList(info: IBoxMove, downPointActiveList: ISprite[]) {
  activeSpriteList.value.forEach((item: ISprite, index: number) => {
    item.boundingBox.x = downPointActiveList[index].boundingBox.x + info.dx;
    item.boundingBox.y = downPointActiveList[index].boundingBox.y + info.dy;
    // item.boundingBox.width = info.width;
    // item.boundingBox.height = info.height;
  });
}

function move(info: IBoxMove, downPointActiveList: ISprite[]) {
  updateSpriteList(info, downPointActiveList);

  // updateSpriteList(info);

  // const { lines, dx, dy } = getAuxiliaryLine(
  //   { distance: 0 },
  //   { ...info },
  //   inactiveList.value,
  //   { width: 800, height: 400 },
  //   {}
  // );
  // auxiliaryLineList.value = lines;

  // const newInfo = handleAdsorb({
  //   rect: { ...info },
  //   dx,
  //   dy,
  //   mode: "move",
  // });
  // console.log(newInfo, "newInfo");

  // updateSpriteList({ ...newInfo });
}

function rotate(info: IBox) {
  // updateSpriteList(info);
}

function resize(info: any, handleType: HANDLER) {
  // console.log(handleType);
  const { offset, downPointActiveList, percent } = info;
  // console.log("downPointActiveList", percent, downPointActiveList);

  activeSpriteList.value.forEach((item: ISprite, index: number) => {
    item.boundingBox.x = downPointActiveList[index].boundingBox.x +offset.x;
    item.boundingBox.y = downPointActiveList[index].boundingBox.y +offset.y;
    item.boundingBox.width =
      downPointActiveList[index].boundingBox.width +offset.width;
    item.boundingBox.height =
      downPointActiveList[index].boundingBox.height +offset.height;
    // item.boundingBox.x = downPointActiveList[index].boundingBox.x * percent.x;
    // item.boundingBox.y = downPointActiveList[index].boundingBox.y * percent.y;
    // item.boundingBox.width =
    //   downPointActiveList[index].boundingBox.width * percent.width;
    // item.boundingBox.height =
    //   downPointActiveList[index].boundingBox.height * percent.height;
  });

  // const { lines /* , dx, dy  */ } = getAuxiliaryLine(
  //   { distance: 0 },
  //   { ...info },
  //   inactiveList.value,
  //   { width: 600, height: 800 },
  //   {}
  // );
  // auxiliaryLineList.value = lines;

  // // const newInfo = handleAdsorb({
  // //   rect: { ...info },
  // //   dx,
  // //   dy,
  // //   mode: "move",
  // //   resizePos: handleType,
  // // });
  // // console.log(newInfo, "newInfo");

  // updateSpriteList({ ...info });
}

// 选中精灵 时 根据id找到当前点击的精灵的信息
function handleSelect(id: string) {
  // 如果本身就在活跃的精灵列表中
  const findInActive = activeSpriteList.value.find((f) => f.id === id);

  console.log(findInActive, "findInActive");

  if (findInActive) return;
  // 否则在全局精灵列表中寻找
  const findInAll = spriteList.find((f) => f.id === id);
  console.log(findInAll, "findInAll");

  if (findInAll) {
    activeSpriteList.value = [findInAll];
  }
}

// 锚点移动时 待优化 todo
function handleAnchorPointMove(info: any) {
  const sprite = spriteList.find((f) => f.id === info.id);
  if (!sprite) return;
  // 如果是线段锚点
  if ([SPRITE_NAME.LINE, SPRITE_NAME.POLYLINE].includes(sprite.type)) {
    const preNode = info.targetAnchorPoints.map(
      (m: { x: number; y: number }) => {
        return {
          x: m.x + info.ltInfoInStage.x,
          y: m.y + info.ltInfoInStage.y,
        };
      }
    );
    const boxInfo = getBoxInfoByPoint(preNode);

    sprite.boundingBox.x = boxInfo.x;
    sprite.boundingBox.y = boxInfo.y;
    sprite.boundingBox.height = boxInfo.height;
    sprite.boundingBox.width = boxInfo.width;

    const ltDiff = {
      x: boxInfo.x - info.ltInfoInStage.x,
      y: boxInfo.y - info.ltInfoInStage.y,
    };

    const points = info.targetAnchorPoints.map((m) => {
      return {
        x: m.x - ltDiff.x,
        y: m.y - ltDiff.y,
      };
    });
    sprite.attrs.points = points;
  }

  // 如果是圆角矩形
  if (sprite.type === SPRITE_NAME.ROUND_RECT) {
    // 根据锚点最新位置计算圆角大小
    const { boundingBox } = sprite;
    const { width, height } = boundingBox;
    const len = Math.min(width, height);
    const x = Math.max(0, Math.min(len / 2, info.x));
    const borderRadius = (100 * x) / len;
    sprite.attrs.borderRadius = borderRadius;
  }
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
