export interface IUpdateParams {
  id: string;
  stateSet: IStateSet | IStateSet[];
}

export interface IStateSet {
  path: string;
  value: any;
}
