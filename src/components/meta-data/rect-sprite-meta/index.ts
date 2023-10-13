/* 矩形精灵 元数据 */

import { SPRITE_NAME } from "../types";
import RectSprite from '../../sprite/rect-sprite/index.vue'
export const rectSpriteMeta = {
  type: SPRITE_NAME.RECT,
  createInitData() {
    return {
      id: "RectSprite1",
      type: SPRITE_NAME.RECT,
      props: {
        // fill: "#fdc5bf"
        fill: "#eee",
      },
      attrs: {
        coordinate: { x: 100, y: 100 },
        size: { width: 160, height: 100 },
        angle: 0,
      },
    };
  },
  component: RectSprite,
  resizePoints: "all", // 'all' 代表有所有的形变点
  isShowRotateHandle: false, // 是否显示旋转操作杆
};
