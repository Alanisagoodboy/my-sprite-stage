/* 线段精灵 元数据 */
import { ISpriteMeta, SPRITE_NAME } from "../types";
import PolygonSprite from "../../sprite/polygon-sprite/index.vue";
import { createAnchorsForLine } from "../helps";
import GenNonDuplicateID from "../../../utils/getUuid";
import { classifyList, configSchemaMap } from "./attrs-meta/index";
const { getPoints, pointChange } = createAnchorsForLine();
export const polygonSpriteMeta: ISpriteMeta = {
  title: "多边形",
  // 初始化描述数据
  createInitData() {
    return {
      id: GenNonDuplicateID(),
      type: SPRITE_NAME.POLYGON,
      attrs: {
        stroke: "#84db92",
        strokeWidth: 10,
        fill: "transparent",
        gradientFill: "", // 渐变填充
        points: [
          {
            x: 0,
            y: 0,
          },
          {
            x: 1,
            y: 0,
          },
          {
            x: 1,
            y: 1,
          },
          {
            x: 0,
            y: 1,
          },
        ],
      },
      boundingBox: {
        x: 30,
        y: 100,
        width: 150,
        height: 120,
      },
    };
  },
  type: SPRITE_NAME.POLYGON,
  icon: new URL("../../../assets/icon/圆角矩形.svg", import.meta.url).href,
  // 组件
  component: PolygonSprite,
  resizePoints: "empty", // 为空代表没有缩放的点
  isShowRotateHandle: false, // 是否显示旋转操作杆
  // 锚点
  anchors: {
    /**
     * 获得锚点的能力
     * 线段的锚点能力来自两个端点
     * @param param0
     * @returns
     */
    getPoints,
    pointChange,
  },
  attrsConfig: {
    configSchemaMap, // schema 描述
    classifyList, // 属性分类列表
  }, // 属性面板描述
};
