export interface foundObj {
  taxaId: number;
  signature: string | undefined;
  foundName?: string;
}

export interface allFoundObj {
  [index: string]: foundObj;
}

export interface Object {
  [index: string]: any;
}