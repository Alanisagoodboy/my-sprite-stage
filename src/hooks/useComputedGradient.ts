import { computed } from "vue";
import {
  parseGradientColor,
  calculateGradientCoordinate,
} from "@/utils/calculateGradientCoordinate.ts";
import { ISprite } from "@/components/meta-data/types";
export default (props: { sprite: ISprite }) => {
  /* 处理渐变 */
  const computedGradient = computed(() => {
    const { gradientFill } = props.sprite.attrs;

    if (!gradientFill) return null;
    // 目前只支持一组渐变，且是线性渐变gbgf
    const gradientColor = parseGradientColor(gradientFill);
    console.log(gradientColor, "g87");

    if (gradientColor.type === "linear-gradient") {
      console.log(gradientColor, "gradientColor");

      const angle = gradientColor.orientation?.value || 0;

      const stopList = gradientColor.colorStops.map((stop) => {
        const { length, value } = stop;
        return {
          offset: (length?.value || "0") + (length?.type || "%"),
          stopColor: `rgb(${value.slice(0, -1)})`,
          stopOpacity: value[value.length - 1] || 0,
        };
      });

      // const { width, height } = boundingBox.value;
      const lineInfo = calculateGradientCoordinate(+angle);

      return {
        originColor: gradientFill,
        linearGradient: {
          id: `rect-linear-gradient-${props.sprite.id}`,
          ...lineInfo,
        },
        stopList,
      };
    } else {
      return null;
    }
  });

  return { computedGradient };
};
