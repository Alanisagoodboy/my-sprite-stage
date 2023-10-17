/* 文本精灵 元数据 */

import { ISpriteMeta, SPRITE_NAME } from "../types";
import TextSprite from "../../sprite/text-sprite/index.vue";
export const textSpriteMeta: ISpriteMeta = {
  title: "文本",
  type: SPRITE_NAME.TEXT,
  createInitData() {
    return {
      id: "TextSprite1",
      type: SPRITE_NAME.TEXT,
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
  component: TextSprite,
  resizePoints: "all", // 'all' 代表有所有的形变点
  isShowRotateHandle: false, // 是否显示旋转操作杆
};
