import { IBoundingBox, ISprite, SPRITE_NAME } from "./components/meta-data/types";
export interface IUpdateParams {
  type?: SPRITE_NAME;
  id: string | string[];
  stateSet: IStateSet | IStateSet[];
}

export interface IStateSet {
  path: string;
  value: any;
}

export interface IHandle {
  handleType: "select";
  target: ISprite | ISprite[];
}

export interface IHandleTarget {
  id: string;
  boundingBox: IBoundingBox;
}


