import { LinkType } from "@garden/types";
import { SimulationLinkDatum, SimulationNodeDatum } from "d3-force";

export enum NodeType {
  Thing = "thing",
}

export interface Node extends SimulationNodeDatum {
  id: string;
  title: string;
  type: NodeType;
  depth: number;
  siblings: number;
  showLabel: boolean;
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
