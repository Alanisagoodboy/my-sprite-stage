<template>
  <div class="editor-container">
    <div class="header">
      <div class="header-bar">
        <button @click="handleGroup">组合</button>
        <button @click="handleCancelGroup">解组</button>
      </div>
    </div>
    <div class="content">
      <div class="left">
        <div style="height: 50%; background-color: aqua" v-split.bottom>2</div>
        <div style="height: 50%; background-color: bisque">1</div>
      </div>
      <div class="center">
        <ul class="ul" @dragstart="handleDragStart">
          <li
            class="li"
            v-for="item of componentList"
            :draggable="true"
            :data-index="item.name"
          >
            {{ item.title }}
          </li>
        </ul>
        <div>
          <Stage
            ref="stageRef"
            v-bind="stage"
            @stage-scale="handleScale"
            @drop="handleDrop"
            @dragover="handleDragOver"
          >
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
              :stage="stage"
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

            <!-- 工具栏渲染器 -->
            <Toolbar :activeSpriteList="activeSpriteList"></Toolbar>
            <!-- 选框: 用于多选 -->
            <SelectArea
              :stage="stage"
              :spriteList="spriteList"
              @select-area-move="handleSelectAreaMove"
            />
          </Stage>
        </div>
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
import SelectArea from "./components/stage/select-area.vue";
import AuxiliaryLine from "./components/stage/auxiliary-line.vue";
import Toolbar from "./components/sprite/toolbar-sprite.vue";

import { ref, shallowRef, provide, reactive } from "vue";

import { resize as x } from "./directive";

import { default_sprite_data } from "./components/meta-data/index";

// import { getCoordinateInStage } from "../../"

const vSplit = x;
import {
  ICoordinate,
  ISprite,
  ISpriteMeta,
  SPRITE_NAME,
} from "./components/meta-data/types";
import { getCoordinateInStage } from "./utils";

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
  scale: 1.2,
});

const stageRef = ref<InstanceType<typeof Stage> | null>(null);
// 精灵列表
const spriteList = ref<ISprite[]>([]);
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

// 选取拖拽精灵
function handleDragStart(e: DragEvent) {
  // if (e instanceof HTMLElement) {
  e.dataTransfer.setData("index", e.target.dataset.index);
  // }
}

function handleDragOver(e: DragEvent) {
  e.preventDefault();
}

// 放入精灵到舞台
function handleDrop(e: DragEvent) {
  e.preventDefault();
  e.stopPropagation();
  console.log(e, "e.dataTransfer");

  const name = e.dataTransfer.getData("index") as SPRITE_NAME;
  console.log(name, "kkk");

  addSpriteToStage({
    name,
    point: {
      x: e.clientX,
      y: e.clientY,
    },
  });
}

/**
 * 添加精灵到画布
 * @param {ISprite | ISprite[]} sprite
 */
function addSpriteToStage({
  name,
  point,
}: {
  name: SPRITE_NAME;
  point: ICoordinate;
}) {
  const spriteMeta = default_sprite_data[name];
  registerSprite(spriteMeta);
  const sprite = spriteMeta.createInitData();
  const _point = getCoordinateInStage(
    stageRef.value!.svgRef as HTMLElement,
    point,
    stage.scale
  );
  sprite.boundingBox.x = _point.x;
  sprite.boundingBox.y = _point.y;
  spriteList.value.push(sprite);
  activeSpriteList.value = [sprite];
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
  const find = spriteList.value.find((f) => f.id === info.id);
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
  // 2.针对选中的元素计算出组合图形的bounding，并修改子元素的boundingBox
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

  // 3.将组合元素添加进去，并选中
  const filter = spriteList.value.filter((sprite) => {
    return !activeSpriteList.value.find((f) => f.id === sprite.id);
  });
  spriteList.value = [...filter, groupSpriteData];
  activeSpriteList.value = [groupSpriteData];
}

/**
 * 解组
 * 解除最最近的一个组
 * 对应的数据是
 */

function handleCancelGroup() {
  // 如果被选中的是一个并且是组
  if (activeSpriteList.value.length === 1) {
    const group: ISprite = activeSpriteList.value[0];
    if (!group.children) return;

    // 1.修正第一层的位置
    const fixGroupChildren = group.children.map((m) => {
      return {
        ...m,
        boundingBox: {
          x: m.boundingBox.x + group.boundingBox.x,
          y: m.boundingBox.y + group.boundingBox.y,
          width: m.boundingBox.width,
          height: m.boundingBox.height,
        },
      };
    });
    console.log(fixGroupChildren, "fixGroupChildren");

    // 过滤出组中第一层 是组和不是组的数据
    const filterList = fixGroupChildren.filter(
      (f: ISprite) => f.type !== SPRITE_NAME.GROUP
    );
    const filterGroupList = fixGroupChildren.filter(
      (f: ISprite) => f.type === SPRITE_NAME.GROUP
    );
    const newList = [...filterList, ...filterGroupList];
    const delIndex = spriteList.value.findIndex((f) => f.id === group.id);
    spriteList.value.splice(delIndex, 1);
    spriteList.value.push(...newList);
    activeSpriteList.value.push(...newList);
  }
}

function handleScale(scale: number) {
  console.log(scale, "scale");

  stage.scale = scale;
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
  overflow: hidden;
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
  /* display: inline-flex; */
  /* align-items: center; */

  user-select: none;

  position: absolute;
  background-color: #fff;
  border-radius: 8px;

  left: 30px;
}
.li {
  height: 30px;
  line-height: 30px;
  list-style: none;
  margin-right: 2px;
  cursor: grab;
}

.li:active {
  cursor: grabbing;
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

  position: relative;
}

.left {
  background-color: aqua;
  width: 300px;
  height: 100%;
}

.right {
  background-color: bisque;
  width: 300px;
  height: 100%;
}

/* rect {  
  animation: draw 3s infinite;  
}  
@keyframes draw {  
  0% { stroke-dasharray: 0, 100; }  
  50% { stroke-dasharray: 50, 50; }  
  100% { stroke-dasharray: 100, 100; }  
}   */
</style>
