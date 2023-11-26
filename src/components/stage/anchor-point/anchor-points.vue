<template>
  <g
    v-for="item of anchorPointsList"
    :key="item.sprite.id"
    :transform="`translate(${item.sprite.boundingBox.x} ${item.sprite.boundingBox.y})`"
  >
    <circle
      :r="r"
      :cx="point.x"
      :cy="point.y"
      v-for="(point, index) of item.anchorPoints"
      :key="index"
      fill="#FFF"
      stroke="#398cfe"
      stroke-width="1"
      filter="drop-shadow(rgba(0, 0, 0, 0.4) 0 0 5)"
      @pointerdown="handleDown($event, item, +index)"
    ></circle>
  </g>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ICoordinate, ISprite } from "../../meta-data/types";
import { default_sprite_data } from "../../meta-data";
import { findById, getPathByKey } from "@/utils";

const p = defineProps<{
  // 舞台尺寸
  stage: ISprite;
  // 精灵列表
  spriteList: ISprite[];
  // 活跃精灵ids Set
  activeIdsSet: Set<string>;
}>();

const emits = defineEmits([
  "anchor-point-move",
  "select",
  "anchor-point-move-end",
]);

const r = computed(() => {
  const size = 4;
  return size / p.stage.attrs.scale;
});

// 渲染的锚点信息, 真正的锚点是舞台坐标系下的锚点，所以我只要修改points 就能渲染出锚点坐标
const anchorPointsList = computed(() => {
  let arr: {
    sprite: ISprite;
    ratePoint: ICoordinate[];
    anchorPoints: ICoordinate[];
  }[] = [];

  p.activeIdsSet.forEach((id) => {
    const sprite = findById(p.spriteList, id);
    if (sprite) {
      const { anchors } = default_sprite_data[sprite.type];
      if (anchors) {
        const { width, height } = sprite.boundingBox;

        // 计算锚点坐标
        const path = getPathByKey(sprite.id, p.spriteList);
        const point = path.slice(0, -1).reduce(
          (total, cur) => {
            return {
              x: total.x + cur.boundingBox.x,
              y: total.y + cur.boundingBox.y,
            };
          },
          {
            x: 0,
            y: 0,
          }
        );
        const ratePoint = anchors.getPoints({ sprite });
        const anchorPoints = ratePoint.map((m: ICoordinate) => {
          return {
            x: m.x * width + point.x,
            y: m.y * height + point.y,
          };
        });
        arr.push({
          sprite,
          ratePoint,
          anchorPoints,
        });
      }
    }
  });

  return arr;
});

// 按下
function handleDown(
  downEvent: MouseEvent,
  activeInfo: {
    sprite: ISprite;
    anchorPoints: ICoordinate[];
    ratePoint: ICoordinate[];
  },
  index: number
) {
  // 阻止冒泡 防止触发移动事件
  downEvent.stopPropagation();
  // 阻止默认拖拽等事件，防止无法触发up事件
  downEvent.preventDefault();

  let active = JSON.parse(JSON.stringify(activeInfo));

  emits("select", activeInfo.sprite.id);

  function handleMove(moveEvent: MouseEvent) {
    const [moveX, moveY] = [
      (moveEvent.clientX - downEvent.clientX) / p.stage.attrs.scale,
      (moveEvent.clientY - downEvent.clientY) / p.stage.attrs.scale,
    ];
    const { width, height, x, y } = active.sprite.boundingBox;
    // 计算锚点坐标
    const targetPoint = active.ratePoint.map((m, i) => {
      return {
        x: (i === index ? m.x * width + moveX : m.x * width) + x,
        y: (i === index ? m.y * height + moveY : m.y * height) + y,
      };
    });
    const info = default_sprite_data[active.sprite.type].anchors.pointChange({
      sprite: activeInfo.sprite,
      targetPoint: targetPoint,
    });

    emits("anchor-point-move", info);
  }

  function handleUp() {
    emits("anchor-point-move-end");
    document.removeEventListener("pointerup", handleUp, false);
    document.removeEventListener("pointermove", handleMove, false);
  }

  document.addEventListener("pointerup", handleUp, false);
  document.addEventListener("pointermove", handleMove, false);
}
</script>
