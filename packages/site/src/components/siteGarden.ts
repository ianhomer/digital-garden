import { createGarden, toConfig } from "@garden/garden";

import options from "../garden.config.js";

export const config = toConfig(options);
export const garden = createGarden(config);
