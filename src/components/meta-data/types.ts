import { Component } from "vue";
export enum SPRITE_NAME {
  STAGE = "Stage", // 舞台
  TEXT = "TextSprite", // 文本
  RECT = "RectSprite", // 矩形
  LINE = "LineSprite", // 线段
  ROUND_RECT = "RoundRectSprite", // 圆角矩形
  POLYLINE = "PolylineSprite", // 折线
  POLYGON = "PolygonSprite", // 多边形
  GROUP = "GroupSprite", // 组合精灵
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
export interface IBoxMove extends IBoundingBox {
  dx: number;
  dy: number;
}

// 舞台
export interface IStage {
  width: number; // 宽
  height: number; // 高
  scale: number; // 缩放（0~1）
  backgroundColor: string; // 背景色
}

// 精灵
export interface ISprite<IProps = any> {
  id: string; // 精灵id
  type: SPRITE_NAME; // 精灵名字/类型
  attrs: IProps; // 属性
  boundingBox: IBoundingBox;
  mode?: Mode; // 精灵模式
  children?: Array<ISprite<IProps>>;
}

// 精灵当前操作模式
type Mode = "default" | "edit";

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
  createInitData: any; // 创建精灵的初始数据函数
  icon?: any; // 图标
  component?: Component; // 精灵组件, 组合精灵没有对应精灵组件
  resizePoints?: "all" | "empty"; // 矩形选框的句柄形变点配置
  isShowRotateHandle?: boolean; // 是否可以旋转
  anchors?: Record<string, any>; // 锚点
  ports?: Record<string, any>; // 连线桩
  attrsConfig?: Record<string, any>; // 属性配置
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

/* *********************************************** */
// 配置schema
export interface IConfigSchema {
  // 属性配置描述
  prop: string; // 属性标识
  label: string; // 属性名字
  path?: string; // 属性的路径
  renderComponent: string; // 对用用来渲染的组件类型
  valueType?: "string" | "number" | "color"; // value类型
  defaultValue?: any; // 默认值
  inValFormat?: Function; // 接收数据的格式化
  outValFormat?: Function; // 设置数据的格式化
  groupProps?: Record<string, IConfigSchema> // 组合属性
}

// 描述数据的类型
export enum ENUM_SCHEMA_TYPE {
  base,
  group,
}

// 属性面板分类的item
export interface IClassifyItem {
  name: string; // 面板key
  title: string; // 描述信息
  configList: IConfigSchema[]; // 配置列表
}


export enum ENUM_RenderComponent {
  'textJustifyAlign' = 'text-justify-align',
  "textFontFamily" = "text-font-family",
}
