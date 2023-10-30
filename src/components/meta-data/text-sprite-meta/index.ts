/* 文本精灵 元数据 */

import { ISpriteMeta, SPRITE_NAME } from "../types";
import TextSprite from "../../sprite/text-sprite/index.vue";
export const textSpriteMeta: ISpriteMeta = {
  title: "文本",
  type: SPRITE_NAME.TEXT,
  createInitData() {
    return {
      id: Math.random() + '',
      type: SPRITE_NAME.TEXT,
      attrs: {
        // fill: "#fdc5bf"
        fill: "#eee",
        content: '123',
      },
      boundingBox: {
        x: 100,
        y: 100,
        width: 160,
        height: 100,
      },
    };
  },
  icon: new URL("../../../assets/icon/文本.svg", import.meta.url).href,
  component: TextSprite,
  resizePoints: "empty", // 'all' 代表有所有的形变点
  isShowRotateHandle: false, // 是否显示旋转操作杆
};
