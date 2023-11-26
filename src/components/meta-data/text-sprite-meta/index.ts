/* 文本精灵 元数据 */

import { ISpriteMeta, SPRITE_NAME } from "../types";
import TextSprite from "../../sprite/text-sprite/index.vue";
import GenNonDuplicateID from "../../../utils/getUuid";

import { classifyList, configSchemaMap } from "./attrs-meta/index";
export const textSpriteMeta: ISpriteMeta = {
  title: "文本",
  type: SPRITE_NAME.TEXT,
  createInitData() {
    return {
      id: GenNonDuplicateID(),
      type: SPRITE_NAME.TEXT,
      attrs: {
        // fill: "#fdc5bf"
        fill: "#eee",
        content: '文本',

        contentFontFamily: "Microsoft YaHei", // 字体
        contentFontSize: 16, // 字体大小
        justifyContent: "center", // 水平对齐方式
        alignItems: "center", // 垂直对齐方式
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
  attrsConfig: {
    configSchemaMap, // schema 描述
    classifyList, // 属性分类列表
  }, // 属性面板描述
};
