import { getNumberValid } from "./helper";
// @ts-ignore
import _ from "lodash";
import { IClassifyItem, type IConfigSchema } from "../../types";
import {
  createCommonValFormat,
  createGroupValFormatForColorPickers,
} from "../../helps";

const commonValFormat = createCommonValFormat()
const groupValFormatForColorPickers = createGroupValFormatForColorPickers();

// Record<PROP_ENUM, IConfigSchema>
// 配置的属性对应的schema
export const configSchemaMap: Record<string, IConfigSchema> = {
  width: {
    prop: "width",
    label: "W",
    valueType: "number",
    path: "attrs.width",
    renderComponent: "input",
    defaultValue: 0,
    inValFormat: commonValFormat.in,
    outValFormat: commonValFormat.out,
  },
  height: {
    prop: "height",
    label: "H",
    valueType: "number",
    path: "attrs.height",
    renderComponent: "input",
    defaultValue: 0,
    inValFormat: commonValFormat.in,
    outValFormat: commonValFormat.out,
  },
  backgroundColor: {
    prop: "backgroundColor",
    label: "填充色",
    valueType: "color",
    path: "attrs.backgroundColor",
    renderComponent: "color-pickers",
    defaultValue: "#ccc",
    inValFormat: commonValFormat.in,
    outValFormat: commonValFormat.out,
  },
  backgroundGradient: {
    prop: "backgroundGradient",
    label: "填充渐变色",
    valueType: "color",
    path: "attrs.backgroundGradient",
    renderComponent: "color-pickers",
    defaultValue: "#ccc",
    inValFormat: commonValFormat.in,
    outValFormat: commonValFormat.out,
  },
};

const groupMap: Record<string, IConfigSchema> = {
  "bg-pure-Gradient-color": {
    renderComponent: "color-pickers",
    label: "背景",
    prop: "bg-pure-Gradient-color",
    groupProps: {
      backgroundColor: configSchemaMap.backgroundColor,
      backgroundGradient: configSchemaMap.backgroundGradient,
    },
    inValFormat:(...args: any[]) => groupValFormatForColorPickers.in(...(args as []), [
      "backgroundColor",
      "backgroundGradient",
    ]),
    outValFormat: (...args: any[]) =>
      groupValFormatForColorPickers.out(...(args as []), [
        "backgroundColor",
        "backgroundGradient",
      ]),
  },
};

// 分类列表
export const classifyList: IClassifyItem[] = [
  {
    name: "a", // 分类的字段
    title: "尺寸", // 分类的名称
    configList: [configSchemaMap.width, configSchemaMap.height],
  },
  {
    name: "b", // 分类的字段
    title: "背景色", // 分类的名称
    configList: [groupMap["bg-pure-Gradient-color"]],
  },
];
