import { SPRITE_NAME } from "./types";
import { rectSpriteMeta } from "./rect-sprite-meta";
import { lineSpriteMeta } from "./line-sprite-meta";
import { roundRectSpriteMeta } from "./roundrect-sprite-meta"
import { textSpriteMeta } from "./text-sprite-meta";
import { polylineSpriteMeta } from "./polyline-sprite-meta"
import { groupSpriteMeta } from "./group-sprite-meta";
import { polygonSpriteMeta } from "./polygon-sprite-meta";
import { stageMeta } from "./stage-meta";

export const default_sprite_data: Record<SPRITE_NAME, any> = {
  [SPRITE_NAME.STAGE]: stageMeta,
  [SPRITE_NAME.RECT]: rectSpriteMeta,
  [SPRITE_NAME.LINE]: lineSpriteMeta,
  [SPRITE_NAME.ROUND_RECT]: roundRectSpriteMeta,
  [SPRITE_NAME.TEXT]: textSpriteMeta,
  [SPRITE_NAME.POLYLINE]: polylineSpriteMeta,
  [SPRITE_NAME.POLYGON]: polygonSpriteMeta,
  [SPRITE_NAME.GROUP]: groupSpriteMeta,
};
