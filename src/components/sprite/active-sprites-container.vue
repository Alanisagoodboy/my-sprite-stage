<template>
  <g>
    <!-- 辅助线是舞台坐标系 -->
    <g v-show="isMoving">
      <line
        v-for="line of auxiliaryLine"
        v-bind="line"
        stroke="#000"
        stroke-dasharray="5"
      ></line>
    </g>
    <g ref="dragRef" class="active-sprites-container" :transform="transform">
      <!-- 这里只能fill: none 防止点击不到下面的精灵 -->
      <rect
        x="0"
        y="0"
        :width="activeBoundingBox.width"
        :height="activeBoundingBox.height"
        stroke="#398cfe"
        fill="none"
      />
      <slot />
      <rect
        v-for="dot of resizePoints"
        :key="dot.side"
        :width="dotSize"
        :height="dotSize"
        fill="#fff"
        stroke-width="1"
        stroke="#398cfe"
        v-bind="getHandlePoint(activeBoundingBox, dot.side, dotSize)"
        @mousedown="onDotMousedown(dot, $event)"
      />

      <g
        v-if="isShowRotate"
        @mousedown="onRotateMousedown"
        :transform="`translate(${+activeBoundingBox.width / 2 - 5} , -30)`"
      >
        <circle r="5" stroke="#398cfe" fill="#fff"></circle>
      </g>
    </g>
  </g>
</template>

<script setup lang="ts">
import {
  getHandlePoint,
  findParentByClass,
  calcResizeBoxInfoWithoutRotate,
  calcMoveBoxInfoWithoutRotate,
  getSelectList,
  findById,
  getPathByKey,
} from "../../utils/index";
import { HANDLER } from "../../utils/types";

import {
  computed,
  ref,
  // inject,
  onMounted,
  onUnmounted,
  // type Ref,
  nextTick,
} from "vue";
import { IBoundingBox, IStage, ISprite, SPRITE_NAME } from "../meta-data/types";

import { getWrapperBoxInfo } from "../../utils/index";
// import { IHandleTarget } from "../../types";

function handleSelectExactly(e: MouseEvent) {
  setIsMoving(false);
  // 双击选中
  // 1.如果是组，则选中确切点击的组
  const spriteDom = findParentByClass(e.target, "sprite-container");
  if (!spriteDom) return;

  // 查找 id 点击的精灵的id
  const id = spriteDom?.getAttribute("data-sprite-id");

  const find = findById(props.spriteList, id);
  if (find) {
    emits("select", {
      targetIds: [id],
      mode: find.type === SPRITE_NAME.GROUP ? "default" : "edit",
    });
  }
}

// const svgRef = inject("svgRef") as Ref<HTMLElement>;
onMounted(() => {
  document.addEventListener("pointerdown", onMousedown, false);
  document.addEventListener("dblclick", handleSelectExactly, false);
});

onUnmounted(() => {
  document.removeEventListener("pointerdown", onMousedown, false);
  document.removeEventListener("dblclick", handleSelectExactly, false);
});

const dotSize = computed(() => {
  const size = 6;
  return size / props.stage.scale;
});

// 是否正在拖拽
const isMoving = ref(false);

function setIsMoving(val: boolean) {
  isMoving.value = val;
}

const props = defineProps<{
  // 舞台尺寸
  stage: IStage;
  // 精灵列表
  spriteList: ISprite[];
  // 活跃精灵ids Set
  activeIdsSet: Set<string>;
  // 已经注册的精灵元数据map
  registerSpriteMetaMap: Record<string, any>;
}>();
const emits = defineEmits([
  "move",
  "move-end",
  "resize",
  "resize-end",
  "rotate",
  "select",
  "updateSprite",
]);

type IDot = {
  side: HANDLER;
  cursor?: string;
};
const dotList: IDot[] = [
  { side: HANDLER.TM, cursor: "n-resize" },
  { side: HANDLER.BM, cursor: "n-resize" },
  { side: HANDLER.ML, cursor: "e-resize" },
  { side: HANDLER.MR, cursor: "e-resize" },
  { side: HANDLER.TL, cursor: "se-resize" },
  { side: HANDLER.TR, cursor: "sw-resize" },
  { side: HANDLER.BL, cursor: "sw-resize" },
  { side: HANDLER.BR, cursor: "se-resize" },
];

// 辅助线
const auxiliaryLine = ref<any>([]);

// 计算选框信息
const activeBoundingBox = computed(() => {
  const ids = [...props.activeIdsSet];
  const spriteArr = ids.map((m) => {
    const path = getPathByKey(m, props.spriteList);
    const res = path[path.length - 1];
    const point = path.reduce(
      (total, cur) => {
        const { x, y } = cur.boundingBox;
        total.x += x;
        total.y += y;
        return total;
      },
      {
        x: 0,
        y: 0,
      }
    );

    res.boundingBox.x = point.x;
    res.boundingBox.y = point.y;
    return res;
  });

  return (
    getWrapperBoxInfo(spriteArr.map((m) => m.boundingBox)) || {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    }
  );
});

// 形变点数组渲染
const resizePoints = computed(() => {
  if (props.activeIdsSet.size === 1) {
    const [firstId] = props.activeIdsSet;
    const sprite: ISprite = findById(props.spriteList, firstId)!;

    const activeMeta = props.registerSpriteMetaMap[sprite.type];

    if (activeMeta.resizePoints === "all") {
      return dotList;
    }
    if (activeMeta.resizePoints === "empty") {
      return [];
    }
  } else {
    return dotList;
  }
  return [];
  // return dotList;
});

// 旋转操作杆渲染
const isShowRotate = computed(() => {
  // const { registerSpriteMetaMap, activeIndex, spriteList } = props;
  // const activeMeta =
  //   registerSpriteMetaMap[(spriteList[activeIndex] as ISprite).type];
  return false;
});

// 坐标变换
const transform = computed(() => {
  const centerX = activeBoundingBox.value.x + activeBoundingBox.value.width / 2;
  const centerY =
    activeBoundingBox.value.y + activeBoundingBox.value.height / 2;
  const translateStr = `translate(${activeBoundingBox.value.x}, ${activeBoundingBox.value.y})`;
  const rotateStr = `rotate(${0} ${centerX} ${centerY})`;
  return `${rotateStr} ${translateStr}`;
});

// 做一个缓存，保存当前拖拽的盒子信息，坐标是舞台上的坐标
let boxInfoInStage = {};

function onDotMousedown(dotInfo: IDot, e: MouseEvent) {
  e.stopPropagation();
  e.preventDefault();
  setIsMoving(false);

  // 1.按下去的一瞬间 缓存当前的盒子信息
  const lastDragInfo = { ...activeBoundingBox.value };

  const list = JSON.parse(JSON.stringify(props.spriteList));
  const needChangeSprite: ISprite[][] = [...props.activeIdsSet].map((id) =>
    getPathByKey(id, list).reverse()
  );

  // 只需要管理最外层做对比
  const staticSpriteList = props.spriteList.filter((f) => {
    return !props.activeIdsSet.has(f.id);
  });
  // 5.计算中心点的坐标

  const onMousemove = (moveEv: MouseEvent) => {
    setIsMoving(true);
    const { target, lines } = calcResizeBoxInfoWithoutRotate({
      stage: props.stage,
      handleType: dotInfo.side,
      rect: lastDragInfo,
      needChangeSprite,
      staticSpriteList,
      startEv: e,
      moveEv: moveEv,
    });
    auxiliaryLine.value = lines;

      emits(
      "updateSprite",
      target.map((m: any) => {
        return {
          id: m.id,
          stateSet: [
            {
              path: "boundingBox.x",
              value: m.boundingBox.x,
            },
            {
              path: "boundingBox.y",
              value: m.boundingBox.y,
            },
            {
              path: "boundingBox.width",
              value: m.boundingBox.width,
            },
            {
              path: "boundingBox.height",
              value: m.boundingBox.height,
            },
          ],
        };
      })
    );
  };
  const onMouseup = (_e: MouseEvent) => {
    setIsMoving(false);

    emitData("resize-end");
    document.removeEventListener("pointermove", onMousemove);
    document.removeEventListener("pointerup", onMouseup);
  };
  document.addEventListener("pointermove", onMousemove);
  document.addEventListener("pointerup", onMouseup);
}

// 拖拽元素
const dragRef = ref<HTMLElement | null>(null);

/*
 * 鼠标按下事件
 */
async function onMousedown(e: MouseEvent) {
  setIsMoving(false);
  const spriteDom = findParentByClass(e.target, "sprite-container");
  if (!spriteDom) return;

  // 查找 id 点击的精灵的id
  const id = spriteDom?.getAttribute("data-sprite-id");
  console.log(id, "id");

  const targetIds = getSelectList({
    id,
    activeIdsSet: props.activeIdsSet,
    allList: props.spriteList,
  });

  //代码丑陋, 输入只是点击，有可能会后触发mouseup，导致坐标数据是以前的，所以在计算出选中后吗，立马更新坐标数据
  boxInfoInStage = {};
  emits("select", { targetIds });

  // return
  // Object.assign(boxInfoInStage, selectSprite.boundingBox);
  // 如果不是鼠标左键 return
  if (e.button !== 0) return;

  // 传出事件，再等待新的props
  await nextTick();
  const lastDragInfo = { ...activeBoundingBox.value };
  const list = JSON.parse(JSON.stringify(props.spriteList));
  const needChangeSprite = [...props.activeIdsSet].map((id) =>
    getPathByKey(id, list).reverse()
  );
  // 只需要管理最外层做对比
  const staticSpriteList = props.spriteList.filter((f) => {
    return !props.activeIdsSet.has(f.id);
  });

  const onMousemove = (ev: MouseEvent) => {
    setIsMoving(true);
    const { target, lines } = calcMoveBoxInfoWithoutRotate({
      rect: lastDragInfo,
      stage: props.stage,
      needChangeSprite,
      staticSpriteList,
      startEv: e,
      moveEv: ev,
    });
    auxiliaryLine.value = lines;

    emits(
      "updateSprite",
      target.map((m: any) => {
        return {
          id: m.id,
          stateSet: [
            {
              path: "boundingBox.x",
              value: m.boundingBox.x,
            },
            {
              path: "boundingBox.y",
              value: m.boundingBox.y,
            },
            {
              path: "boundingBox.width",
              value: m.boundingBox.width,
            },
            {
              path: "boundingBox.height",
              value: m.boundingBox.height,
            },
          ],
        };
      })
    );
  };

  const onMouseup = async (_e: MouseEvent) => {
    emitData("move-end");
    setIsMoving(false);
    // 移除document事件
    document.removeEventListener("pointermove", onMousemove, false);
    document.removeEventListener("pointerup", onMouseup, false);
  };
  // 位document注册鼠标移动事件
  document.addEventListener("pointermove", onMousemove, false);
  // 鼠标抬起事件
  document.addEventListener("pointerup", onMouseup, false);
}

function onRotateMousedown(e: MouseEvent) {
  console.log(e);
}

function emitData(
  type: "move" | "move-end" | "resize" | "resize-end" | "rotate"
) {
  emits(type, { ...boxInfoInStage });
  // }
}
</script>

<style lang="scss"></style>
