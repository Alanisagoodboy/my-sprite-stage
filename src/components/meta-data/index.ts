import { SPRITE_NAME } from "./types";
import { rectSpriteMeta } from "./rect-sprite-meta";
import { lineSpriteMeta } from "./line-sprite-meta";

export const default_sprite_data: Record<SPRITE_NAME, any> = {
  [SPRITE_NAME.RECT]: rectSpriteMeta,
  [SPRITE_NAME.LINE]: lineSpriteMeta,
  [SPRITE_NAME.ROUND_RECT]: rectSpriteMeta
};
