import { getWrapperBoxByPoint } from "../../utils";
import { ICoordinate, ISprite } from "./types";
// @ts-ignored
import _ from "lodash";

export function createAnchorsForLine() {
  /**
   * 获得锚点的能力
   * 线段的锚点能力来自两个端点
   * @param param0
   * @returns
   */
  const getPoints = ({ sprite }: { sprite: ISprite }) => {
    const { points } = sprite.attrs;
    return [...points];
  };
  /**
   * 锚点变化时
   */
  const pointChange = ({
    sprite,
    targetPoint,
  }: {
    sprite: ISprite;
    targetPoint: ICoordinate[];
  }) => {
    const { width, height, x, y } = sprite.boundingBox;
    const boundingBox = getWrapperBoxByPoint(targetPoint);
    const points: ICoordinate[] = targetPoint.map((m: ICoordinate) => {
      return {
        x: (m.x - boundingBox.x) / boundingBox.width,
        y: (m.y - boundingBox.y) / boundingBox.height,
      };
    });

    return {
      id: sprite.id,
      // 需要更新的属性路径以及值
      stateSet: [
        {
          path: "boundingBox.x",
          value: boundingBox.x,
        },
        {
          path: "boundingBox.y",
          value: boundingBox.y,
        },
        {
          path: "boundingBox.width",
          value: boundingBox.width,
        },
        {
          path: "boundingBox.height",
          value: boundingBox.height,
        },
        {
          path: "attrs.points",
          value: points,
        },
      ],
    };
  };

  return {
    getPoints,
    pointChange,
  };
}

/* 创建通用参数格式化 */
export function createCommonValFormat() {
  // 通用入参格式化
  function commonInValFormat({ schema, form }: any) {
    const { path } = schema;
    return _.get(form, path);
  }

  // 通用出参格式化
  function commonOutValFormat({ schema, value }: any) {
    return {
      [schema.path]: value,
    };
  }
  return {
    in: commonInValFormat,
    out: commonOutValFormat,
  };
}

/** 创建基础色在colorPickers中的格式化 */
export function createBaseValFormatForColorPickers() {
  // 基础颜色入参格式化 ColorPickers的格式化
  function baseColorInValFormatForColorPickers({ schema, form }: any) {
    const { path, linkPath } = schema;
    const color = _.get(form, path);
    const linkColor = _.get(form, linkPath);
    return {
      pureColor: color,
      gradientColor: linkColor,
    };
  }
  // 基础颜色出参格式化 ColorPickers的格式化
  function baseColorOutValFormatForColorPickers({ schema, value }: any) {
    // const { path, linkPath } = schema;
    // const color = _.get(form, path);
    // const linkColor = _.get(form, linkPath);
    // return {
    //   pureColor: color,
    //   gradientColor: linkColor
    // }
  }

  return {
    in: baseColorInValFormatForColorPickers,
    out: baseColorOutValFormatForColorPickers,
  };
}

// 组合颜色在colorPickers中的格式化
export function createGroupValFormatForColorPickers() {
  // 基础颜色入参格式化 ColorPickers的格式化
  function groupColorInValFormatForColorPickers(
    { schema, form }: any,
    colorKey:
      | ["backgroundColor", "backgroundGradient"]
      | ["fill", "gradientFill"] = ["fill", "gradientFill"]
  ) {
    const [pureKey, gradientKey] = colorKey;
    const backgroundColor = schema.groupProps[pureKey];
    const backgroundGradient = schema.groupProps[gradientKey];
    return {
      pureColor: _.get(form, backgroundColor.path),
      gradientColor: _.get(form, backgroundGradient.backgroundGradient),
    };
  }
  // 基础颜色出参格式化 ColorPickers的格式化
  function groupColorOutValFormatForColorPickers(
    { schema, value, otherParams }: any,
    colorKey:
      | ["backgroundColor", "backgroundGradient"]
      | ["fill", "gradientFill"] = ["fill", "gradientFill"]
  ) {
    const [pureKey, gradientKey] = colorKey;

    const backgroundColor = schema.groupProps[pureKey];
    const backgroundGradient = schema.groupProps[gradientKey];
    // 纯色和背景色不能同时存在,否则会相互覆盖
    const state = {
      [backgroundColor.path]: "",
      [backgroundGradient.path]: "",
    };
    if (otherParams === "pureColor") {
      state[backgroundColor.path] = value;
    } else {
      state[backgroundGradient.path] = value;
    }
    return state;
  }

  return {
    in: groupColorInValFormatForColorPickers,
    out: groupColorOutValFormatForColorPickers,
  };
}
