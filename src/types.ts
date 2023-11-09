export interface IUpdateParams {
  id: string | string[];
  stateSet: IStateSet | IStateSet[];
}

export interface IStateSet {
  path: string;
  value: any;
}

export interface IHandle {
  handleType: 'select',
  target: ISprite | ISprite[],
}
