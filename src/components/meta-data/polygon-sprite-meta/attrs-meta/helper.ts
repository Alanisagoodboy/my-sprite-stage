/**
 * 判断入参是不是非负数number，不是返回0
 * @param val
 * @returns
 */
export function getNumberValid(val: any, defaultVal: any) {
  const _val = +val;
  if (!isNaN(_val) && typeof _val === "number") {
    return Math.max(0, _val);
  }

  return defaultVal;
}
