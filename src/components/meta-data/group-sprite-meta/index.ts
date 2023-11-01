import { IBoundingBox } from "./../types";
import { getWrapperBoxInfo } from "../../../utils/index";
import { classifyList, configSchemaMap } from "./attrs-meta/index"
/* 组合精灵 元数据 */

import { ISpriteMeta, SPRITE_NAME } from "../types";
export const groupSpriteMeta: ISpriteMeta = {
  title: "组合",
  type: SPRITE_NAME.GROUP,
  createInitData(boundingList: IBoundingBox[]) {
    const boundingBox = getWrapperBoxInfo(boundingList);
    console.log(boundingBox, 'boundingBox');
    
    return {
      id: Math.random() + "",
      type: SPRITE_NAME.GROUP,
      attrs: {
        fill: "#eee",
      },
      boundingBox,
      children: [],
    };
  },
  // component: RectSprite,
  resizePoints: "all", // 'all' 代表有所有的形变点
  isShowRotateHandle: false, // 是否显示旋转操作杆
  attrsConfig: {
    configSchemaMap, // schema 描述
    classifyList, // 属性分类列表
  }, // 属性面板描述
};
