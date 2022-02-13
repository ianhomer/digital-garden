export interface Thing {
  name: string;
  content: () => string;
}

export interface FileThing extends Thing {
  filename: string;
}
