// 盒子模型左上角位置
interface IPoint {
    x: number,
    y: number
}

// 盒子其他参数
interface IBox extends IPoint {
    width: number,
    height: number,
    rotate?: number
}

// 句柄名称
enum HANDLER {
   TL = 'top-left',
   TM = 'top-middle',
   TR = 'top-right',
   BL = 'bottom-left',
   BM = 'bottom-middle',
   BR = 'bottom-right',
   ML = 'middle-left',
   MR = 'middle-right',
}

export {
    HANDLER,
    type IPoint,
    type IBox
}