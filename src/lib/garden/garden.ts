import config from "../../../garden.config";

export interface Garden {
  config: GardenConfig;
}
export interface GardenConfig {
  directory: string;
  gardens?: [string, string];
}

export const garden = {
  config,
};
