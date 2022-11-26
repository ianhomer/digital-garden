import { LinkType } from "@garden/types";
import { SimulationLinkDatum, SimulationNodeDatum } from "d3-force";

export type GardenSimulation = d3.Simulation<SimulationNodeDatum, undefined>;

export enum NodeType {
  Thing = "thing",
}

export interface GraphNode extends SimulationNodeDatum {
  id: string;
  title: string;
  context?: string;
  type: NodeType;
  depth: number;
  siblings: number;
  showLabel: boolean;
  wanted: boolean;
}

export interface NodeLink extends SimulationLinkDatum<GraphNode> {
  type: LinkType;
  depth: number;
}

export interface Graph {
  nodes: GraphNode[];
  links: NodeLink[];
}

export interface InitialNodeValue {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number;
  fy?: number;
}

export type InitialNodeValueMap = { [key: string]: InitialNodeValue };

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

  getRadius: (d: GraphNode | SimulationNodeDatum) => number;
  getCharge: (factor: number) => (d: GraphNode | SimulationNodeDatum) => number;
  linkTypeForceWeight: (linkType: LinkType) => number;
  linkDepthForceWeight: (link: NodeLink) => number;
  getLinkForce: (factor: number) => (d: NodeLink) => number;
}
