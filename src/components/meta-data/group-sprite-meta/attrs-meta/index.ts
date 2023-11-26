import { getNumberValid } from "./helper";
import { IClassifyItem, IConfigSchema, PROP_ENUM } from "./types";

import {
  createCommonValFormat,
  createGroupValFormatForColorPickers,
} from "../../helps";
// @ts-ignore
import _ from "lodash";


const commonValFormat = createCommonValFormat();
const groupValFormatForColorPickers = createGroupValFormatForColorPickers();


type IParams = {
  schema: IConfigSchema;
  value: any;
};

// 配置的属性对应的schema
export const configSchemaMap: Record<string, IConfigSchema> = {
  width: {
    prop: "width",
    label: "W",
    valueType: "number",
    path: "boundingBox.width",
    renderComponent: "input",
    defaultValue: 0,
    inValFormat: commonValFormat.in,
    outValFormat: commonValFormat.out,
  },
  height: {
    prop: "height",
    label: "H",
    valueType: "number",
    path: "boundingBox.height",
    renderComponent: "input",
    defaultValue: 0,
    inValFormat: commonValFormat.in,
    outValFormat: commonValFormat.out,
  },
  x: {
    prop: "x",
    label: "X",
    valueType: "number",
    path: "boundingBox.x",
    renderComponent: "input",
    defaultValue: 0,
    inValFormat: commonValFormat.in,
    outValFormat: commonValFormat.out,
  },
  y: {
    prop: "y",
    label: "Y",
    valueType: "number",
    path: "boundingBox.y",
    renderComponent: "input",
    defaultValue: 0,
    inValFormat: commonValFormat.in,
    outValFormat: commonValFormat.out,
  },
  fill: {
    prop: "fill",
    label: "填充色",
    valueType: "color",
    path: "attrs.fill",
    renderComponent: "color-pickers",
    defaultValue: "#ccc",
    inValFormat: commonValFormat.in,
    outValFormat: commonValFormat.out,
  },
  gradientFill: {
    prop: "gradientFill",
    label: "填充渐变色",
    valueType: "color",
    path: "attrs.gradientFill",
    renderComponent: "color-pickers",
    defaultValue: "#ccc",
    inValFormat: commonValFormat.in,
    outValFormat: commonValFormat.out,
  },
  stroke: {
    prop: "stroke",
    label: "边框颜色",
    valueType: "color",
    path: "attrs.stroke",
    renderComponent: "color-picker",
    defaultValue: "#398cfe",
    // inValFormat: commonValFormat.in,
    // outValFormat: commonValFormat.out,
  },
  strokeWidth: {
    prop: "strokeWidth",
    label: "边框宽度",
    valueType: "number",
    path: "attrs.strokeWidth",
    renderComponent: "input",
    defaultValue: 3,
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
      fill: configSchemaMap.fill,
      gradientFill: configSchemaMap.gradientFill,
    },
    inValFormat: groupValFormatForColorPickers.in,
    outValFormat: groupValFormatForColorPickers.out,
  },

};

// 分类列表
export const classifyList: IClassifyItem[] = [
  {
    name: "b", // 分类的字段
    title: "背景色", // 分类的名称
    configList: [groupMap["bg-pure-Gradient-color"]],
  },
  {
    name: "c", // 分类的字段
    title: "边框", // 分类的名称
    configList: [configSchemaMap.stroke, configSchemaMap.strokeWidth],
  },
];
