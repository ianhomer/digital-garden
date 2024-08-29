import { LinkType } from "@garden/graph";
import { SimulationLinkDatum, SimulationNodeDatum } from "d3-force";

export type GardenSimulation = d3.Simulation<SimulationNodeDatum, undefined>;

export enum NodeType {
  Thing = "thing",
}

export interface GraphNode {
  id: string;
  title: string;
  context?: string;
  type: NodeType;
  depth: number;
  siblings: number;
  showLabel: boolean;
  wanted: boolean;
}

export interface GraphNodeDatum extends SimulationNodeDatum, GraphNode {}

export interface GraphLink {
  type: LinkType;
  depth: number;
}

export interface GraphLinkDatum
  extends SimulationLinkDatum<GraphNodeDatum>,
    GraphLink {}

export interface Graph {
  nodes: GraphNodeDatum[];
  links: GraphLinkDatum[];
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
  maxNodes: number;

  depth: number;
  getRadius: (d: GraphNodeDatum | SimulationNodeDatum) => number;
  getCharge: (
    factor: number,
  ) => (d: GraphNodeDatum | SimulationNodeDatum) => number;
  linkTypeForceWeight: (linkType: LinkType) => number;
  linkDepthForceWeight: (link: GraphLink) => number;
  getLinkForce: (factor: number) => (d: GraphLink) => number;
}

export type GraphSelect = d3.Selection<
  d3.BaseType,
  null,
  HTMLElement | null,
  undefined
>;
