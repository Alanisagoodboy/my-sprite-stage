/* 圆角矩形精灵 元数据 */

import { ISprite, ISpriteMeta, SPRITE_NAME } from "../types";
import RoundRectSprite from "../../sprite/roundrect-sprite/index.vue";
export const roundRectSpriteMeta: ISpriteMeta = {
  title: "圆角矩形",
  type: SPRITE_NAME.ROUND_RECT,
  createInitData() {
    return {
      id: "ZZ460UPV",
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
    getPoints: ({ sprite }: { sprite: ISprite }) => {
      const { width, height } = sprite.boundingBox;
      const { borderRadius = 0 } = sprite.attrs;
      const r = (borderRadius / 100) * Math.min(width, height);
      return [{ x: r, y: 0 }];
    },
  },
  ports: {
    // 单位为百分比
    points: [
      { x: 50, y: 0, arcAngle: 270 },
      { x: 50, y: 100, arcAngle: 90 },
      { x: 0, y: 50, arcAngle: 180 },
      { x: 100, y: 50, arcAngle: 0 },
    ],
  },
};
