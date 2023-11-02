<template>
  <div class="editor-container">
    <div class="header">
      <div class="header-bar">
        <button @click="handleGroup">组合</button>
        <button @click="handleCancelGroup">解组</button>

        <button @click="redo">重做</button>
        <button @click="undo">撤销</button>

        <button @click="addPoint">增加锚点</button>
      </div>
    </div>
    <div class="content">
      <div class="left">
        <div class="left-top" v-split.bottom>
          <p>预览</p>
          <div class="preview-container">
            <PreviewWindowSprite
              :stage="stage"
              :sprite-list="spriteList"
              :register-sprite-meta-map="registerSpriteMetaMap"
            />
          </div>
        </div>
        <div style="height: 50%; background-color: bisque">
          <p>精灵大纲</p>
          <el-tree
            :data="spriteList"
            :props="{
              label: 'id',
              children: 'children',
            }"
          ></el-tree>
        </div>
      </div>
      <div class="center">
        <ul class="ul" @dragstart="handleDragStart">
          <li class="li" v-for="item of componentList" :title="item.title">
            <img
              :data-index="item.type"
              style="width: 32px"
              :src="item.icon"
              alt=""
            />
          </li>
        </ul>
        <div class="center-content" ref="contentWrapper">
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
            />

            <!-- 精灵树渲染 -->
            <SpriteTree
              :spriteList="spriteList"
              :registerSpriteMetaMap="registerSpriteMetaMap"
              @updateSprite="updateSprite"
              @handleSpriteDblClick="handleSpriteDblClick"
            />

            <!-- 活跃的精灵容器：提供移动旋转缩放选中的能力 -->
            <ActiveSpritesContainer
              v-show="activeSpriteList.length"
              :auxiliary-line-list="auxiliaryLineList"
              :stage="stage"
              :activeSpriteList="activeSpriteList"
              :spriteList="spriteList"
              :registerSpriteMetaMap="registerSpriteMetaMap"
              @move="move"
              @move-end="moveEnd"
              @rotate="rotate"
              @resize="resize"
              @resize-end="resizeEnd"
              @select="select"
            />

            <!-- 锚点渲染器: 为线条或者部分图形增加辅助功能 -->
            <!-- <AnchorPoints
              :stage="stage"
              :activeSpriteList="activeSpriteList"
              @select="select"
              @anchor-point-move="handleAnchorPointMove"
            /> -->

            <!-- 工具栏渲染器 -->
            <!-- <Toolbar :activeSpriteList="activeSpriteList"></Toolbar> -->

            <!-- 选框: 用于多选 -->
            <SelectArea
              :stage="stage"
              :spriteList="spriteList"
              @select-area-move="handleSelectAreaMove"
            />
          </Stage>

          <!-- 右键菜单精灵渲染器 -->
          <!-- <ContextMenu
            :target="contentWrapper"
            :menuList="[
              {
                label: '空空如也',
                value: 'empty',
              },
            ]"
            @menu-item-click="handleMenuItemClick"
          ></ContextMenu> -->
        </div>
      </div>
      <div class="right" v-if="1">
        <!-- 属性面板渲染器 -->
        <AttrsPanel
          :stage="stage"
          :activeSpriteList="activeSpriteList"
          @updateSprite="updateSprite"
        />
      </div>
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
import AttrsPanel from "./components/attrs-panel/index.vue";
import ContextMenu from "./components/context-menu/index.vue";
import PreviewWindowSprite from "./components/sprite/preview-window-sprite/index.vue";
// import AuxiliaryLine from "./components/stage/auxiliary-line.vue";
import Toolbar from "./components/sprite/toolbar-sprite.vue";

import { ref, shallowRef, provide, reactive } from "vue";

import { resize as vSplit } from "./directive";

import { default_sprite_data } from "./components/meta-data/index";

// @ts-ignore
import _ from "lodash";

import { History } from "./utils/history";
// import { getCoordinateInStage } from "../../"

import {
  IActiveItem,
  ICoordinate,
  ISprite,
  ISpriteMeta,
  SPRITE_NAME,
} from "./components/meta-data/types";
import {
  findById,
  getCoordinateInGroupFromStage,
  getCoordinateInStage,
  getCoordinateInStageFromGroup,
} from "./utils";
import { IMode, IUpdateParams } from "./types";

const componentList = Object.values(default_sprite_data)
  .filter((f) => f.type !== SPRITE_NAME.GROUP)
  .map((m) => {
    return {
      type: m.type,
      title: m.title,
      icon: m.icon,
    };
  });

console.log(componentList, "componentList");

// 舞台信息
const stage = reactive({
  width: 1920,
  height: 1080,
  scale: 1,
});

// 历史记录
const history = new History();

const stageRef = ref<InstanceType<typeof Stage> | null>(null);
const contentWrapper = ref(null);
// 精灵列表
const spriteList = ref<ISprite[]>([]);
// 活跃（被选中）状态的精灵列表
const activeSpriteList = ref<Array<ISprite>>([]);

/*
  被确切选中的精灵索引
  触发方式，如果被选中了
*/
// const exactActiveIndex = ref<number>();

// 已经注册的精灵map
const registerSpriteMetaMap: any = shallowRef({});

// 对齐线
const auxiliaryLineList = ref<any[]>([]);

// 注册精灵
registerSpriteList();

// const boundingRectInfo = computed()

/**
 *
 * 注册精灵
 */
function registerSpriteList() {
  Object.values(default_sprite_data).forEach((sprite) => {
    registerSprite(sprite);
  });
}

function registerSprite(spriteMeta: ISpriteMeta) {
  if (registerSpriteMetaMap.value?.[spriteMeta.type]) {
    console.warn(`Sprite ${spriteMeta.type} 已经注册`);
    return;
  }
  registerSpriteMetaMap.value[spriteMeta.type] = spriteMeta;
}

// 选取拖拽精灵
function handleDragStart(e: DragEvent) {
  if (e !== null && e.target instanceof HTMLElement) {
    console.log(e.target.dataset, "e.target.dataset.index");

    e.dataTransfer!.setData("index", e.target.dataset.index!);
  }
}

function handleDragOver(e: DragEvent) {
  e.preventDefault();
}

// 放入精灵到舞台
function handleDrop(e: DragEvent) {
  e.preventDefault();
  e.stopPropagation();
  console.log(e, "e.dataTransfer");

  // if (e !== null && typeof e.dataTransfer === "dataTransfer") {
  const name = e.dataTransfer!.getData("index") as SPRITE_NAME;
  console.log(name, "kkk");
  if (name) {
    addSpriteToStage({
      name,
      point: {
        x: e.clientX,
        y: e.clientY,
      },
    });
  } else {
    throw new Error("精灵未注册或者数据不对");
  }
}
// }

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

  const sprite = spriteMeta.createInitData();
  const _point = getCoordinateInStage(
    stageRef.value!.svgRef as HTMLElement,
    point,
    stage.scale
  );
  sprite.boundingBox.x = _point.x;
  sprite.boundingBox.y = _point.y;
  spriteList.value.push(sprite);
  setActiveSpriteList(sprite);

  history.push(JSON.parse(JSON.stringify(spriteList.value)));
}

/**
 * 更新精灵列表的尺寸大小
 */
function updateSpriteBox(info: any) {
  const { target, lines = [] } = info;

  if (target && target.length) {
    activeSpriteList.value.forEach((item: IActiveItem, index: number) => {
      const _data = { ...target[index] };
      console.log(_data, "target[index]");
      item.boundingBox = { ..._data };
      // 如果是第一层，那么直接更新，否则将坐标转换为舞台坐标
      if (!topFindById(item.id)) {
        const pos = getCoordinateInGroupFromStage(
          item.id,
          spriteList.value,
          _data
        );
        console.log(pos, "pos");

        if (pos) {
          _data.x = pos.x;
          _data.y = pos.y;
        }
      }
      updateSprite({
        id: item.id,
        stateSet: [
          {
            path: "boundingBox.x",
            value: _data.x,
          },
          {
            path: "boundingBox.y",
            value: _data.y,
          },
          {
            path: "boundingBox.width",
            value: _data.width,
          },
          {
            path: "boundingBox.height",
            value: _data.height,
          },
        ],
      });
    });
  }

  auxiliaryLineList.value = lines;
}

/**
 * 选中精灵列表其实是基于舞台的
 * 所以需要单独维护渲染出的选中精灵列表中的精灵数据
 * 也就是保存在选中精灵列表中的数据应该是精灵在舞台中的数据
 * @param
 */

function setActiveSpriteList(list: ISprite[] | ISprite) {
  let _list = Array.isArray(list) ? list : [list];
  activeSpriteList.value = _list.map((m) => {
    let { id, boundingBox } = m;
    // 如果不在第一层，那么就是相对组坐标，需要转换为舞台坐标
    const find = topFindById(id);

    if (!find) {
      const point = getCoordinateInStageFromGroup(id, spriteList.value);
      Object.assign(boundingBox, point);
    }
    return {
      ...m,
      boundingBox: { ...boundingBox },
    };
  });
}

//  查找id是不是第一层，如果是返回当前精灵
function topFindById(id: string) {
  const find = spriteList.value.find((f) => f.id === id);
  return find;
}

function move(info: any) {
  updateSpriteBox(info);
}

function moveEnd(info: any) {
  updateSpriteBox(info);
  history.push(JSON.parse(JSON.stringify(spriteList.value)));
}

function rotate(info: any) {
  updateSpriteBox(info);
}

function resize(info: any) {
  updateSpriteBox(info);
}

function resizeEnd(info: any) {
  updateSpriteBox(info);
  history.push(JSON.parse(JSON.stringify(spriteList.value)));
}

// 更新精灵属性
function updateSprite(updateParams: IUpdateParams, _mode?: IMode) {
  const { id, stateSet } = updateParams;

  // 为多个的时候，批量设置
  const _id = Array.isArray(id) ? id : [id];

  _id.forEach((item) => {
    const sprite = findById(spriteList.value, item);

    // 如果查找到精灵
    if (sprite) {
      // 状态设置器有值
      if (stateSet) {
        const _stateSet = Array.isArray(stateSet) ? stateSet : [stateSet];

        // 遍历设置器
        _stateSet.forEach((item) => {
          _.set(sprite, item.path, item.value, "error");
        });
      }
    }
  });

  if (_mode) {
    mode.value = _mode.value;
  } else {
    mode.value = "";
  }
}

// 选中精灵 时 根据id找到当前点击的精灵的信息
function select(info: any) {
  const { target } = info;
  if (target) {
    setActiveSpriteList(target);
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
 * 区域选择
 */
function handleSelectAreaMove(activeList: ISprite[]) {
  setActiveSpriteList(activeList);
}

// 组合
function handleGroup() {
  // 1.组合只针对被选中的精灵
  const groupMeta = default_sprite_data[SPRITE_NAME.GROUP];
  // registerSprite(groupMeta);
  const groupSpriteData = groupMeta.createInitData(
    activeSpriteList.value.map((m) => m.boundingBox)
  );
  // 2.针对选中的元素计算出组合图形的bounding，并修改子元素的boundingBox
  const { x, y } = groupSpriteData.boundingBox;
  // const children = []
  // activeSpriteList.value.forEach((m) => {
  //   const find = findById(spriteList.value,m.id)
  //   if (find) {

  //   }

  // })
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
  setActiveSpriteList([groupSpriteData]);
}

/**
 * 解组
 * 解除最最近的一个组
 * 对应的数据是
 */

function handleCancelGroup() {
  // 如果被选中的是一个并且是组
  if (activeSpriteList.value.length === 1) {
    const item = activeSpriteList.value[0];
    const group = spriteList.value.find((f) => f.id === item.id);
    if (!group || !group.children) return;

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
    setActiveSpriteList(newList);
  }
}

function handleScale(scale: number) {
  stage.scale = scale;
}

function redo() {
  history.redo();
  setActiveSpriteList([]);

  // if (history.currentValue) {
  spriteList.value = history.currentValue || [];
  // }
}

function undo() {
  history.undo();

  setActiveSpriteList([]);

  // if (history.currentValue) {
  spriteList.value = history.currentValue || [];
  // }
}

/**
 * 菜单点击
 */
function handleMenuItemClick(menu: any) {
  console.log(menu, "menu");
}

/**
 * 增加锚点
 */
const mode = ref("");

function addPoint() {
  if (mode.value === "addPoint") {
    mode.value = "";
  } else {
    mode.value = "addPoint";
  }
}

// let group = [];
function handleSpriteDblClick(sprite: ISprite) {
  // 双击
  // 2.如果双击到了一个精灵，并且这个精灵是组，则选中组
  // 这里找到的精灵是是组内的数据，需要转换为坐标系中的数据
  // 1.获取当前组的位置
  // 也就是需要根据当前id一级一级找到父级，然后将所有父级的位置累加
  const position = getCoordinateInStageFromGroup(sprite.id, spriteList.value);
  if (position) {
    const spriteInStage = JSON.parse(JSON.stringify(sprite));
    const { x, y } = position;
    spriteInStage.boundingBox.x = x;
    spriteInStage.boundingBox.y = y;
    activeSpriteList.value = [spriteInStage];
  }
}

// 向后代注入当前注册的精灵信息
provide("registerSpriteMetaMap", registerSpriteMetaMap);

// // 向后代注入舞台所有数据信息
provide("stageApi", {
  stage: stage,
  spriteList: spriteList,
  activeSpriteList: activeSpriteList,
});

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
  overflow: auto;
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
  z-index: 1;
  background-color: #fff;
  border-radius: 8px;

  padding: 5px;
  left: 30px;

  margin: auto;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
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

  /* display: flex;
  justify-content: center;
  align-items: center; */

  position: relative;

  overflow: hidden;

  /* margin: auto; */
  display: flex;
  align-items: center;
  justify-content: center;
}

.center-content {
  /* height: 100%;
  width: 100%; */
  /* overflow: auto; */
  /* margin: auto; */
}

.left {
  background-color: aqua;
  width: 300px;
  height: 100%;
}
.left-top {
  height: 200px;
  display: flex;
  flex-direction: column;
}
.preview-container {
  flex: 1;
  padding: 5px;
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
