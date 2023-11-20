/* 舞台精灵 元数据 */

import { ISpriteMeta, SPRITE_NAME } from "../types";
import { classifyList, configSchemaMap } from "./attrs-meta/index";
export const stageMeta: ISpriteMeta = {
  title: "舞台",
  type: SPRITE_NAME.STAGE,
  createInitData() {
    return {
      id: Math.random() + "",
      type: SPRITE_NAME.STAGE,
      attrs: {
        width: 1920,
        height: 1080,
        scale: 1,
        backgroundColor: "#fff",
        backgroundImage: "",
      },
    };
  },
  attrsConfig: {
    configSchemaMap, // schema 描述
    classifyList, // 属性分类列表
  }, // 属性面板描述
};
