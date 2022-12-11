import { builder } from "@garden/core";

import collideRectangle from "./collide-rectangle";
import defaultConfiguration from "./default-configuration";
import itemName from "./item-name";
import render from "./render";
import {
  GardenSimulation,
  Graph,
  GraphConfiguration,
  GraphNode,
  NodeLink,
} from "./types";

export type {
  GardenSimulation,
  Graph,
  GraphConfiguration,
  GraphNode as Node,
  NodeLink,
};

export { builder, collideRectangle, defaultConfiguration, itemName, render };
