import { createGarden, toConfig } from "@garden/garden";

import options from "../garden.config";

export const config = toConfig(options);
export const garden = createGarden(config);
