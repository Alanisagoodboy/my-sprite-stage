// 矩形表单
// export default {
//   width: {
//     type: "number",
//     title: "宽",
//   },
//   height: {
//     type: "number",
//     title: "高",
//   },
//   x: {
//     type: "number",
//     title: "x",
//   },
//   y: {
//     type: "number",
//     title: "y",
//   },
// };

export default [
  {
    prop: "width",
    path: "boundingBox.width",
    type: "input",
    valueType: (val) => +val,
    label: "宽度",
    defaultValue: 0,
  },
  {
    prop: "height",
    path: "boundingBox.height",
    type: "input",
    valueType: (val) => +val,
    label: "高度",
    defaultValue: 0,
  },
  {
    prop: "x",
    path: "boundingBox.x",
    type: "input",
    valueType: (val) => +val,
    label: "x",
    defaultValue: 0,
  },
  {
    prop: "y",
    path: "boundingBox.y",
    type: "input",
    valueType: (val) => +val,
    label: "y",
    defaultValue: 0,
  },
];
