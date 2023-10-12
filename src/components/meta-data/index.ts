import { type ISprite, SPRITE_NAME } from "./types";

import RectSprite from "../sprite/rect-sprite/index.vue";
import LineSprite from "../sprite/line-sprite/index.vue";
// const RectSprite = () => import('../sprite/rect-sprite/index.vue');

export const default_sprite_data: Record<SPRITE_NAME, any> = {
  [SPRITE_NAME.RECT]: {
    createInitData() {
      return {
        id: "RectSprite1",
        type: SPRITE_NAME.RECT,
        props: {
          // fill: "#fdc5bf"
          fill: "#eee",
        },
        attrs: {
          coordinate: { x: 100, y: 100 },
          size: { width: 160, height: 100 },
          angle: 0,
        },
      };
    },
    component: RectSprite,
  },
  [SPRITE_NAME.LINE]: {
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
    component: LineSprite,
    anchors: {
      getPoints: ({ sprite }: { sprite: ISprite }) => {
        const { start, end } = sprite.props;
        return [{ ...start }, { ...end }];
      },
    },
  },
  [SPRITE_NAME.ROUND_RECT]: {
    createInitData() {
      return {
        id: "F8Q0SA2U",
        type: "RectRoundSprite",
        props: {
          borderRadius: 30,
        },
        attrs: {
          coordinate: {
            x: 50,
            y: 50,
          },
          size: {
            width: 100,
            height: 100,
          },
          angle: 0,
          style: {},
          creating: false,
          editing: false,
        },
      };
    },
    component: RectSprite,
  },
};
