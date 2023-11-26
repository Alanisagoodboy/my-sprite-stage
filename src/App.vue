<template>
  <div class="editor-container">
    <div class="header">
      <div class="header-bar">
        <el-button
          :disabled="showGroupBtn"
          type="primary"
          size="small"
          @click="handleGroup"
          >组合</el-button
        >
        <el-button
          :disabled="showCancelGroupBtn"
          type="primary"
          size="small"
          @click="handleCancelGroup"
          >解组</el-button
        >

        <el-button
          :disabled="!showDeleteBtn"
          type="danger"
          size="small"
          @click="handleDeleteSprite"
          >删除</el-button
        >

        <el-button type="danger" size="small" @click="handleClear"
          >清空舞台</el-button
        >

        <el-button
          :disabled="activeIdsSet.size === 0"
          type="danger"
          size="small"
          @click="handleCopy"
          >复制</el-button
        >
        <el-button
          :disabled="copy.length === 0"
          type="danger"
          size="small"
          @click="handlePaste"
          >粘贴</el-button
        >

        <el-button type="primary" :disabled="true" size="small" @click="redo"
          >重做</el-button
        >
        <el-button type="primary" :disabled="true" size="small" @click="undo"
          >撤销</el-button
        >

        <el-button type="primary" size="small" @click="addDiySprite"
          >增加自定义组合元素</el-button
        >

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
            :stage="stage"
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
              v-show="activeIdsSet.size > 0"
              :stage="stage"
              :spriteList="spriteList"
              :activeIdsSet="activeIdsSet"
              :registerSpriteMetaMap="registerSpriteMetaMap"
              @updateSprite="updateSprite"
              @select="select"
            />

            <!-- 锚点渲染器: 为线条或者部分图形增加辅助功能 -->
            <AnchorPoints
              :stage="stage"
              :spriteList="spriteList"
              :activeIdsSet="activeIdsSet"
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
          :activeIdsSet="activeIdsSet"
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
// import gradientParser from "gradient-parser";
// var color = gradientParser.parse("linear-gradient(90deg, rgba(170, 71, 188, 1) 0%, rgba(255, 0, 0, 1) 100%)");
// var color = tinycolor("rgb(255, 0, 0)");

// console.log(color, 'color');

import { useSessionStorage, useRefHistory } from "@vueuse/core";

import { a } from "./default-data";

import { ref, shallowRef, provide, reactive, onMounted, computed } from "vue";
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
import { findById, getCoordinateInStage, deleteSpriteByIds } from "./utils";
import { IUpdateParams } from "./types";
import GenNonDuplicateID from "./utils/getUuid";

const componentList = Object.values(default_sprite_data)
  .filter((f) => ![SPRITE_NAME.GROUP, SPRITE_NAME.STAGE].includes(f.type))
  .map((m) => {
    return {
      type: m.type,
      title: m.title,
      icon: m.icon,
    };
  });

console.log(componentList, "componentList");

// 舞台信息
const stage = reactive(default_sprite_data.Stage.createInitData());

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
      (width - 10) / stage.attrs.width,
      (height - 10) / stage.attrs.height
    );
    stage.attrs.scale = scale;
  }
}

// 历史记录
const history = new History();

const stageRef = ref<InstanceType<typeof Stage> | null>(null);
const contentWrapper = ref(null);
// 精灵列表
const spriteList = useSessionStorage("spriteList", ref<ISprite[]>([]));

const { undo: listUndo, redo: listRedo } = useRefHistory(spriteList, {
  deep: true,
});

// 活跃（被选中状态的）精灵id列表，
const activeIdsSet = ref<Set<string>>(new Set());

// 设置活跃的id列表
function setActiveIds(ids: string[] | string, type: "set" | "add" = "set") {
  const _ids = Array.isArray(ids) ? ids : [ids];
  if (type === "set") {
    activeIdsSet.value = new Set(_ids);
  }
  if (type === "add") {
    _ids.forEach((id) => {
      activeIdsSet.value.add(id);
    });
  }
}

/*
  被确切选中的精灵索引
  触发方式，如果被选中了
*/
// const exactActiveIndex = ref<number>();

// 已经注册的精灵map
const registerSpriteMetaMap: any = shallowRef({});

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
    stage.attrs.scale
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
  setActiveIds(sprite.id);
  // history.push(JSON.parse(JSON.stringify(spriteList.value)));
}

// 更新精灵属性
function updateSprite(updateParams: IUpdateParams | IUpdateParams[]) {
  const _updateParams = Array.isArray(updateParams)
    ? updateParams
    : [updateParams];

  _updateParams.forEach((item) => {
    const { id, stateSet, type } = item;
    const _stateSet = Array.isArray(stateSet) ? stateSet : [stateSet];
    if (type === SPRITE_NAME.STAGE) {
      // 遍历设置器
      _stateSet.forEach((item) => {
        _.set(stage, item.path, item.value, "error");
      });
    }

    // 为多个的时候，批量设置
    const _id = Array.isArray(id) ? id : [id];
    // 如果操作时选择

    _id.forEach((item) => {
      const sprite = findById(spriteList.value, item);
      // 状态设置器有值
      if (sprite && stateSet) {
        // 遍历设置器
        _stateSet.forEach((item) => {
          _.set(sprite, item.path, item.value, "error");
        });
      }
    });
  });
}

// 选中精灵 时 根据id找到当前点击的精灵的信息
function select(info: any) {
  const { targetIds } = info;
  if (targetIds) {
    setActiveIds(targetIds);
  }
}

// 锚点移动时 待优化 todo
function handleAnchorPointMove(info: any) {
  updateSprite(info);
}

// 锚点移动结束
// function handleAnchorPointMoveEnd(info: any) {}

// 是否显示组合按钮
const showGroupBtn = computed(() => {
  return activeIdsSet.value.size <= 1;
});

// 是否显示解组按钮
const showCancelGroupBtn = computed(() => {
  let flag = true;
  if (activeIdsSet.value.size === 1) {
    const [id] = activeIdsSet.value;
    const item = spriteList.value.find((f: ISprite) => f.id === id);
    if (item?.type === SPRITE_NAME.GROUP) {
      flag = false;
    }
  }
  return flag;
});

// 是否禁用删除按钮
const showDeleteBtn = computed(() => {
  return activeIdsSet.value.size > 0;
});

/**
 * 区域选择
 */
function handleSelectAreaMove(activeList: ISprite[]) {
  setActiveIds(activeList.map((m) => m.id));
}

// 组合
function handleGroup() {
  // 1.组合只针对被选中的精灵
  // 当选中的精灵大于1
  if (activeIdsSet.value.size <= 1) return;

  const groupMeta = default_sprite_data[SPRITE_NAME.GROUP];

  // 2.过滤出选中的精灵,并计算由他们组成的组合图形的boundingBox
  const filter: ISprite[] = spriteList.value.filter((sprite: ISprite) =>
    activeIdsSet.value.has(sprite.id)
  );
  // 3.创建并修正组合精灵
  const groupSpriteData = groupMeta.createInitData({
    boundingList: filter.map((m: ISprite) => m.boundingBox),
  });

  // 4.修正子元素的boundingBox
  const children = filter.map((m) => {
    return {
      ...m,
      boundingBox: {
        x: m.boundingBox.x - groupSpriteData.boundingBox.x,
        y: m.boundingBox.y - groupSpriteData.boundingBox.y,
        width: m.boundingBox.width,
        height: m.boundingBox.height,
      },
    };
  });
  groupSpriteData.children = children;

  // 5.需要在精灵列表中清除被选中的精灵,然后添加组合精灵
  spriteList.value = [
    ...spriteList.value.filter(
      (sprite: ISprite) => !activeIdsSet.value.has(sprite.id)
    ),
    groupSpriteData,
  ];

  // 6.选中组合图形
  setActiveIds([groupSpriteData.id]);
}

// 解组
function handleCancelGroup() {
  // 如果被选中的是一个并且是组, 目前只支持顶层解组
  if (activeIdsSet.value.size === 1) {
    const [id] = activeIdsSet.value;
    const item = spriteList.value.find((f: ISprite) => f.id === id);
    if (item?.type === SPRITE_NAME.GROUP) {
      // 1.修正第一层的位置
      const fixGroupChildren = item.children?.map((m) => {
        return {
          ...m,
          boundingBox: {
            x: m.boundingBox.x + item.boundingBox.x,
            y: m.boundingBox.y + item.boundingBox.y,
            width: m.boundingBox.width,
            height: m.boundingBox.height,
          },
        };
      });
      // 2.将子级添加到精灵列表中
      spriteList.value = [
        ...spriteList.value.filter((f: ISprite) => f.id !== item.id),
        ...fixGroupChildren,
      ];

      // 3.剔除组合父级,选中子级
      setActiveIds(fixGroupChildren.map((m) => m.id));
    }
  }
}

// 删除精灵
function handleDeleteSprite() {
  if (activeIdsSet.value.size === 0) return;
  // 根据 活跃的精灵 id 删除精灵列表中的数据
  const updateList = deleteSpriteByIds(
    [...activeIdsSet.value],
    spriteList.value
  );

  // updateSprite(
  //   updateList.map((m) => {
  //     return {
  //       id: m.id,
  //       stateSet: [
  //         {
  //           path: "boundingBox.x",
  //           value: m.boundingBox.x,
  //         },
  //         {
  //           path: "boundingBox.y",
  //           value: m.boundingBox.y,
  //         },
  //         {
  //           path: "boundingBox.width",
  //           value: m.boundingBox.width,
  //         },
  //         {
  //           path: "boundingBox.height",
  //           value: m.boundingBox.height,
  //         },
  //       ],
  //     };
  //   })
  // );

  setActiveIds([]);
}

function handleClear() {
  spriteList.value = [];
  setActiveIds([]);
}

function handleScale(scale: number) {
  stage.attrs.scale = scale;
}

function redo() {
  // history.redo();

  // // if (history.currentValue) {
  // spriteList.value = history.currentValue || [];
  // // }
  listRedo();
}

function undo() {
  // history.undo();

  // // if (history.currentValue) {
  // spriteList.value = history.currentValue || [];
  // // }

  listUndo();
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

function addDiySprite() {
  const diySprite: ISprite = a();
  // 让diySprite的id极其子磊=类不重复
  updateId(diySprite);
  function updateId(tree: ISprite) {
    tree.id = GenNonDuplicateID();
    if (tree.children?.length) {
      tree.children.forEach((item) => {
        updateId(item);
      });
    }
  }

  spriteList.value.push(diySprite);
}

function updateId(tree: ISprite) {
  tree.id = GenNonDuplicateID();
  if (tree.children?.length) {
    tree.children.forEach((item) => {
      updateId(item);
    });
  }
}

function handlePaste() {
  if (copy.value.length === 0) return;
  const newList = copy.value.map((m) => {
    const _copy = JSON.parse(JSON.stringify(m));
    updateId(_copy);
    return _copy;
  });
  spriteList.value = spriteList.value.concat(newList);

  setActiveIds(newList.map((m) => m.id));
}
let copy = ref<ISprite[]>([]);
function handleCopy() {
  let arr: ISprite[] = [];
  activeIdsSet.value.forEach((id) => {
    const sprite = findById(spriteList.value, id);
    if (sprite) {
      const _copy = JSON.parse(JSON.stringify(sprite));
      arr.push(_copy);
    }
  });
  copy.value = arr;
}

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

  width: 80%;
  background-color: #fff;
  margin: auto;

  display: flex;
  align-items: center;
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
