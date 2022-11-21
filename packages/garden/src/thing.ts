export interface Thing {
  name: string;
  content: () => Promise<string>;
  value?: number;
}

export interface FileThing extends Thing {
  filename: string;
}
