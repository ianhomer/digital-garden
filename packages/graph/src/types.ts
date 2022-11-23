import { LinkType } from "@garden/types";
import { SimulationLinkDatum, SimulationNodeDatum } from "d3-force";

export enum NodeType {
  Thing = "thing",
}

export interface Node extends SimulationNodeDatum {
  id: string;
  title: string;
  context?: string;
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

export interface GraphConfiguration {
  viewWidth: number;
  viewHeight: number;
  minDimension: number;
  xOffset: number;
  yOffset: number;
  boundarySize: number;
  leftBoundary: number;
  rightBoundary: number;
  topBoundary: number;
  bottomBoundary: number;
  xOffsetText: number;
  yOffsetText: number;
  heightText: number;
  widthText: number;
  linkForceFactor: number;
  chargeForceFactor: number;
  centerForceFactor: number;

  getRadius: (d: Node | SimulationNodeDatum) => number;
  getCharge: (factor: number) => (d: Node | SimulationNodeDatum) => number;
  getLinkStrokeWidth: (d: NodeLink) => number;
  linkTypeForceWeight: (linkType: LinkType) => number;
  linkDepthForceWeight: (link: NodeLink) => number;
  getLinkForce: (factor: number) => (d: NodeLink) => number;
}
