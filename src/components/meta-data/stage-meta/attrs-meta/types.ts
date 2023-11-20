// 配置schema
export type IConfigSchema = {
  propType?: "single"; // value类型
  prop: string; // 属性字段
  label: string; // 属性名字
  path: string; // 属性的路径
  renderComponent: string; // 对用用来渲染的组件类型
  valueType?: "string" | "number" | "color"; // value类型
  defaultValue?: any; // 默认值
  inValFormat?: Function; // 接收数据的格式化
  outValFormat?: Function; // 设置数据的格式化
} | {
  schemaType?: "group"; // value类型
  renderComponent: string; // 对用用来渲染的组件类型
  propMap: Record<string, IConfigSchema>
}

// 能够配置的基础属性枚举
export enum PROP_ENUM {
  // 宽
  width = "width",
  // 高
  height = "height",
  // 背景纯色
  backgroundColor = "backgroundColor",
  // 背景渐变色
  backgroundGradient = "backgroundGradient",
}

export interface IClassifyItem {

}

// 属性组合key
export enum PROP_GROUP {
  'bg-pure-Gradient-color' = 'bg-pure-Gradient-color'
}
