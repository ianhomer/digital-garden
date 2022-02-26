import { SimulationLinkDatum, SimulationNodeDatum } from "d3-force";

export enum NodeType {
  Thing = "thing",
}

export enum LinkType {
  To = "to",
  From = "from",
}

export interface Node extends SimulationNodeDatum {
  id: string;
  size?: number;
  type?: NodeType;
}

export interface Link extends SimulationLinkDatum<Node> {
  id?: string;
  type?: LinkType;
  size?: number;
}

export interface Graph {
  nodes: Node[];
  links: Link[];
}
