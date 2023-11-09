<template>
  <div class="editor-container">
    <div class="header">
      <div class="header-bar">
        <button @click="handleGroup">组合</button>
        <button @click="handleCancelGroup">解组</button>

        <button @click="redo">重做</button>
        <button @click="undo">撤销</button>

        <!-- <button @click="addPoint">增加锚点</button> -->
      </div>
    </div>
    <div class="content">
      <div class="left">
        <div class="left-top">
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
        <ul class="ul" @dragstart="handleDragStart" @dragend="handleDragEnd">
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
            <!-- <GridLines
              :width="stage.width"
              :height="stage.height"
              :spacing="50"
            /> -->

            <!-- 精灵树渲染 -->
            <SpriteTree
              :stage="stage"
              :spriteList="spriteList"
              :registerSpriteMetaMap="registerSpriteMetaMap"
              @updateSprite="updateSprite"
            />

            <!-- 活跃的精灵容器：提供移动旋转缩放选中的能力 -->
            <ActiveSpritesContainer
              v-show="activeSpriteList.length"
              :auxiliary-line-list="auxiliaryLineList"
              :stage="stage"
              :activeSpriteList="activeSpriteList"
              :spriteList="spriteList"
              :registerSpriteMetaMap="registerSpriteMetaMap"
              @updateSprite="updateSprite"
              @move="move"
              @move-end="moveEnd"
              @rotate="rotate"
              @resize="resize"
              @resize-end="resizeEnd"
              @select="select"
            />

            <!-- 锚点渲染器: 为线条或者部分图形增加辅助功能 -->
            <AnchorPoints
              :stage="stage"
              :spriteList="spriteList"
              :activeSpriteList="activeSpriteList"
              @select="select"
              @anchor-point-move="handleAnchorPointMove"
            />

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
          :spriteList="spriteList"
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
// import GridLines from "./components/stage/grid-line.vue";
import SelectArea from "./components/stage/select-area.vue";
import AttrsPanel from "./components/attrs-panel/index.vue";
// import ContextMenu from "./components/context-menu/index.vue";
import PreviewWindowSprite from "./components/sprite/preview-window-sprite/index.vue";
// import AuxiliaryLine from "./components/stage/auxiliary-line.vue";
// import Toolbar from "./components/sprite/toolbar-sprite.vue";

import { ref, shallowRef, provide, reactive, onMounted } from "vue";
// import { useResizeObserver } from "@vueuse/core";

import { default_sprite_data } from "./components/meta-data/index";

// @ts-ignore
import _ from "lodash";

import { History } from "./utils/history";
// import { getCoordinateInStage } from "../../"

import {
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
import { IHandle, IStateSet, IUpdateParams } from "./types";

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
  backgroundColor: "#fff",
});

// 初始化的时候，计算合适的缩放比例
onMounted(() => {
  initScale();
});

// 初始化缩放
function initScale() {
  const contentWrapper = document.querySelector(".center");
  if (contentWrapper) {
    const { width, height } = contentWrapper.getBoundingClientRect();
    // 计算横向的缩放比例，与纵向的缩放比例，取最小值,这里减10，是为了让图形与四周有个间隙，避免贴合太近不容易看清边框
    const scale = Math.min(
      (width - 10) / stage.width,
      (height - 10) / stage.height
    );
    stage.scale = scale;
  }
}

// 历史记录
const history = new History();

const stageRef = ref<InstanceType<typeof Stage> | null>(null);
const contentWrapper = ref(null);
// 精灵列表
const spriteList = ref<ISprite[]>([
  {
    id: "0.7680960015111178",
    type: "GroupSprite",
    attrs: { fill: "#eee" },
    boundingBox: {
      x: 605.9999847412109,
      y: 389.6000061035156,
      width: 429,
      height: 250.39999389648438,
    },
    children: [
      {
        id: "0.8076409550127963",
        type: "GroupSprite",
        attrs: { fill: "#eee" },
        boundingBox: { x: 160, y: 0, width: 269, height: 172 },
        children: [
          {
            id: "0.26289797622942057",
            type: "RectSprite",
            attrs: {
              fill: "#eee",
              content: "",
              stroke: "#398cfe",
              strokeWidth: 1,
            },
            boundingBox: { x: 0, y: 0, width: 160, height: 100 },
          },
          {
            id: "0.6414539690382224",
            type: "RectSprite",
            attrs: {
              fill: "#eee",
              content: "",
              stroke: "#398cfe",
              strokeWidth: 1,
            },
            boundingBox: { x: 109, y: 72, width: 160, height: 100 },
          },
        ],
      },
      {
        id: "0.7944659051280896",
        type: "RectSprite",
        attrs: { fill: "#eee", content: "", stroke: "#398cfe", strokeWidth: 1 },
        boundingBox: { x: 0, y: 150.39999389648438, width: 160, height: 100 },
      },
    ],
  },
]);
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
    e.dataTransfer!.setData("index", e.target.dataset.index!);
  }
}
let isDragging = false;
function handleDragOver(e: DragEvent) {
  e.preventDefault();
  isDragging = true; // 在元素被拖动时设置标志位
}

// 放入精灵到舞台
function handleDrop(e: DragEvent) {
  if (!isDragging) return; // 如果元素未被拖动，则不执行操作
  e.preventDefault();
  e.stopPropagation();

  const name = e.dataTransfer!.getData("index") as SPRITE_NAME;

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
function handleDragEnd() {
  isDragging = false; // 在元素拖动结束时清除标志位
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
  spriteList.value.push(sprite);

  const _point = getCoordinateInStage(
    stageRef.value!.svgRef as HTMLElement,
    point,
    stage.scale
  );

  updateSprite({
    id: sprite.id,
    stateSet: [
      {
        path: "boundingBox.x",
        value: _point.x,
      },
      {
        path: "boundingBox.y",
        value: _point.y,
      },
    ],
  });
  setActiveSpriteList(sprite);
  history.push(JSON.parse(JSON.stringify(spriteList.value)));
}

/**
 * 添加 或设置 活跃精灵列表
 */
function setActiveSpriteList(
  list: ISprite[] | ISprite,
  type: "set" | "add" = "set"
) {
  let _list: ISprite[] = JSON.parse(
    JSON.stringify(Array.isArray(list) ? list : [list])
  );

  if (type === "set") {
    activeSpriteList.value = _list;
  } else {
    activeSpriteList.value.push(..._list);
  }
  _list.forEach((item) => {
    updateActiveSprite({
      id: item.id,
      stateSet: [
        {
          path: "boundingBox.x",
          value: item.boundingBox.x,
        },
        {
          path: "boundingBox.y",
          value: item.boundingBox.y,
        },
      ],
    });
  });
}

/**
 * @description 更新活跃的精灵列表：如果更新了列表中的数据，也在活跃精灵列表中，那么需要更新
 *              保存在活跃精灵列表中的精灵与精灵列表中的数据坐标系可能是不同的，所以需要分别保存分别更新
 * @param ids 精灵id
 */
function updateActiveSprite(updateParams: IUpdateParams) {
  const { id, stateSet } = updateParams;

  const _ids = Array.isArray(id) ? id : [id];
  _ids.forEach((id) => {
    const find = activeSpriteList.value.find((f) => f.id === id);
    if (find) {
      console.log(find, "find");

      updateState(find, stateSet, "active");
    }
  });
}

/**
 *
 * @param sprite 精灵
 * @param stateSet 状态设置器
 */
function updateState(
  sprite: ISprite | null,
  stateSet: IStateSet | IStateSet[],
  updateType: "active" | "spriteList" = "active"
) {
  // 状态设置器有值
  if (sprite && stateSet) {
    const _stateSet = Array.isArray(stateSet) ? stateSet : [stateSet];

    const isTop = topFindById(sprite.id); // 判断是否是第一层
    if (!isTop) {
      const xItem = _stateSet.find((f) => f.path === "boundingBox.x");
      const yItem = _stateSet.find((f) => f.path === "boundingBox.y");

      // 对于活跃精灵列表， 如果存在更新了x坐标还是y坐标，需要更新组内坐标为舞台坐标
      if (updateType === "active") {
        const point = getCoordinateInStageFromGroup(
          sprite.id,
          spriteList.value
        );
        console.log(point, xItem, yItem, _stateSet, "point");

        if (xItem) xItem.value = point?.x;
        if (yItem) yItem.value = point?.y;
      }

      // 对于精灵列表，如果存在更新了x坐标还是y坐标，需要更新舞台坐标为组内坐标
      if (updateType === "spriteList") {
        const point = getCoordinateInGroupFromStage(
          sprite.id,
          spriteList.value,
          {
            x: xItem?.value,
            y: yItem?.value,
          }
        );
        if (xItem) xItem.value = point?.x;
        if (yItem) yItem.value = point?.y;
      }
    }

    // 遍历设置器
    _stateSet.forEach((item) => {
      _.set(sprite, item.path, item.value, "error");
    });
  }
}

/**
 * 更新精灵列表的尺寸大小
 */
function updateSpriteBox(info: any) {
  const { target, lines = [] } = info;

  if (target && target.length) {
    activeSpriteList.value.forEach((item: ISprite, index: number) => {
      updateSprite({
        id: item.id,
        stateSet: [
          {
            path: "boundingBox.x",
            value: target[index].x,
          },
          {
            path: "boundingBox.y",
            value: target[index].y,
          },
          {
            path: "boundingBox.width",
            value: target[index].width,
          },
          {
            path: "boundingBox.height",
            value: target[index].height,
          },
        ],
      });
    });
  }

  auxiliaryLineList.value = lines;
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
function updateSprite(updateParams: IUpdateParams, handle?: IHandle) {
  const { id, stateSet } = updateParams;
  // 为多个的时候，批量设置
  const _id = Array.isArray(id) ? id : [id];
  // 如果操作时选择
  if (handle) {
    const { handleType, target } = handle;
    if (handleType === "select") {
      setActiveSpriteList(target);
    }
  }

  _id.forEach((item) => {
    const sprite = findById(spriteList.value, item);
    updateState(sprite, stateSet, "spriteList");
  });
  updateActiveSprite(updateParams);
}

// 选中精灵 时 根据id找到当前点击的精灵的信息
function select(info: any) {
  const { target, mode } = info;
  if (target) {
    console.log(target, "target");

    setActiveSpriteList(target);
  }

  if (mode) {
    updateSprite({
      id: target.id,
      stateSet: {
        path: "mode",
        value: mode,
      },
    });
  }
}

// 锚点移动时 待优化 todo
function handleAnchorPointMove(info: any) {
  updateSprite(info);
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

//  当前操作的模式
const mode = ref<IMode>("default");

function addPoint() {
  if (mode.value === "addPoint") {
    mode.value = "";
  } else {
    mode.value = "addPoint";
  }
}

// 向后代注入当前注册的精灵信息
provide("registerSpriteMetaMap", registerSpriteMetaMap);

// // 向后代注入舞台所有数据信息
provide("stageApi", {
  mode: mode,
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
  min-width: 0;

  /* display: flex;
  justify-content: center;
  align-items: center; */

  position: relative;

  overflow: hidden;

  /* margin: auto; */
  display: flex;
  align-items: center;
  justify-content: center;

  box-sizing: border-box;
}

.center-content {
  /* height: 100%;
  width: 100%; */
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
