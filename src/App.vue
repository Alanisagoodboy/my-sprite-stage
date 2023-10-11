<template>
  <div class="editor-container">
    <div class="left">
      <ul>
        <li
          class="li"
          v-for="item of componentList"
          @click="addSpriteToStage(item)"
        >
          {{ item.name }}
        </li>
      </ul>
    </div>
    <div class="center">
      <Stage width="800" height="400">
        <!-- 网格线 -->
        <GridLine :width="800" :height="400" :spacing="50"></GridLine>

        <!-- 精灵容器 -->
        <SpriteContainer
          v-for="(sprite, index) of spriteList"
          :sprite="sprite"
          :key="sprite.id"
        >
          <!-- 精灵 -->
          <!-- <RectSprite :sprite="sprite">
            <text fill="#000">{{ index }} </text>
          </RectSprite> -->
          <component :is="cpnsMap[sprite.type]" :sprite="sprite"></component>
        </SpriteContainer>

        <line
          v-for="line of auxiliaryLineList"
          :key="JSON.stringify(line)"
          v-bind="line"
          stroke="#0067ed"
          strokeDasharray="4 4"
        ></line>

        <!-- 活跃的精灵容器：提供移动旋转缩放选中的能力 -->
        <ActiveSpritesContainer
          :active-index="activeIndex"
          :spriteList="spriteList"
          @move="move"
          @rotate="rotate"
          @resize="resize"
          @select="handleSelect"
        ></ActiveSpritesContainer>
      </Stage>
    </div>
    <div class="right"></div>
  </div>
</template>
<script setup lang="ts">
import Stage from "./components/stage/index.vue";
import SpriteContainer from "./components/sprite/sprite-container.vue";
import ActiveSpritesContainer from "./components/sprite/active-sprites-container.vue";
import RectSprite from "./components/sprite/rect-sprite/index.vue";
import GridLine from "./components/stage/grid-line.vue";
import { ref, computed } from "vue";

import { default_sprite_data } from "./components/meta-data/index";
import { ISprite, SPRITE_NAME } from "./components/meta-data/types";
import { HANDLER, IBox } from "./utils/types";
import { getAuxiliaryLine, handleAdsorb } from "./utils";

const componentList = [
  {
    name: SPRITE_NAME.RECT,
  },
  {
    name: SPRITE_NAME.LINE,
  },
];

// 精灵列表
const spriteList = ref<ISprite[]>([]);
// 活跃（被选中）状态的精灵列表
const activeSpriteList = ref([]);

const cpnsMap = {}

// 对齐线
const auxiliaryLineList = ref([]);

// 不活跃的数据
const inactiveList = computed(() => {
  return spriteList.value
    .filter((_, index) => index !== activeIndex.value)
    .map((m) => {
      const { coordinate, size } = m.attrs;
      return {
        ...size,
        ...coordinate,
      };
    });
});

/**
 * 添加精灵到画布
 * @param {ISprite | ISprite[]} sprite
 */
function addSpriteToStage({ name }: any) {
  const meta = default_sprite_data[name];
  cpnsMap[name] = meta[name]
  const _data = meta.createInitData()
  const sprite = {
    ..._data,
    id: name + Math.random(),
  };
  // if (Array.isArray(sprite)) {
  //   // spriteList.value.push(...sprite);
  // } else {
  spriteList.value.push(sprite);
  // }
}

/**
 * 更新精灵列表
 */
function updateSpriteList(info: IBox) {
  spriteList.value[activeIndex.value].attrs.coordinate.x = info.x;
  spriteList.value[activeIndex.value].attrs.coordinate.y = info.y;
  spriteList.value[activeIndex.value].attrs.size.width = info.width;
  spriteList.value[activeIndex.value].attrs.size.height = info.height;
  spriteList.value[activeIndex.value].attrs.angle = info.rotate;
}

const activeIndex = ref(0);

function move(info: IBox) {
  updateSpriteList(info);

  const { lines, dx, dy } = getAuxiliaryLine(
    { distance: 0 },
    { ...info },
    inactiveList.value,
    { width: 800, height: 400 }
  );
  auxiliaryLineList.value = lines;

  const newInfo = handleAdsorb({
    rect: { ...info },
    dx,
    dy,
    mode: "move",
  });
  console.log(newInfo, "newInfo");

  updateSpriteList({ ...newInfo });
}

function rotate(info: IBox) {
  updateSpriteList(info);
}

function resize(info: IBox, handleType: HANDLER) {
  updateSpriteList(info);

  const { lines, dx, dy } = getAuxiliaryLine(
    { distance: 0 },
    { ...info },
    inactiveList.value,
    { width: 600, height: 800 }
  );
  auxiliaryLineList.value = lines;

  const newInfo = handleAdsorb({
    rect: { ...info },
    dx,
    dy,
    mode: "move",
    resizePos: handleType,
  });
  console.log(newInfo, "newInfo");

  updateSpriteList(newInfo);
}

// 选中精灵 时
function handleSelect(id: string) {
  // 根据id找到当前点击的精灵的信息
  const index = spriteList.value.findIndex((e: ISprite) => e.id === id);
  console.log(activeIndex.value, "activeIndex.value");

  activeIndex.value = index;
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

  display: flex;
}

.center {
  flex: 1;

  display: flex;
  justify-content: center;
  align-items: center;
}

.left {
  background-color: aqua;
  width: 300px;
  height: 100%;
}

.li {
  width: 100%;
  margin-bottom: 10px;
  border: 1px solid #398cfe;
}

.right {
  background-color: bisque;
  width: 300px;
  height: 100%;
}
</style>
