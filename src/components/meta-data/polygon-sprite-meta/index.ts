/* 线段精灵 元数据 */
import { ISpriteMeta, SPRITE_NAME } from "../types";
import PolygonSprite from "../../sprite/polygon-sprite/index.vue";
import { createAnchorsForLine } from "../helps";
const { getPoints, pointChange } = createAnchorsForLine();
export const polygonSpriteMeta: ISpriteMeta = {
  title: "多边形",
  // 初始化描述数据
  createInitData() {
    return {
      id: Math.random() + '',
      type: SPRITE_NAME.POLYGON,
      attrs: {
        stroke: "#84db92",
        strokeWidth: 3,
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
        width: 100,
        height: 80,
      },
    };
  },
  type: SPRITE_NAME.POLYGON,
  icon: new URL("../../../assets/icon/折线.svg", import.meta.url).href,
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
};
