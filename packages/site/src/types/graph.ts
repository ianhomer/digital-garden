import { SimulationLinkDatum, SimulationNodeDatum } from "d3-force";

import { LinkType } from "../lib/garden/meta";

export enum NodeType {
  Thing = "thing",
}

export interface GraphNode extends SimulationNodeDatum {
  id: string;
  size?: number;
  type?: NodeType;
}

export interface GraphLink extends SimulationLinkDatum<GraphNode> {
  id?: string;
  type?: LinkType;
  size?: number;
}

export interface Graph {
  nodes: GraphNode[];
  links: GraphLink[];
}
