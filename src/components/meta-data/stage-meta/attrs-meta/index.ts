import { getNumberValid } from "./helper";
import { IClassifyItem, IConfigSchema, PROP_ENUM, PROP_GROUP } from "./types";

type IParams = {
  schema: IConfigSchema;
  value: any;
};
// Record<PROP_ENUM, IConfigSchema>
// 配置的属性对应的schema
export const configSchemaMap: Record<
  string,
  IConfigSchema | Record<string, IConfigSchema>
> = {
  width: {
    prop: "width",
    label: "W",
    valueType: "number",
    path: "attrs.width",
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
    path: "attrs.height",
    renderComponent: "input",
    defaultValue: 0,
    inValFormat: ({ schema, value }: IParams) =>
      getNumberValid(value, schema.defaultValue),
    outValFormat: ({ schema, value }: IParams) =>
      getNumberValid(value, schema.defaultValue),
  },
  "bg-pure-Gradient-color": {
    renderComponent: 'color-pickers',
    propMap: {
      backgroundColor: {
        prop: "backgroundColor",
        label: "填充色",
        valueType: "color",
        path: "attrs.backgroundColor",
        renderComponent: "color-pickers",
        defaultValue: "#ccc",
        inValFormat: ({ value }: IParams) => {
          // 如果是颜色字符串,那么认为是单色,否则认为是渐变色
          return value;
        },
        outValFormat: ({ value }: IParams) => {
          console.log(value, "valu1e");
  
          return value;
        },
      },
      backgroundGradient: {
        prop: "backgroundGradient",
        label: "填充渐变色",
        valueType: "color",
        path: "attrs.backgroundGradient",
        renderComponent: "color-pickers",
        defaultValue: "#ccc",
        inValFormat: ({ value }: IParams) => {
          // 如果是颜色字符串,那么认为是单色,否则认为是渐变色
          return value;
        },
        outValFormat: ({ value }: IParams) => {
          console.log(value, "valu1e");
          return value;
        },
      },
    }
  },
};

// 分类列表
export const classifyList: IClassifyItem[] = [
  {
    name: "a", // 分类的字段
    title: "尺寸", // 分类的名称
    configList: [PROP_ENUM.width, PROP_ENUM.height],
  },
  {
    name: "b", // 分类的字段
    title: "背景色", // 分类的名称
    configList: [PROP_GROUP["bg-pure-Gradient-color"]],
  },
];
