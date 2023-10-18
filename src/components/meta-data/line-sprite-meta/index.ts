/* 线段精灵 元数据 */
import { ISprite, ISpriteMeta, SPRITE_NAME } from "../types";
import LineSprite from "../../sprite/line-sprite/index.vue";
export const lineSpriteMeta: ISpriteMeta = {
  title: "线段",
  // 初始化描述数据
  createInitData() {
    return {
      id: "LineSpriteMeta1",
      type: SPRITE_NAME.LINE,
      attrs: {
        stroke: "#84db92",
        strokeWidth: 3,
        
        // points 的单位是相对单位,相对宽高的比率
        points: [
          {
            x: 0,
            y: 0,
          },
          {
            x: 1,
            y: 1,
          },
        ],
      },
      boundingBox: {
        x: 30,
        y: 100,
        width: 30,
        height: 40,
      },
    };
  },
  type: SPRITE_NAME.LINE,
  // 组件
  component: LineSprite,
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
    getPoints: ({ sprite }: { sprite: ISprite }) => {
      const { points } = sprite.attrs;
      return [...points];
    },
  },
};
