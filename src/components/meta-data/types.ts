import { CSSProperties, Component } from "vue";
export enum SPRITE_NAME {
  TEXT = "TextSprite", // 文本
  RECT = "RectSprite", // 矩形
  LINE = "LineSprite", // 线段
  ROUND_RECT = "RoundRectSprite", // 圆角矩形
  POLYLINE = "PolylineSprite", // 折线
}

// 尺寸
export interface ISize {
  width: number;
  height: number;
}
// 坐标
export interface ICoordinate {
  x: number;
  y: number;
}

// 每个精灵量化为一个矩形
export interface IBoundingBox extends ISize, ICoordinate {}

// 包含移动距离的盒子信息
export interface IBoxMove extends IBoundingBox{
  dx: number;
  dy: number
}
// // 高宽和定位坐标
// export interface ISizeCoordinate {
//   width: number;
//   height: number;
//   x: number;
//   y: number;
// }

// 精灵属性
export interface ISpriteAttrs {
  size: ISize;
  coordinate: ICoordinate;
  angle: number;
  style?: CSSProperties;
  editing?: boolean;
  creating?: boolean;
}

// 精灵属性
export interface ISpriteAttrsLike {
  size?: ISize;
  coordinate?: ICoordinate;
  angle?: number;
  style?: CSSProperties;
  editing?: boolean;
  creating?: boolean;
}

// export interface ISpriteMeta<IProps = any> {
//   type: SPRITE_NAME;
//   spriteComponent: Component
//   initProps?: IProps;
//   initAttrs?: ISpriteAttrs;
// }

// 精灵
export interface ISprite<IProps = any> {
  id: string; // 精灵id
  type: SPRITE_NAME; // 精灵名字/类型
  attrs: IProps; // 属性
  boundingBox: IBoundingBox;
}

// 默认图形props
export interface IDefaultGraphicProps {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  strokeDasharray?: string;
  strokeLinecap?: "butt" | "round" | "square";
  defaultStrokeLinecap?: "butt" | "round" | "square";
}

export interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// 精灵元数据
export interface ISpriteMeta {
  title: string; // 精灵名字
  type: SPRITE_NAME; // 精灵类型
  createInitData: () => ISprite; // 创建精灵的初始数据函数
  component: Component; // 精灵组件
  resizePoints: "all" | "empty"; // 矩形选框的句柄形变点配置
  isShowRotateHandle: boolean; // 是否可以旋转
  anchors?: Record<string, any>; // 锚点
  ports?: Record<string, any>; // 连线桩
}

export interface IPort {
  // 连接桩所属的精灵id
  spriteId: string;
  // 连接桩在所属的精灵中的索引
  index: number;
}

// // 连接线精灵的属性
// const LinkLineProps = {
//   start: {
//     // 点坐标
//     x: 100,
//     y: 100,
//     // 起点连接上了圆角矩形的第二个连接桩
//     port: {
//       spriteId: 'RectRoundSprite1',
//       index: 1,
//     } as IPort,
//   }

// };
export type IStageApis = any;

export type EventTypeEnum = any;
