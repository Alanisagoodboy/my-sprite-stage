export interface IUpdateParams {
  id: string;
  stateSet: IStateSet | IStateSet[];
}

export interface IStateSet {
  path: string;
  value: any;
}

// 当前操作模式
export type IMode = "default" | "editText"
