export interface Thing {
  name: string;
  content: () => Promise<string>;
}

export interface FileThing extends Thing {
  filename: string;
}
