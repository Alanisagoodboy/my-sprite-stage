import { getWrapperBoxByPoint } from "../../utils";
import { ICoordinate, ISprite } from "./types";

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
    targetPointsInStage,
  }: {
    sprite: ISprite;
    targetPointsInStage: ICoordinate[];
  }) => {
    const boundingBox = getWrapperBoxByPoint(targetPointsInStage);
    const points: ICoordinate[] = targetPointsInStage.map((m: ICoordinate) => {
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
    pointChange
  }
}
