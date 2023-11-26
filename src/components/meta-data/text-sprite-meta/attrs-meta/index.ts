import { ENUM_RenderComponent, IConfigSchema } from "../../types";
import {
  createCommonValFormat,
  createGroupValFormatForColorPickers,
} from "../../helps";
// @ts-ignore
import _ from "lodash";

const commonValFormat = createCommonValFormat();
const groupValFormatForColorPickers = createGroupValFormatForColorPickers();

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
  content: {
    prop: "content",
    label: "文本",
    valueType: "string",
    path: "attrs.content",
    renderComponent: "text-area",
    defaultValue: "",
    inValFormat: commonValFormat.in,
    outValFormat: commonValFormat.out,
  },
  contentFontSize: {
    prop: "contentFontSize",
    label: "字号",
    valueType: "string",
    path: "attrs.contentFontSize",
    renderComponent: "input-number",
    defaultValue: "",
    // inValFormat: commonValFormat.in,
    outValFormat: commonValFormat.out,
  },
  contentColor: {
    prop: "contentColor",
    label: "文本颜色",
    valueType: "color",
    path: "attrs.contentColor",
    renderComponent: "color-picker",
    defaultValue: "#000000",
    inValFormat: commonValFormat.in,
    outValFormat: commonValFormat.out,
  },
  contentFontFamily: {
    prop: "contentColor",
    label: "文本字体",
    valueType: "string",
    path: "attrs.contentFontFamily",
    renderComponent: ENUM_RenderComponent.textFontFamily,
    defaultValue: "Microsoft YaHei",
    inValFormat: ({ schema, form }: any) => {
      const { justifyContent, alignItems } = schema.path;
      console.log(justifyContent, alignItems, "justifyContent", form);

      return {
        fontFamily: _.get(form, schema.path, schema.defaultValue),
      };
    },
    outValFormat: ({ value, schema }: any) => {
      return {
        [schema.path]: value.value,
      };
    },
  },
  // 文本对齐方式-横向
  justifyContent: {
    prop: "contentColor",
    label: "横向",
    valueType: "string",
    path: "attrs.justifyContent",
    renderComponent: "input",
    defaultValue: "center",
    inValFormat: commonValFormat.in,
    outValFormat: commonValFormat.out,
  },
  // 文本对齐方式-纵向
  alignItems: {
    prop: "contentColor",
    label: "纵向",
    valueType: "string",
    path: "attrs.alignItems",
    renderComponent: "input",
    defaultValue: "center",
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
  "text-justify-align-Content": {
    renderComponent: ENUM_RenderComponent.textJustifyAlign,
    label: "文本对齐",
    prop: "text-justify-align-Content",
    groupProps: {
      justifyContent: configSchemaMap.justifyContent,
      alignItems: configSchemaMap.alignItems,
    },
    inValFormat: ({ schema, form }: any) => {
      const { justifyContent, alignItems } = schema.groupProps;
      console.log(justifyContent, alignItems, "justifyContent", form);

      return {
        x: _.get(form, justifyContent.path, justifyContent.defaultValue),
        y: _.get(form, alignItems.path, alignItems.defaultValue),
      };
    },
    outValFormat: ({ value, schema }: any) => {
      const { key } = value;
      const { justifyContent, alignItems } = schema.groupProps;
      const keyMap: any = {
        x: justifyContent,
        y: alignItems,
      };

      return {
        [keyMap[key].path]: value.value,
      };
    },
  },
};

// 分类列表
export const classifyList = [
  {
    name: "a", // 分类的字段
    title: "位置尺寸", // 分类的名称
    configList: [
      configSchemaMap.x,
      configSchemaMap.y,
      configSchemaMap.width,
      configSchemaMap.height,
    ],
  },
  // {
  //   name: "b", // 分类的字段
  //   title: "背景色", // 分类的名称
  //   configList: [groupMap["bg-pure-Gradient-color"]],
  // },
  // {
  //   name: "c", // 分类的字段
  //   title: "边框", // 分类的名称
  //   configList: [configSchemaMap.stroke, configSchemaMap.strokeWidth],
  // },
  {
    name: "d", // 分类的字段
    title: "文本", // 分类的名称
    configList: [
      configSchemaMap.contentFontFamily,
      configSchemaMap.contentFontSize,
      configSchemaMap.contentColor,
      // groupMap["text-justify-align-Content"],
    ],
  },
];
