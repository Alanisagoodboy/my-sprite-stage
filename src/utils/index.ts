import {
  IBoundingBox,
  ICoordinate,
  ISize,
  ISprite,
} from "../components/meta-data/types";
import { IBox, IPoint, HANDLER } from "./types";

// 获得旋转后的点
function getRotatedPoint(
  point: IPoint,
  center: IPoint,
  rotate: number = 0
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

function calculateTopLeft(style: any, curPositon: any, symmetricPoint: any) {
  // 1. 根据当前句柄坐标以及对称点 计算出新的中心点
  const newCenterPoint = getCenterPoint(curPositon, symmetricPoint);

  // 2. 根据旋转公式计算出 句柄坐标
  const newTopLeftPoint = getRotatedPoint(
    curPositon,
    newCenterPoint,
    0 ?? -style.rotate
  );

  // 3. 根据旋转公式计算出 句柄对称点 的坐标
  const newBottomRightPoint = getRotatedPoint(
    symmetricPoint,
    newCenterPoint,
    0 ?? -style.rotate
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

function calculateTopRight(style: any, curPositon: any, symmetricPoint: any) {
  // 1. 根据当前句柄坐标以及对称点 计算出新的中心点
  const newCenterPoint = getCenterPoint(curPositon, symmetricPoint);

  // 2. 根据旋转公式计算出 句柄坐标
  const newTopLeftPoint = getRotatedPoint(
    curPositon,
    newCenterPoint,
    0 ?? -style.rotate
  );

  // 3. 根据旋转公式计算出 句柄对称点 的坐标
  const newBottomRightPoint = getRotatedPoint(
    symmetricPoint,
    newCenterPoint,
    0 ?? -style.rotate
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

function calculateLeftMiddle(style: any, curPositon: any, symmetricPoint: any) {
  // 1. 根据当前句柄坐标以及对称点 计算出新的中心点
  const newCenterPoint = getCenterPoint(curPositon, symmetricPoint);

  // 2. 根据旋转公式计算出 句柄坐标
  const newTopLeftPoint = getRotatedPoint(
    curPositon,
    newCenterPoint,
    0 ?? -style.rotate
  );

  // 3. 根据旋转公式计算出 句柄对称点 的坐标
  const newBottomRightPoint = getRotatedPoint(
    symmetricPoint,
    newCenterPoint,
    0 ?? -style.rotate
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
    rotate: 0 ?? currentInfo.rotate,
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
      return getRotatedPoint(point, center, 0 ?? rect.rotate);
    case "top-middle":
      point = {
        x: rect.x + rect.width / 2,
        y: rect.y,
      };
      return getRotatedPoint(point, center, 0 ?? rect.rotate);
    case "top-right":
      point = {
        x: rect.x + rect.width,
        y: rect.y,
      };
      return getRotatedPoint(point, center, 0 ?? rect.rotate);
    case "bottom-left":
      point = {
        x: rect.x,
        y: rect.y + rect.height,
      };
      return getRotatedPoint(point, center, 0 ?? rect.rotate);
    case "bottom-middle":
      point = {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height,
      };
      return getRotatedPoint(point, center, 0 ?? rect.rotate);
    case "bottom-right":
      point = {
        x: rect.x + rect.width,
        y: rect.y + rect.height,
      };
      return getRotatedPoint(point, center, 0 ?? rect.rotate);
    case "middle-left":
      point = {
        x: rect.x,
        y: rect.y + rect.height / 2,
      };
      return getRotatedPoint(point, center, 0 ?? rect.rotate);
    case "middle-right":
      point = {
        x: rect.x + rect.width,
        y: rect.y + rect.height / 2,
      };
      return getRotatedPoint(point, center, 0 ?? rect.rotate);
    default:
      point = {
        x: rect.x,
        y: rect.y,
      };
      return getRotatedPoint(point, center, 0 ?? rect.rotate);
  }
}

/**
 * 计算形变，不考虑旋转
 */
export function calcResizeBoxInfoWithoutRotate({
  handleType,
  rect,
  needChangeRect,
  startEv,
  moveEv,
}: {
  handleType: HANDLER;
  rect: IBoundingBox;
  needChangeRect: IBoundingBox[];
  startEv: MouseEvent;
  moveEv: MouseEvent;
}) {
  let boxInfo = {
    ...rect,
    dx: moveEv.clientX - startEv.clientX,
    dy: moveEv.clientY - startEv.clientY,
  };

  switch (handleType) {
    case "top-left":
      boxInfo.x += boxInfo.dx;
      boxInfo.y += boxInfo.dy;
      boxInfo.width -= boxInfo.dx;
      boxInfo.height -= boxInfo.dy;
      break;
    case "top-middle":
      boxInfo.y += boxInfo.dy;
      boxInfo.height -= boxInfo.dy;
      break;
    case "top-right":
      boxInfo.y += boxInfo.dy;
      boxInfo.width += boxInfo.dx;
      boxInfo.height -= boxInfo.dy;
      break;
    case "bottom-left":
      boxInfo.x += boxInfo.dx;
      boxInfo.width -= boxInfo.dx;
      boxInfo.height += boxInfo.dy;
      break;
    case "bottom-middle":
      boxInfo.height += boxInfo.dy;
      break;
    case "bottom-right":
      boxInfo.width += boxInfo.dx;
      boxInfo.height += boxInfo.dy;
      break;
    case "middle-left":
      boxInfo.x += boxInfo.dx;
      boxInfo.width -= boxInfo.dx;
      break;
    case "middle-right":
      boxInfo.width += boxInfo.dx;
      break;
    default:
      break;
  }

  return {
    // 盒子信息
    boundingBox: {
      x: boxInfo.x,
      y: boxInfo.y,
      width: boxInfo.width,
      height: boxInfo.height,
    },
    // 各个参数偏移量
    offset: {
      x: boxInfo.x - rect.x,
      y: boxInfo.y - rect.y,
      width: boxInfo.width - rect.width,
      height: boxInfo.height - rect.height,
    },
    target: needChangeRect.map((m) => {
      return {
        x: ((m.x - rect.x) / rect.width) * boxInfo.width + boxInfo.x,
        y: ((m.y - rect.y) / rect.height) * boxInfo.height + boxInfo.y,
        width: (m.width / rect.width) * boxInfo.width,
        height: (m.height / rect.height) * boxInfo.height,
      };
    }),
  };
}

/**
 *
 * @desc 计算移动，不考虑旋转
 * @param rect 外包裹矩形
 * @param needChangeRect 需要改变的矩形信息
 * @param staticRectList 静止不动的矩形信息
 * @param stageSize 舞台尺寸
 * @param startEv 鼠标按下时候的事件
 * @param moveEv 鼠标移动时候的事件
 */
export function calcMoveBoxInfoWithoutRotate({
  rect,
  needChangeRect,
  staticRectList,
  stageSize,
  startEv,
  moveEv,
}: {
  rect: IBoundingBox;
  needChangeRect: IBoundingBox[];
  staticRectList: IBoundingBox[];
  stageSize: ISize;
  startEv: MouseEvent;
  moveEv: MouseEvent;
}) {
  const [moveX, moveY] = [
    moveEv.clientX - startEv.clientX,
    moveEv.clientY - startEv.clientY,
  ];

  // 盒子信息
  const boundingBox = {
    x: rect.x + moveX,
    y: rect.x + moveY,
    width: rect.width,
    height: rect.height,
  };

  const {
    lines,
    dx: fixDisX,
    dy: fixDisY,
  } = getAuxLine({
    rect: boundingBox,
    inactiveRectList: staticRectList,
    stageSize,
  });

  boundingBox.x += fixDisX;
  boundingBox.y += fixDisY;

  // 修正偏移量
  const dx = moveX + fixDisX;
  const dy = moveY + fixDisY;

  // 最终偏移量
  const offset = {
    x: dx,
    y: dy,
    width: 0,
    height: 0,
  };

  // 需要改变的矩形目标数据
  const target = needChangeRect.map((m) => {
    return {
      x: m.x + dx,
      y: m.y + dy,
      width: m.width,
      height: m.height,
    };
  });

  return {
    boundingBox, // 盒子信息
    offset, // 偏移量
    target, // 需要改变的矩形目标数据
    lines, // 辅助线
  };
}

/**
 * 获取选中的精灵列表
 * @param id 点击精灵的id
 * @param activeList 当前已经选中的精灵列表数据
 * @param allList 所有选中的精灵列表数据
 * @returns 新的选中的精灵列表
 */
export function getSelectList({ id, activeList, allList }: any) {
  let target = [...activeList];
  // 如果本身就在活跃的精灵列表中，返回原有的精灵列表
  const findInActive = findRootIdItem(activeList, id);
  if (!findInActive) {
    // 否则在全局精灵列表中查找
    const findInAll = findRootIdItem(allList, id);
    // 如果找到了，将找到的这一个设置为新的选中的精灵
    if (findInAll) {
      target = [findInAll];
    }
    console.log(findInAll, 'findInAll');
    
  }

  return {
    boundingBox: getWrapperBoxInfo(target.map((m) => m.boundingBox)),
    target,
  };
}

/**
 * 根据id查找树状结构，找到了返回根数据 todo
 * @param tree
 * @param id
 * @returns
 */
function findRootIdItem(treeArr, id) {  
  let currentLevel = -1;  
  for (let i = 0; i < treeArr.length; i++) {  
      const current = treeArr[i];  
      // 如果找到id并且是第一级，返回当前节点  
      if (current.id === id && currentLevel === -1) {  
          return current;  
      }  
      // 如果当前级不是第一级或者没有找到，在子级中查找  
      if (current.children && current.children.length > 0) {  
          const result = findRootIdItem(current.children, id);  
          if (result) {  
              // 如果找到的id是在子级中，将当前级数加1，并返回当前节点的父节点  
              if (currentLevel === -1) {  
                  currentLevel = i;  
              }  
              return treeArr[currentLevel];  
          }  
      }  
  }  
  // 如果没有找到，返回null  
  return null;  
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
  point: ICoordinate,
  deg: number,
  o: ICoordinate = { x: 0, y: 0 }
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
function calcResizedBoxInfo(options: {
  handleType: HANDLER;
  originCenter: IPoint;
  handlePoint: IPoint;
  svgEl: HTMLElement;
  startMouse: MouseEvent;
  moveMouse: MouseEvent;
  originBoxInfo: IBox;
  editorRectInfo: any;
  symmetricPoint: IPoint;
}) {
  const {
    handleType,
    moveMouse,
    editorRectInfo,
    originCenter,
    originBoxInfo,
    handlePoint,
    symmetricPoint,
  } = options;
  // 当前鼠标的位置信息
  const curPositon = {
    x: moveMouse.clientX - editorRectInfo.x,
    y: moveMouse.clientY - editorRectInfo.y,
  };

  const resizeBoxInfo = { ...originBoxInfo };

  if (handleType === HANDLER.BL) {
    let newCenterPoint = getCenterPoint(curPositon, symmetricPoint);
    let newTopRightPoint = getRotatedPoint(
      symmetricPoint,
      newCenterPoint,
      0 // 0 ?? -originBoxInfo.rotate
    );
    let newBottomLeftPoint = getRotatedPoint(
      curPositon,
      newCenterPoint,
      0 // 0 ?? -originBoxInfo.rotate
    );

    resizeBoxInfo.height = newBottomLeftPoint.y - newTopRightPoint.y;
    resizeBoxInfo.width = newTopRightPoint.x - newBottomLeftPoint.x;
    resizeBoxInfo.x = newBottomLeftPoint.x;
    resizeBoxInfo.y = newTopRightPoint.y;
  }

  if (handleType === HANDLER.BR) {
    let newCenterPoint = getCenterPoint(curPositon, symmetricPoint);
    let newTopleftPoint = getRotatedPoint(
      symmetricPoint,
      newCenterPoint,
      0 /* ?? -originBoxInfo.rotate */
    );
    let newBottomRightPoint = getRotatedPoint(
      curPositon,
      newCenterPoint,
      0 /* ?? -originBoxInfo.rotate */
    );

    resizeBoxInfo.height = newBottomRightPoint.y - newTopleftPoint.y;
    resizeBoxInfo.width = newBottomRightPoint.x - newTopleftPoint.x;
    resizeBoxInfo.x = newTopleftPoint.x;
    resizeBoxInfo.y = newTopleftPoint.y;
  }

  if (handleType === HANDLER.TL) {
    let newCenterPoint = getCenterPoint(curPositon, symmetricPoint);
    let newBottomLeftPoint = getRotatedPoint(
      symmetricPoint,
      newCenterPoint,
      0 /*  ?? -originBoxInfo.rotate */
    );
    let newTopleftPoint = getRotatedPoint(
      curPositon,
      newCenterPoint,
      0 /* ?? -originBoxInfo.rotate */
    );

    resizeBoxInfo.height = newBottomLeftPoint.y - newTopleftPoint.y;
    resizeBoxInfo.width = newBottomLeftPoint.x - newTopleftPoint.x;
    resizeBoxInfo.x = newTopleftPoint.x;
    resizeBoxInfo.y = newTopleftPoint.y;
  }

  if (handleType === HANDLER.TR) {
    let newCenterPoint = getCenterPoint(curPositon, symmetricPoint);
    let newBottomLeftPoint = getRotatedPoint(
      symmetricPoint,
      newCenterPoint,
      0 /* ?? -originBoxInfo.rotate */
    );
    let newTopRightPoint = getRotatedPoint(
      curPositon,
      newCenterPoint,
      0 /* ?? -originBoxInfo.rotate */
    );

    resizeBoxInfo.height = newBottomLeftPoint.y - newTopRightPoint.y;
    resizeBoxInfo.width = newTopRightPoint.x - newBottomLeftPoint.x;
    resizeBoxInfo.x = newBottomLeftPoint.x;
    resizeBoxInfo.y = newTopRightPoint.y;
  }

  if (handleType === HANDLER.TM) {
    // 由于用户拉伸时是以任意角度拉伸的，所以在求得旋转前的坐标时，只取 y 坐标（这里的 x 坐标可能是任意值），x 坐标用 curPoint 的。
    // 这个中心点（第二个参数）用 curPoint, center, symmetricPoint 都可以，只要他们在一条直线上就行
    const rotatedcurPositon = getRotatedPoint(
      curPositon,
      handlePoint,
      0 /* ?? -originBoxInfo.rotate */
    );

    // 算出旋转前 y 坐标，再用 curPoint 的 x 坐标，重新计算它们旋转后对应的坐标
    const rotatedTopMiddlePoint = getRotatedPoint(
      {
        x: handlePoint.x,
        y: rotatedcurPositon.y,
      },
      handlePoint,
      0 ?? originBoxInfo.rotate
    );

    // 用旋转后的坐标和对称点算出新的高度（勾股定理）
    const newHeight = Math.sqrt(
      (rotatedTopMiddlePoint.x - symmetricPoint.x) ** 2 +
        (rotatedTopMiddlePoint.y - symmetricPoint.y) ** 2
    );

    const newCenter = {
      x:
        rotatedTopMiddlePoint.x -
        (rotatedTopMiddlePoint.x - symmetricPoint.x) / 2,
      y:
        rotatedTopMiddlePoint.y +
        (symmetricPoint.y - rotatedTopMiddlePoint.y) / 2,
    };

    resizeBoxInfo.height = newHeight;
    resizeBoxInfo.x = newCenter.x - originBoxInfo.width / 2;
    resizeBoxInfo.y = newCenter.y - newHeight / 2;
  }

  if (handleType === HANDLER.MR) {
    const rotatedcurPositon = getRotatedPoint(
      curPositon,
      handlePoint,
      0 /* ?? -originBoxInfo.rotate */
    );
    const rotatedRightMiddlePoint = getRotatedPoint(
      {
        x: rotatedcurPositon.x,
        y: handlePoint.y,
      },
      handlePoint,
      0 ?? originBoxInfo.rotate
    );

    const newWidth = Math.sqrt(
      (rotatedRightMiddlePoint.x - symmetricPoint.x) ** 2 +
        (rotatedRightMiddlePoint.y - symmetricPoint.y) ** 2
    );

    const newCenter = {
      x:
        rotatedRightMiddlePoint.x -
        (rotatedRightMiddlePoint.x - symmetricPoint.x) / 2,
      y:
        rotatedRightMiddlePoint.y +
        (symmetricPoint.y - rotatedRightMiddlePoint.y) / 2,
    };

    resizeBoxInfo.width = newWidth;
    resizeBoxInfo.y = newCenter.y - resizeBoxInfo.height / 2;
    resizeBoxInfo.x = newCenter.x - newWidth / 2;
  }

  if (handleType === HANDLER.BM) {
    const rotatedcurPositon = getRotatedPoint(
      curPositon,
      handlePoint,
      0 /* ?? -resizeBoxInfo.rotate */
    );
    const rotatedBottomMiddlePoint = getRotatedPoint(
      {
        x: handlePoint.x,
        y: rotatedcurPositon.y,
      },
      handlePoint,
      0 /* ?? resizeBoxInfo.rotate */
    );

    const newHeight = Math.sqrt(
      (rotatedBottomMiddlePoint.x - symmetricPoint.x) ** 2 +
        (rotatedBottomMiddlePoint.y - symmetricPoint.y) ** 2
    );

    const newCenter = {
      x:
        rotatedBottomMiddlePoint.x -
        (rotatedBottomMiddlePoint.x - symmetricPoint.x) / 2,
      y:
        rotatedBottomMiddlePoint.y +
        (symmetricPoint.y - rotatedBottomMiddlePoint.y) / 2,
    };

    resizeBoxInfo.height = newHeight;
    resizeBoxInfo.y = newCenter.y - newHeight / 2;
    resizeBoxInfo.x = newCenter.x - resizeBoxInfo.width / 2;
  }

  if (handleType === HANDLER.ML) {
    const rotatedcurPositon = getRotatedPoint(
      curPositon,
      handlePoint,
      0 /* ?? -resizeBoxInfo.rotate */
    );
    const rotatedPoint = getRotatedPoint(
      {
        x: rotatedcurPositon.x,
        y: handlePoint.y,
      },
      handlePoint,
      0 ?? resizeBoxInfo.rotate
    );

    const newWidth = Math.sqrt(
      (rotatedPoint.x - symmetricPoint.x) ** 2 +
        (rotatedPoint.y - symmetricPoint.y) ** 2
    );

    const newCenter = {
      x: rotatedPoint.x - (rotatedPoint.x - symmetricPoint.x) / 2,
      y: rotatedPoint.y + (symmetricPoint.y - rotatedPoint.y) / 2,
    };

    resizeBoxInfo.width = newWidth;
    resizeBoxInfo.y = newCenter.y - resizeBoxInfo.height / 2;
    resizeBoxInfo.x = newCenter.x - newWidth / 2;
  }

  return resizeBoxInfo;
}

function createLatLngOfRotate(param: {
  latLng: IPoint;
  center: IPoint;
  rotateNum: number;
}): IPoint {
  // 1.求点到中心点的直线距离
  const r = Math.sqrt(
    Math.pow(param.latLng.x - param.center.x, 2) +
      Math.pow(param.latLng.y - param.center.y, 2)
  );
  // 2.求点到x之间的角度
  let rotateValue =
    (Math.atan2(
      param.latLng.y - param.center.y,
      param.latLng.x - param.center.x
    ) /
      (2 * Math.acos(-1))) *
    360;
  // 3.减去旋转的角度 再整体转为弧度
  rotateValue = ((rotateValue - param.rotateNum) * Math.PI) / 180;
  // 4.根据中心的坐标、弧度、半径计算出新的坐标
  return {
    x: param.center.x + r * Math.cos(rotateValue),
    y: param.center.y + r * Math.sin(rotateValue),
  };
}

/**
 * 根据类名寻找父元素
 * @param dom dom元素
 * @param className css类名
 * @return dom | null
 */
function findParentByClass(dom: any, className: string): any {
  if (!dom || dom.tagName === "BODY") {
    return null;
  }
  if (dom.classList.contains(className)) {
    return dom;
  }
  return findParentByClass(dom.parentNode, className);
}

/**
 * 根据类名寻找精灵
 * @param dom dom元素
 * @param className css类名
 * @return dom | null
 */
export function findSpriteDomByClass(dom: any, className: string): any {
  const domList = findParentListByClass(dom, className);
  return domList.pop();
}

/**
 * 根据类名寻找所有满足条件的父元素
 * @param dom dom元素
 * @param className css类名
 * @return dom | null
 */
export function findParentListByClass(_dom: any, _className: string): any {
  const domList: any[] = [];
  const dfs = (dom: any, className: string): any => {
    if (!dom || dom.tagName === "BODY") {
      return;
    }
    if (dom.classList.contains(className)) {
      domList.push(dom);
    }
    return dfs(dom.parentNode, className);
  };

  dfs(_dom, _className);
  return domList;
}

/**
 * 怎么计算两点间连线的倾斜角？
 * Math.atan2(y2-y1,x2-x1)*180/Math.PI
 */

// 判断接近
function closeTo(a: number, b: number, d = 5): boolean {
  return Math.abs(a - b) < d;
}
/**
 * 计算元素之间靠近时的对其辅助线，以及吸附的修正距离
 * @param rect 选中的矩形区域
 * @param inactiveRectList 未选中的元素bounding列表
 * @param stageSize 舞台/画布大小
 * @returns 辅助线数组和吸附定位
 */
export const getAuxLine = ({
  rect,
  inactiveRectList,
  stageSize = { width: 0, height: 0 },
}: any) => {
  // 正在拖拽中的矩形的各个边信息

  const rectLeft = rect.x;
  const rectRight = rect.x + rect.width;
  const rectTop = rect.y;
  const rectBottom = rect.y + rect.height;
  const rectCenterX = (rectLeft + rectRight) / 2;
  const rectCenterY = (rectTop + rectBottom) / 2;

  const dis = 5;

  // 增加一个和舞台同样大小的虚拟元素，用来和舞台对齐
  const rectList = [...inactiveRectList, { x: 0, y: 0, ...stageSize }];

  let dx = 0;
  let dy = 0;
  const sourcePosSpaceMap: Record<string, any> = {};
  for (const rect of rectList) {
    // 矩形的各个边信息
    const left = rect.x;
    const right = rect.x + rect.width;
    const top = rect.y;
    const bottom = rect.y + rect.height;
    const centerX = (left + right) / 2;
    const centerY = (top + bottom) / 2;

    // x和y方向各自取开始、中间、结束三个位置，枚举出共18种情况
    const array = [
      { pos: "x", sourcePos: "left", source: rectLeft, target: left },
      { pos: "x", sourcePos: "left", source: rectLeft, target: centerX },
      { pos: "x", sourcePos: "left", source: rectLeft, target: right },

      { pos: "x", sourcePos: "centerX", source: rectCenterX, target: left },
      { pos: "x", sourcePos: "centerX", source: rectCenterX, target: centerX },
      { pos: "x", sourcePos: "centerX", source: rectCenterX, target: right },

      { pos: "x", sourcePos: "right", source: rectRight, target: left },
      { pos: "x", sourcePos: "right", source: rectRight, target: centerX },
      { pos: "x", sourcePos: "right", source: rectRight, target: right },

      { pos: "y", sourcePos: "top", source: rectTop, target: top },
      { pos: "y", sourcePos: "top", source: rectTop, target: centerY },
      { pos: "y", sourcePos: "top", source: rectTop, target: bottom },

      { pos: "y", sourcePos: "centerY", source: rectCenterY, target: top },
      { pos: "y", sourcePos: "centerY", source: rectCenterY, target: centerY },
      { pos: "y", sourcePos: "centerY", source: rectCenterY, target: bottom },

      { pos: "y", sourcePos: "bottom", source: rectBottom, target: top },
      { pos: "y", sourcePos: "bottom", source: rectBottom, target: centerY },
      { pos: "y", sourcePos: "bottom", source: rectBottom, target: bottom },
    ];

    const minX = Math.min(left, rectLeft);
    const maxX = Math.max(right, rectRight);
    const minY = Math.min(top, rectTop);
    const maxY = Math.max(bottom, rectBottom);

    // 对正在拖拽的矩形来说，每个方向上选出一个最近的辅助线即可
    array.forEach((e: any) => {
      if (closeTo(e.source, e.target)) {
        const space = e.target - e.source;
        // 选出距离更小的
        if (
          !sourcePosSpaceMap[e.sourcePos] ||
          Math.abs(sourcePosSpaceMap[e.sourcePos].space) < Math.abs(space)
        ) {
          if (e.pos === "x") {
            dx = space;
          } else {
            dy = space;
          }
          sourcePosSpaceMap[e.sourcePos] = {
            space,
            line: {
              x1: e.pos === "x" ? e.target : minX,
              x2: e.pos === "x" ? e.target : maxX,
              y1: e.pos === "y" ? e.target : minY,
              y2: e.pos === "y" ? e.target : maxY,
            },
          };
        }
      }
    });
  }
  return {
    lines: Object.values(sourcePosSpaceMap).map((e) => e.line),
    dx,
    dy,
  };
};

/**
 * 计算元素之间靠近时的对其辅助线，以及吸附的修正距离
 * @param rect 选中矩形区域
 * @param spriteList 未选中的与元素列表
 * @param activeSpriteList 选中的元素
 * @returns 辅助线数组和吸附定位
 */
export const getAuxiliaryLine = (
  adsorbLine: any,
  spriteRect: IBoundingBox,
  _rectList: IBoundingBox[],
  canvasSize: ISize,
  // 四个方向上是否禁止计算吸附线，例如正在拖动右侧，则左侧就不用计算了
  disableAdsorbSide: Record<string, boolean>,
  adsorbCanvas = true
) => {
  // 正在拖拽中的矩形的各个边信息
  const rectLeft = spriteRect.x;
  const rectRight = spriteRect.x + spriteRect.width;
  const rectTop = spriteRect.y;
  const rectBottom = spriteRect.y + spriteRect.height;
  const rectCenterX = (rectLeft + rectRight) / 2;
  const rectCenterY = (rectTop + rectBottom) / 2;

  const dis = adsorbLine.distance || 5;
  // 判断接近
  const closeTo = (a: number, b: number, d = dis) => Math.abs(a - b) < d;
  const rectList = [..._rectList];
  // 增加一个和舞台同样大小的虚拟元素，用来和舞台对齐
  if (adsorbCanvas) {
    const canvasBackground: IBoundingBox = { x: 0, y: 0, ...canvasSize };
    rectList.push(canvasBackground);
  }
  let dx = 0;
  let dy = 0;
  const sourcePosSpaceMap: Record<string, any> = {};
  for (const rect of rectList) {
    // 矩形的各个边信息
    const left = rect.x;
    const right = rect.x + rect.width;
    const top = rect.y;
    const bottom = rect.y + rect.height;
    const centerX = (left + right) / 2;
    const centerY = (top + bottom) / 2;

    // x和y方向各自取开始、中间、结束三个位置，枚举出共18种情况
    const array = [
      { pos: "x", sourcePos: "left", source: rectLeft, target: left },
      { pos: "x", sourcePos: "left", source: rectLeft, target: centerX },
      { pos: "x", sourcePos: "left", source: rectLeft, target: right },

      { pos: "x", sourcePos: "centerX", source: rectCenterX, target: left },
      { pos: "x", sourcePos: "centerX", source: rectCenterX, target: centerX },
      { pos: "x", sourcePos: "centerX", source: rectCenterX, target: right },

      { pos: "x", sourcePos: "right", source: rectRight, target: left },
      { pos: "x", sourcePos: "right", source: rectRight, target: centerX },
      { pos: "x", sourcePos: "right", source: rectRight, target: right },

      { pos: "y", sourcePos: "top", source: rectTop, target: top },
      { pos: "y", sourcePos: "top", source: rectTop, target: centerY },
      { pos: "y", sourcePos: "top", source: rectTop, target: bottom },

      { pos: "y", sourcePos: "centerY", source: rectCenterY, target: top },
      { pos: "y", sourcePos: "centerY", source: rectCenterY, target: centerY },
      { pos: "y", sourcePos: "centerY", source: rectCenterY, target: bottom },

      { pos: "y", sourcePos: "bottom", source: rectBottom, target: top },
      { pos: "y", sourcePos: "bottom", source: rectBottom, target: centerY },
      { pos: "y", sourcePos: "bottom", source: rectBottom, target: bottom },
    ];

    const minX = Math.min(left, rectLeft);
    const maxX = Math.max(right, rectRight);
    const minY = Math.min(top, rectTop);
    const maxY = Math.max(bottom, rectBottom);

    // 对正在拖拽的矩形来说，每个方向上选出一个最近的辅助线即可
    array.forEach((e: any) => {
      if (closeTo(e.source, e.target)) {
        const space = e.target - e.source;
        // 选出距离更小的
        if (
          !sourcePosSpaceMap[e.sourcePos] ||
          Math.abs(sourcePosSpaceMap[e.sourcePos].space) < Math.abs(space)
        ) {
          if (e.pos === "x") {
            dx = space;
          } else {
            dy = space;
          }
          sourcePosSpaceMap[e.sourcePos] = {
            space,
            line: {
              x1: e.pos === "x" ? e.target : minX,
              x2: e.pos === "x" ? e.target : maxX,
              y1: e.pos === "y" ? e.target : minY,
              y2: e.pos === "y" ? e.target : maxY,
            },
          };
        }
      }
    });
  }
  return {
    lines: Object.values(sourcePosSpaceMap).map((e) => e.line),
    dx,
    dy,
  };
};

// 处理吸附的修正距离作用于矩形上
export const handleAdsorb = ({
  // 正在编辑的矩形
  rect,
  // 吸附计算出来的x和y方向的变更
  dx,
  dy,
  // 移动还是缩放
  mode,
  // 正在缩放的锚点名
  resizePos = "",
  // 缩放是否移动到了反向，例如把右侧缩放锚点移动到矩形左侧
  reverse = {},
}: {
  rect: IBoundingBox;
  dx: number;
  dy: number;
  mode: string;
  resizePos?: string;
  reverse?: any;
}) => {
  const spriteRect = { ...rect };
  const {
    leftReverse = false,
    rightReverse = false,
    bottomReverse = false,
    topReverse = false,
  } = reverse;
  if (mode === "move") {
    spriteRect.x += dx;
    spriteRect.y += dy;
  } else if (mode === "resize") {
    if (resizePos.includes("right")) {
      if (rightReverse) {
        spriteRect.x += dx;
        spriteRect.width -= dx;
      } else {
        spriteRect.width += dx;
      }
    }
    if (resizePos.includes("left")) {
      if (leftReverse) {
        spriteRect.width += dx;
      } else {
        spriteRect.x += dx;
        spriteRect.width -= dx;
      }
    }
    if (resizePos.includes("top")) {
      if (topReverse) {
        spriteRect.height += dy;
      } else {
        spriteRect.y += dy;
        spriteRect.height -= dy;
      }
    }
    if (resizePos.includes("bottom")) {
      if (bottomReverse) {
        spriteRect.y += dy;
        spriteRect.height -= dy;
      } else {
        spriteRect.height += dy;
      }
    }
  }
  return spriteRect;
};

// 网格吸附
export const handleGridAdsorb = (
  rect: IBoundingBox,
  gridCellWidth: number,
  gridCellHeight: number,
  adsorbWidth = 5,
  adsorbHeight = 5,
  // 移动还是缩放
  changeMode: string,
  // 缩放时需要计算吸附的边
  adsorbSides: Record<string, boolean> = {}
) => {
  const { x, y, width, height } = rect;
  const spriteRect = { ...rect };
  // 组件左或下方向被激活
  let leftActivated = true;
  let topActivated = true;
  if (changeMode === "resize") {
    // resize的场景下，正在操作哪个方向的锚点就激活哪个方向
    leftActivated = adsorbSides.left;
    topActivated = adsorbSides.top;
  } else {
    // move的场景下，距离那哪边近就激活哪个方向
    leftActivated =
      minDisWithGrid(x, gridCellWidth) <
      minDisWithGrid(x + width, gridCellWidth);
    topActivated =
      minDisWithGrid(y, gridCellHeight) <
      minDisWithGrid(y + height, gridCellHeight);
  }
  if (leftActivated) {
    spriteRect.x = roundingUnitize(x, gridCellWidth, adsorbWidth);
  } else {
    spriteRect.x =
      roundingUnitize(x + width, gridCellWidth, adsorbWidth) - width;
  }
  if (topActivated) {
    spriteRect.y = roundingUnitize(y, gridCellHeight, adsorbHeight);
  } else {
    spriteRect.y =
      roundingUnitize(y + height, gridCellHeight, adsorbHeight) - height;
  }
  return {
    dx: spriteRect.x - rect.x || 0,
    dy: spriteRect.y - rect.y || 0,
  };
};

// 距离网格的最小距离
export const minDisWithGrid = (n: number, unit: number) =>
  Math.min(n % unit, unit - (n % unit));

// 四舍五入网格取整
export const roundingUnitize = (n: number, unit: number, adsorbDis = 4) => {
  // 余数
  const remainder = Math.abs(n % unit);
  const closeToStart = remainder <= adsorbDis;
  const closeToEnd = Math.abs(unit - (n % unit)) <= adsorbDis;
  if (closeToStart || closeToEnd) {
    const m = Math.floor(n / unit); // 是单位长度的几倍
    if (remainder <= unit / 2) {
      // 靠近单元格开始位置
      return m * unit;
    } else {
      // 靠近单元格结束位置
      return (m + 1) * unit;
    }
  }
  // 都不靠近，直接返回原本位置
  return n;
};

/**
 * @desc 获取多个矩形包裹的盒子信息
 * @param rectList 矩形块坐标数组
 * @returns
 */
function getWrapperBoxInfo(rectList: IBoundingBox[]) {
  // console.log(rectList, "rectList");

  const p = {
    minX: 10000000,
    minY: 10000000,
    maxX: 0,
    maxY: 0,
  };

  const boxInfo = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };

  if (rectList.length >= 1) {
    rectList.forEach((rect) => {
      if (rect.x < p.minX) {
        p.minX = rect.x;
      }
      if (rect.y < p.minY) {
        p.minY = rect.y;
      }
      if (rect.x + rect.width > p.maxX) {
        p.maxX = rect.x + rect.width;
      }
      if (rect.y + rect.height > p.maxY) {
        p.maxY = rect.y + rect.height;
      }
    });
    boxInfo.x = p.minX;
    boxInfo.y = p.minY;
    boxInfo.width = p.maxX - p.minX;
    boxInfo.height = p.maxY - p.minY;
  }

  return boxInfo;
}
/**
 *
 * @param pointList 多个坐标点包含的矩形
 * @returns
 */
export function getWrapperBoxByPoint(pointList: ICoordinate[]) {
  const [minX, minY, maxX, maxY] = [
    Math.min(...pointList.map((m) => m.x)),
    Math.min(...pointList.map((m) => m.y)),
    Math.max(...pointList.map((m) => m.x)),
    Math.max(...pointList.map((m) => m.y)),
  ];

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

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
  findParentByClass, // 根据类名寻找父元素
  getWrapperBoxInfo,
};
