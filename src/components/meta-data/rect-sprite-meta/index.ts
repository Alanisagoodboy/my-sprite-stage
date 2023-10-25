/* 矩形精灵 元数据 */

import { ISpriteMeta, SPRITE_NAME } from "../types";
import RectSprite from "../../sprite/rect-sprite/index.vue";
import attrsConfig from "./attrs-meta/index"
export const rectSpriteMeta: ISpriteMeta = {
  title: "矩形",
  type: SPRITE_NAME.RECT,
  createInitData() {
    return {
      id: Math.random() + '',
      type: SPRITE_NAME.RECT,
      attrs: {
        // fill: "#fdc5bf"
        fill: "#eee",
      },
      boundingBox: {
        x: 100,
        y: 100,
        width: 160,
        height: 100,
      },
    };
  },
  component: RectSprite,
  resizePoints: "all", // 'all' 代表有所有的形变点
  isShowRotateHandle: false, // 是否显示旋转操作杆
  attrsConfig: attrsConfig, // 属性面板描述
};
