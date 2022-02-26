import { SimulationLinkDatum, SimulationNodeDatum } from "d3-force";

import { LinkType } from "../garden/types";

export enum NodeType {
  Thing = "thing",
}

export interface Node extends SimulationNodeDatum {
  id: string;
  size?: number;
  type?: NodeType;
}

export interface NodeLink extends SimulationLinkDatum<Node> {
  id?: string;
  type?: LinkType;
  size?: number;
}

export interface Graph {
  nodes: Node[];
  links: NodeLink[];
}
