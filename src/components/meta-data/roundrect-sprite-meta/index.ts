import { ICoordinate } from "./../types";
/* 圆角矩形精灵 元数据 */

import { ISprite, ISpriteMeta, SPRITE_NAME } from "../types";
import RoundRectSprite from "../../sprite/roundrect-sprite/index.vue";
export const roundRectSpriteMeta: ISpriteMeta = {
  title: "圆角矩形",
  type: SPRITE_NAME.ROUND_RECT,
  createInitData() {
    return {
      id: Math.random() + '',
      type: SPRITE_NAME.ROUND_RECT,
      attrs: {
        borderRadius: 30,
        strokeDasharray: "2 2",
      },
      boundingBox: {
        x: 50,
        y: 50,
        width: 200,
        height: 100,
      },
    };
  },
  component: RoundRectSprite,
  resizePoints: "all", // 'all' 代表有所有的形变点
  isShowRotateHandle: false, // 是否显示旋转操作杆
  anchors: {
    // 锚点中的坐标都以百分比小数呈现，方便与宽高联系起来
    getPoints: ({ sprite }: { sprite: ISprite }) => {
      const { width, height } = sprite.boundingBox;
      const { borderRadius = 0 } = sprite.attrs;
      const r = (borderRadius / 100) * Math.min(width, height);
      return [{ x: r / width, y: 0 }];
    },
    // 锚点变化时
    pointChange: ({
      sprite,
      targetPointsInStage,
    }: {
      sprite: ISprite;
      targetPointsInStage: ICoordinate[];
    }) => {
      const {x: pointX} = targetPointsInStage[0]
      // 根据锚点最新位置计算圆角大小
      const { boundingBox } = sprite;
      const { x, width, height } = boundingBox;
      const len = Math.min(width, height);
      const r = Math.max(0, Math.min(len / 2, pointX - x));
      const borderRadius = (100 * r) / len;

      return {
        id: sprite.id,
        sprite: {
          ...sprite,
          attrs: {
            ...sprite.attrs,
            borderRadius
          }
        },
        updateProps: [
          {
            path: 'attrs.borderRadius',
            value: borderRadius
          }
        ]
      }
    },
  },
  ports: {
    // 单位为小数百分比
    points: [
      { x: 50, y: 0, arcAngle: 270 },
      { x: 50, y: 100, arcAngle: 90 },
      { x: 0, y: 50, arcAngle: 180 },
      { x: 100, y: 50, arcAngle: 0 },
    ],
  },
};
