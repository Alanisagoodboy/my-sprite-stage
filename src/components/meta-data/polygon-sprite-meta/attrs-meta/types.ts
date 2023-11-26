// 配置schema
export interface IConfigSchema {
  prop: string; // 属性字段
  label: string; // 属性名字
  path: string; // 属性的路径
  linkPath?: string | string[]; // 与之关联的路径
  renderComponent: string; // 对用用来渲染的组件类型
  valueType?: "string" | "number" | "color"; // value类型
  defaultValue?: any; // 默认值
  inValFormat?: Function; // 接收数据的格式化
  outValFormat?: Function; // 设置数据的格式化
}

// 分类
export interface IClassifyItem {
  name: string; // 分类的字段
  title: string; // 分类的名称
  configList: PROP_ENUM[]; // 分类具体内容数组名
}

// 能够配置的属性枚举
export enum PROP_ENUM {
  // 宽
  width = "width",
  // 高
  height = "height",
  // x坐标
  x = "x",
  // y坐标
  y = "y",
  // 背景色
  fill = "fill",
  // 边框
  stroke = "stroke",
  // 边框宽度
  strokeWidth = "strokeWidth",
  // 文本
  content = "content",
  // 文本大小
  contentFontSize = "contentFontSize",
  // 文本颜色
  contentColor = "contentColor",
}
