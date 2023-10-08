import { IBox, IPoint, HANDLER } from "./types";

// 获得旋转后的点
function getRotatedPoint(
  point: IPoint,
  center: IPoint,
  rotate: number
): IPoint {
  /**
   * 旋转公式：
   *  点a(x, y)
   *  旋转中心c(x, y)
   *  旋转后点n(x, y)
   *  旋转角度θ
   * nx = cosθ * (ax - cx) - sinθ * (ay - cy) + cx
   * ny = sinθ * (ax - cx) + cosθ * (ay - cy) + cy
   */
  return {
    x:
      (point.x - center.x) * Math.cos(degreeToRadian(rotate)) -
      (point.y - center.y) * Math.sin(degreeToRadian(rotate)) +
      center.x,
    y:
      (point.x - center.x) * Math.sin(degreeToRadian(rotate)) +
      (point.y - center.y) * Math.cos(degreeToRadian(rotate)) +
      center.y,
  };
}

/**
 * 角度转弧度(通常用于js的计算正弦余弦的方法)
 * @param   {Number}  degree  角度
 * @return  {Number}          弧度
 */
function degreeToRadian(degree: number): number {
  return ((2 * Math.PI) / 360) * degree;
}

// 求两点之间的中点坐标
function getCenterPoint(p1: IPoint, p2: IPoint): IPoint {
  return {
    x: p1.x + (p2.x - p1.x) / 2,
    y: p1.y + (p2.y - p1.y) / 2,
  };
}

function calculateTopLeft(style, curPositon, symmetricPoint) {
  // 1. 根据当前句柄坐标以及对称点 计算出新的中心点
  const newCenterPoint = getCenterPoint(curPositon, symmetricPoint);

  // 2. 根据旋转公式计算出 句柄坐标
  const newTopLeftPoint = getRotatedPoint(
    curPositon,
    newCenterPoint,
    -style.rotate
  );

  // 3. 根据旋转公式计算出 句柄对称点 的坐标
  const newBottomRightPoint = getRotatedPoint(
    symmetricPoint,
    newCenterPoint,
    -style.rotate
  );

  // 得到的新的宽度为
  const newWidth = newBottomRightPoint.x - newTopLeftPoint.x;
  const newHeight = newBottomRightPoint.y - newTopLeftPoint.y;
  if (newWidth > 0 && newHeight > 0) {
    style.width = newWidth;
    style.height = newHeight;
    style.left = newTopLeftPoint.x;
    style.top = newTopLeftPoint.y;
  }

  return style;
}

function calculateTopRight(style, curPositon, symmetricPoint) {
  // 1. 根据当前句柄坐标以及对称点 计算出新的中心点
  const newCenterPoint = getCenterPoint(curPositon, symmetricPoint);

  // 2. 根据旋转公式计算出 句柄坐标
  const newTopLeftPoint = getRotatedPoint(
    curPositon,
    newCenterPoint,
    -style.rotate
  );

  // 3. 根据旋转公式计算出 句柄对称点 的坐标
  const newBottomRightPoint = getRotatedPoint(
    symmetricPoint,
    newCenterPoint,
    -style.rotate
  );

  // 得到的新的宽度为
  const newWidth = newBottomRightPoint.x - newTopLeftPoint.x;
  const newHeight = newBottomRightPoint.y - newTopLeftPoint.y;
  if (newWidth > 0 && newHeight > 0) {
    style.width = newWidth;
    style.height = newHeight;
    style.left = newTopLeftPoint.x;
    style.top = newTopLeftPoint.y;
  }

  return style;
}

function calculateLeftMiddle(style, curPositon, symmetricPoint) {
  // 1. 根据当前句柄坐标以及对称点 计算出新的中心点
  const newCenterPoint = getCenterPoint(curPositon, symmetricPoint);

  // 2. 根据旋转公式计算出 句柄坐标
  const newTopLeftPoint = getRotatedPoint(
    curPositon,
    newCenterPoint,
    -style.rotate
  );

  // 3. 根据旋转公式计算出 句柄对称点 的坐标
  const newBottomRightPoint = getRotatedPoint(
    symmetricPoint,
    newCenterPoint,
    -style.rotate
  );

  // 得到的新的宽度为
  const newWidth = newBottomRightPoint.x - newTopLeftPoint.x;
  const newHeight = newBottomRightPoint.y - newTopLeftPoint.y;
  if (newWidth > 0 && newHeight > 0) {
    style.height = newHeight;
    style.left = newTopLeftPoint.x + newWidth / 2;
    style.top = newTopLeftPoint.y + newHeight / 2;
  }

  return style;
}

/**
 * 获取关键变量（计算尺寸调整逻辑用）
 * @param  {String} handler 手柄名称
 * @return {Object}         关键变量集合
 */
function getKeyVariable(handler: HANDLER, currentInfo: IBox) {
  const rect = {
    x: currentInfo.x,
    y: currentInfo.y,
    width: currentInfo.width,
    height: currentInfo.height,
    rotate: currentInfo.rotate,
  };
  const center = {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };
  const handlePoint = getPoint(rect, center, handler);
  const sPoint = {
    x:
      center.x +
      Math.abs(handlePoint.x - center.x) * (handlePoint.x < center.x ? 1 : -1),
    y:
      center.y +
      Math.abs(handlePoint.y - center.y) * (handlePoint.y < center.y ? 1 : -1),
  };
  // const proportion = this.workspace.lockProportions ? (rect.width / rect.height) : 1

  return {
    //   viewportRef,  // 页面SVG元素的引用（计算鼠标位置需要用到）
    rect, // 元素原始几何信息（xy宽高）
    center, // 元素原始中心点坐标
    handlePoint, // 当前拖动手柄的虚拟坐标（旋转后的坐标）
    sPoint, // 拖动手柄的对称点的坐标（假设拖动的是左上角手柄，那么他的对称点就是右下角的点）
    //   proportion    // 宽高比
  };
}

/**
 * 获取旋转后的手柄坐标
 * @param  {Object} rect     形状的宽高坐标
 * @param  {Object} center   旋转中心的坐标
 * @param  {String} position 手柄名称
 * @return {Object}          旋转后的手柄坐标
 */
function getPoint(rect: IBox, center: IPoint, position: HANDLER): IPoint {
  let point;

  switch (position) {
    case "top-left":
      point = {
        x: rect.x,
        y: rect.y,
      };
      return getRotatedPoint(point, center, rect.rotate);
    case "top-middle":
      point = {
        x: rect.x + rect.width / 2,
        y: rect.y,
      };
      return getRotatedPoint(point, center, rect.rotate);
    case "top-right":
      point = {
        x: rect.x + rect.width,
        y: rect.y,
      };
      return getRotatedPoint(point, center, rect.rotate);
    case "bottom-left":
      point = {
        x: rect.x,
        y: rect.y + rect.height,
      };
      return getRotatedPoint(point, center, rect.rotate);
    case "bottom-middle":
      point = {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height,
      };
      return getRotatedPoint(point, center, rect.rotate);
    case "bottom-right":
      point = {
        x: rect.x + rect.width,
        y: rect.y + rect.height,
      };
      return getRotatedPoint(point, center, rect.rotate);
    case "middle-left":
      point = {
        x: rect.x,
        y: rect.y + rect.height / 2,
      };
      return getRotatedPoint(point, center, rect.rotate);
    case "middle-right":
      point = {
        x: rect.x + rect.width,
        y: rect.y + rect.height / 2,
      };
      return getRotatedPoint(point, center, rect.rotate);
    default:
      point = {
        x: rect.x,
        y: rect.y,
      };
      return getRotatedPoint(point, center, rect.rotate);
  }
}

function getLength(x: number, y: number): number {
  return Math.sqrt(x * x + y * y);
}

/**
 * 计算两点之间的距离
 *
 * @param p1 - 线端点的坐标
 * @param p2 - 线端点的坐标
 * @returns 距离
 */
function distance(p1: IPoint, p2: IPoint) {
 return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

/**
 * 计算一个点相对另一个点旋转一定角度后的坐标
 *
 * @param point - 目标点坐标
 * @param deg - 角度
 * @param o - 旋转中心点坐标
 * @returns 旋转后的点坐标
 */
export const rotate = (
  point: Point,
  deg: number,
  o: Point = { x: 0, y: 0 }
) => {
  const dis = distance(point, o);
  const k = (point.y - o.y) / (point.x - o.x);
  let sitaA = Math.atan(k);
  if (Math.abs(point.x - o.x) === 0) {
    sitaA = (Math.PI / 2) * (point.y - o.y > 0 ? 1 : -1);
  }
  if (point.x - o.x < 0) {
    sitaA -= Math.PI;
  }
  const sitaO = sitaA + (Math.PI * deg) / 180;
  return {
    x: o.x + dis * Math.cos(sitaO),
    y: o.y + dis * Math.sin(sitaO),
  };
};

// 获取句柄坐标位置
function getHandlePoint(currentPoint: IBox, handleType: HANDLER, dotSize = 10) {
  switch (handleType) {
    case HANDLER.TM:
      return {
        x: currentPoint.width / 2 - dotSize / 2,
        y: 0 - dotSize / 2,
      };

    case HANDLER.BM:
      return {
        x: currentPoint.width / 2 - dotSize / 2,
        y: currentPoint.height - dotSize / 2,
      };

    case HANDLER.ML:
      return {
        x: 0 - dotSize / 2,
        y: currentPoint.height / 2 - dotSize / 2,
      };

    case HANDLER.MR:
      return {
        x: currentPoint.width - dotSize / 2,
        y: currentPoint.height / 2 - dotSize / 2,
      };

    case HANDLER.TL:
      return {
        x: 0 - dotSize / 2,
        y: 0 - dotSize / 2,
      };

    case HANDLER.TR:
      return {
        x: currentPoint.width - dotSize / 2,
        y: 0 - dotSize / 2,
      };

    case HANDLER.BL:
      return {
        x: 0 - dotSize / 2,
        y: currentPoint.height - dotSize / 2,
      };

    case HANDLER.BR:
      return {
        x: currentPoint.width - dotSize / 2,
        y: currentPoint.height - dotSize / 2,
      };
    default:
      break;
  }
}
function degToRadian(deg: number) {
  (deg * Math.PI) / 180;
}

/**
 * 计算形变后的盒子信息
 */
function calcResizedBoxInfo(options: 
  {
    handleType: HANDLER,
    originCenter: IPoint,
    handlePoint: IPoint,
    svgEl: HTMLElement,
    startMouse: MouseEvent,
    moveMouse: MouseEvent,
    originBoxInfo: IBox,
    editorRectInfo: any,
    symmetricPoint: IPoint,
  }
) {
  const { handleType, moveMouse, editorRectInfo, originCenter,originBoxInfo, handlePoint,symmetricPoint, } = options
  // 当前鼠标的位置信息
  const curPositon = {
    x: moveMouse.clientX - editorRectInfo.x,
    y: moveMouse.clientY - editorRectInfo.y
  }

  const resizeBoxInfo = { ...originBoxInfo }

  if (handleType === HANDLER.BL) {
    let newCenterPoint = getCenterPoint(curPositon, symmetricPoint)
    let newTopRightPoint = getRotatedPoint(symmetricPoint, newCenterPoint, -originBoxInfo.rotate)
    let newBottomLeftPoint = getRotatedPoint(curPositon, newCenterPoint, -originBoxInfo.rotate)

    resizeBoxInfo.height = newBottomLeftPoint.y - newTopRightPoint.y
    resizeBoxInfo.width = newTopRightPoint.x - newBottomLeftPoint.x
    resizeBoxInfo.x = newBottomLeftPoint.x;
    resizeBoxInfo.y = newTopRightPoint.y
  }

  if (handleType === HANDLER.BR) {
    let newCenterPoint = getCenterPoint(curPositon, symmetricPoint)
    let newTopleftPoint = getRotatedPoint(symmetricPoint, newCenterPoint, -originBoxInfo.rotate)
    let newBottomRightPoint = getRotatedPoint(curPositon, newCenterPoint, -originBoxInfo.rotate)

    resizeBoxInfo.height = newBottomRightPoint.y - newTopleftPoint.y
    resizeBoxInfo.width =newBottomRightPoint.x - newTopleftPoint.x 
    resizeBoxInfo.x = newTopleftPoint.x;
    resizeBoxInfo.y = newTopleftPoint.y
  }

  if (handleType === HANDLER.TL) {
    let newCenterPoint = getCenterPoint(curPositon, symmetricPoint)
    let newBottomLeftPoint = getRotatedPoint(symmetricPoint, newCenterPoint, -originBoxInfo.rotate)
    let newTopleftPoint = getRotatedPoint(curPositon, newCenterPoint, -originBoxInfo.rotate)

    resizeBoxInfo.height = newBottomLeftPoint.y - newTopleftPoint.y
    resizeBoxInfo.width =newBottomLeftPoint.x - newTopleftPoint.x 
    resizeBoxInfo.x = newTopleftPoint.x;
    resizeBoxInfo.y = newTopleftPoint.y
  }

  if (handleType === HANDLER.TR) {
    let newCenterPoint = getCenterPoint(curPositon, symmetricPoint)
    let newBottomLeftPoint  = getRotatedPoint(symmetricPoint, newCenterPoint, -originBoxInfo.rotate)
    let newTopRightPoint= getRotatedPoint(curPositon, newCenterPoint, -originBoxInfo.rotate)

    resizeBoxInfo.height = newBottomLeftPoint.y - newTopRightPoint.y
    resizeBoxInfo.width =newTopRightPoint.x - newBottomLeftPoint.x 
    resizeBoxInfo.x = newBottomLeftPoint.x;
    resizeBoxInfo.y = newTopRightPoint.y
  }

  if (handleType === HANDLER.TM) {
 // 由于用户拉伸时是以任意角度拉伸的，所以在求得旋转前的坐标时，只取 y 坐标（这里的 x 坐标可能是任意值），x 坐标用 curPoint 的。
    // 这个中心点（第二个参数）用 curPoint, center, symmetricPoint 都可以，只要他们在一条直线上就行
    const rotatedcurPositon = getRotatedPoint(curPositon, handlePoint, -originBoxInfo.rotate)

    // 算出旋转前 y 坐标，再用 curPoint 的 x 坐标，重新计算它们旋转后对应的坐标
    const rotatedTopMiddlePoint = getRotatedPoint({
        x: handlePoint.x,
        y: rotatedcurPositon.y,
    }, handlePoint, originBoxInfo.rotate)
    
    // 用旋转后的坐标和对称点算出新的高度（勾股定理）
    const newHeight = Math.sqrt((rotatedTopMiddlePoint.x - symmetricPoint.x) ** 2 + (rotatedTopMiddlePoint.y - symmetricPoint.y) ** 2)
    
    const newCenter = {
        x: rotatedTopMiddlePoint.x - (rotatedTopMiddlePoint.x - symmetricPoint.x) / 2,
        y: rotatedTopMiddlePoint.y + (symmetricPoint.y - rotatedTopMiddlePoint.y) / 2,
    }

    resizeBoxInfo.height = newHeight
    resizeBoxInfo.x = newCenter.x - (originBoxInfo.width  / 2)
    resizeBoxInfo.y = newCenter.y - (newHeight/ 2)

  }

  if (handleType === HANDLER.MR) {
    const rotatedcurPositon = getRotatedPoint(curPositon, handlePoint, -originBoxInfo.rotate)
    const rotatedRightMiddlePoint = getRotatedPoint({
        x: rotatedcurPositon.x,
        y: handlePoint.y,
    }, handlePoint, originBoxInfo.rotate)
  
    const newWidth = Math.sqrt((rotatedRightMiddlePoint.x - symmetricPoint.x) ** 2 + (rotatedRightMiddlePoint.y - symmetricPoint.y) ** 2)

    const newCenter = {
        x: rotatedRightMiddlePoint.x - (rotatedRightMiddlePoint.x - symmetricPoint.x) / 2,
        y: rotatedRightMiddlePoint.y + (symmetricPoint.y - rotatedRightMiddlePoint.y) / 2,
    }
        
    resizeBoxInfo.width = newWidth
    resizeBoxInfo.y = newCenter.y - (resizeBoxInfo.height / 2)
    resizeBoxInfo.x = newCenter.x - (newWidth / 2)


  }

  if (handleType === HANDLER.BM) {
    const rotatedcurPositon = getRotatedPoint(curPositon, handlePoint, -resizeBoxInfo.rotate)
    const rotatedBottomMiddlePoint = getRotatedPoint({
        x: handlePoint.x,
        y: rotatedcurPositon.y,
    }, handlePoint, resizeBoxInfo.rotate)
  
    const newHeight = Math.sqrt((rotatedBottomMiddlePoint.x - symmetricPoint.x) ** 2 + (rotatedBottomMiddlePoint.y - symmetricPoint.y) ** 2)

    const newCenter = {
        x: rotatedBottomMiddlePoint.x - (rotatedBottomMiddlePoint.x - symmetricPoint.x) / 2,
        y: rotatedBottomMiddlePoint.y + (symmetricPoint.y - rotatedBottomMiddlePoint.y) / 2,
    }

    resizeBoxInfo.height = newHeight
    resizeBoxInfo.y = newCenter.y - (newHeight / 2)
    resizeBoxInfo.x = newCenter.x - (resizeBoxInfo.width / 2)
  }

  if (handleType === HANDLER.ML) {
    const rotatedcurPositon = getRotatedPoint(curPositon, handlePoint, -resizeBoxInfo.rotate)
    const rotatedPoint = getRotatedPoint({
        x: rotatedcurPositon.x,
        y: handlePoint.y,
    }, handlePoint, resizeBoxInfo.rotate)
  
    const newWidth = Math.sqrt((rotatedPoint.x - symmetricPoint.x) ** 2 + (rotatedPoint.y - symmetricPoint.y) ** 2)

    const newCenter = {
        x: rotatedPoint.x - (rotatedPoint.x - symmetricPoint.x) / 2,
        y: rotatedPoint.y + (symmetricPoint.y - rotatedPoint.y) / 2,
    }

    resizeBoxInfo.width = newWidth
    resizeBoxInfo.y = newCenter.y - (resizeBoxInfo.height / 2)
    resizeBoxInfo.x = newCenter.x - (newWidth / 2)
  }

  return resizeBoxInfo


  // const nexBoxInfo = {
  // }

  // if (newWidth > 0 && newHeight > 0) {
  //   style.width = Math.round(newWidth)
  //   style.height = Math.round(newHeight)
  //   style.left = Math.round(newBottomLeftPoint.x)
  //   style.top = Math.round(newTopRightPoint.y)
  // }

  if (newWidth > 0 && newHeight > 0) {
    return {
      x: newBottomLeftPoint.x,
      y: newTopRightPoint.y,
      width: newWidth,
      height: newHeight,
      rotate: originBoxInfo.rotate
  }
  } else {
    return {...originBoxInfo}
   }
  // const rectInfo = {
  //   x: 0,
  //   y: 0,
  //   width: 0,
  //   height: 0,
  //   rotate: 0,
  // };

  // // 1. 根据当前句柄坐标以及对称点 计算出新的中心点
  // const newCenterPoint = getCenterPoint(curPositon, symmetricPoint);

  // // 2. 根据旋转公式计算出 句柄坐标
  // const newTopLeftPoint = getRotatedPoint(
  //   curPositon,
  //   newCenterPoint,
  //   -style.rotate
  // );

  // // 3. 根据旋转公式计算出 句柄对称点 的坐标
  // const newBottomRightPoint = getRotatedPoint(
  //   symmetricPoint,
  //   newCenterPoint,
  //   -style.rotate

}

function createLatLngOfRotate (param: {
  latLng: IPoint,
  center: IPoint,
  rotateNum: number
}
): IPoint{
// 1.求点到中心点的直线距离
const r = Math.sqrt(Math.pow(param.latLng.x - param.center.x, 2) +  Math.pow(param.latLng.y - param.center.y, 2))
// 2.求点到x之间的角度
let rotateValue = Math.atan2(param.latLng.y-param.center.y, param.latLng.x-param.center.x)/(2*Math.acos(-1))*360;
// 3.减去旋转的角度 再整体转为弧度
rotateValue = (rotateValue - param.rotateNum)*Math.PI/180;
// 4.根据中心的坐标、弧度、半径计算出新的坐标
return {
  x:param.center.x+r*Math.cos(rotateValue),
  y:param.center.y+r*Math.sin(rotateValue)
}
}

/**
 * 怎么计算两点间连线的倾斜角？
 * Math.atan2(y2-y1,x2-x1)*180/Math.PI
 */

export {
  getLength,
  getPoint,
  getRotatedPoint,
  getKeyVariable,
  degToRadian,
  calculateTopLeft,
  calculateLeftMiddle,
  getHandlePoint, // 计算操作杆（句柄）的坐标点
  calcResizedBoxInfo, // 计算形变后的盒子模型信息
};
