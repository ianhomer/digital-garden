import { SimulationLinkDatum, SimulationNodeDatum } from "d3-force";

import { LinkType } from "../garden/types";

export enum NodeType {
  Thing = "thing",
}

export interface Node extends SimulationNodeDatum {
  id: string;
  type: NodeType;
  depth: number;
  wanted: boolean;
}

export interface NodeLink extends SimulationLinkDatum<Node> {
  type: LinkType;
  depth: number;
}

export interface Graph {
  nodes: Node[];
  links: NodeLink[];
}
