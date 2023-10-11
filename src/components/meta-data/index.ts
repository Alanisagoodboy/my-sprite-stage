import { type ISprite, SPRITE_NAME } from "./types";

import RectSprite from "../sprite/rect-sprite/index.vue"

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
          x1: 0,
          y1: 0,
          x2: 160,
          y2: 100,
        },
        attrs: {
          coordinate: { x: 100, y: 240 },
          size: { width: 160, height: 100 },
          angle: 0,
        },
      };
    },
    component: RectSprite,
  },
};
