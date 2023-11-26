/* 矩形精灵 元数据 */

import { ISpriteMeta, SPRITE_NAME } from "../types";
import RectSprite from "../../sprite/rect-sprite/index.vue";
import { classifyList, configSchemaMap } from "./attrs-meta/index";
import GenNonDuplicateID from "../../../utils/getUuid";
export const rectSpriteMeta: ISpriteMeta = {
  title: "矩形",
  type: SPRITE_NAME.RECT,
  createInitData() {
    return {
      id: GenNonDuplicateID(), // 唯一标识
      type: SPRITE_NAME.RECT, // 类型
      attrs: {
        fill: "#eee", // 填充色
        gradientFill: "", // 渐变填充
        stroke: "#398cfe", // 边框颜色
        strokeWidth: 0, // 边框宽度

        content: "", // 内容
        contentFontFamily: "Microsoft YaHei", // 字体
        contentFontSize: 16, // 字体大小
        justifyContent: "center", // 水平对齐方式
        alignItems: "center", // 垂直对齐方式
      },
      boundingBox: {
        x: 100, // 左上角 x 坐标
        y: 100, // 左上角 y 坐标
        width: 160, // 宽度
        height: 100, // 高度
      },
      mode: "default",
    };
  },
  icon: new URL("../../../assets/icon/矩形.svg", import.meta.url).href,
  component: RectSprite,
  resizePoints: "all", // 'all' 代表有所有的形变点
  isShowRotateHandle: false, // 是否显示旋转操作杆
  attrsConfig: {
    configSchemaMap, // schema 描述
    classifyList, // 属性分类列表
  }, // 属性面板描述
};
