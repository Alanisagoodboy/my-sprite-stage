import { getNumberValid } from "./helper";
import { IClassifyItem, IConfigSchema, PROP_ENUM } from "./types";

type IParams = {
  schema: IConfigSchema;
  value: any;
};

// 配置的属性对应的schema
export const configSchemaMap: Record<PROP_ENUM, IConfigSchema> = {
  width: {
    prop: "width",
    label: "W",
    valueType: "number",
    path: "boundingBox.width",
    renderComponent: "input",
    defaultValue: 0,
    inValFormat: ({ schema, value }: IParams) =>
      getNumberValid(value, schema.defaultValue),
    outValFormat: ({ schema, value }: IParams) =>
      getNumberValid(value, schema.defaultValue),
  },
  height: {
    prop: "height",
    label: "H",
    valueType: "number",
    path: "boundingBox.height",
    renderComponent: "input",
    defaultValue: 0,
    inValFormat: ({ schema, value }: IParams) =>
      getNumberValid(value, schema.defaultValue),
    outValFormat: ({ schema, value }: IParams) =>
      getNumberValid(value, schema.defaultValue),
  },
  x: {
    prop: "x",
    label: "X",
    valueType: "number",
    path: "boundingBox.x",
    renderComponent: "input",
    defaultValue: 0,
    inValFormat: ({ schema, value }: IParams) =>
      getNumberValid(value, schema.defaultValue),
    outValFormat: ({ schema, value }: IParams) =>
      getNumberValid(value, schema.defaultValue),
  },
  y: {
    prop: "y",
    label: "Y",
    valueType: "number",
    path: "boundingBox.y",
    renderComponent: "input",
    defaultValue: 0,
    inValFormat: ({ schema, value }: IParams) =>
      getNumberValid(value, schema?.defaultValue),
    outValFormat: ({ schema, value }: IParams) =>
      getNumberValid(value, schema?.defaultValue),
  },
  fill: {
    prop: "fill",
    label: "填充色",
    valueType: "color",
    path: "attrs.fill",
    renderComponent: "color-picker",
    defaultValue: "#ccc",
    inValFormat: ({ value }: IParams) => {
      return value;
    },
    outValFormat: ({ value }: IParams) => {
      return value;
    },
  },
  stroke: {
    prop: "stroke",
    label: "边框颜色",
    valueType: "color",
    path: "attrs.stroke",
    renderComponent: "color-picker",
    defaultValue: "#398cfe",
  },
  strokeWidth: {
    prop: "strokeWidth",
    label: "边框宽度",
    valueType: "color",
    path: "attrs.strokeWidth",
    renderComponent: "input",
    defaultValue: 3,
    inValFormat: ({ schema, value }: IParams) =>
      getNumberValid(value, schema.defaultValue),
    outValFormat: ({ schema, value }: IParams) =>
      getNumberValid(value, schema.defaultValue),
  },
};

// 分类列表
export const classifyList: IClassifyItem[] = [
  {
    name: "a", // 分类的字段
    title: "位置尺寸", // 分类的名称
    configList: [PROP_ENUM.x, PROP_ENUM.y, PROP_ENUM.width, PROP_ENUM.height],
  },
  {
    name: "b", // 分类的字段
    title: "背景色", // 分类的名称
    configList: [PROP_ENUM.fill],
  },
  {
    name: "c", // 分类的字段
    title: "边框", // 分类的名称
    configList: [PROP_ENUM.stroke, PROP_ENUM.strokeWidth],
  },
];
