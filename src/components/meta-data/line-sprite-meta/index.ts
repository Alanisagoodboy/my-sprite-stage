/* 线段精灵 元数据 */
import { ISprite, SPRITE_NAME } from "../types";
import LineSprite from '../../sprite/line-sprite/index.vue'
export const lineSpriteMeta = {
  // 初始化描述数据
  createInitData() {
    return {
      id: "LineSpriteMeta1",
      type: SPRITE_NAME.LINE,
      props: {
        stroke: "#84db92",
        strokeWidth: 3,
        start: {
          x: 0,
          y: 0,
        },
        end: {
          x: 160,
          y: 100,
        },
      },
      attrs: {
        coordinate: { x: 100, y: 240 },
        size: { width: 160, height: 100 },
        angle: 0,
      },
    };
  },
  type: SPRITE_NAME.LINE,
  // 组件
  component: LineSprite,
  resizePoints: 'empty', // 为空代表没有缩放的点
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
      const { start, end } = sprite.props;
      return [{ ...start }, { ...end }];
    },
  },
};
