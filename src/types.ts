export interface IUpdateParams {
  id: string;
  stateSet: IStateSet | IStateSet[];
}

export interface IStateSet {
  path: string;
  value: any;
}

export interface IMode {
  handleType: string;
  value: string;
}
