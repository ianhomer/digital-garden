import {
  Graph,
  GraphConfiguration,
  Node,
  NodeLink,
  renderGraph,
} from "@garden/graph";
import { LinkType } from "@garden/types";
import * as d3 from "d3";
import { SimulationNodeDatum } from "d3";
import { useEffect, useRef } from "react";

interface GraphDiagramProps {
  graph: Graph;
  width: number;
  height: number;
  scale: number;
}

GraphDiagram.defaultProps = {
  className: "fullscreen",
};

const DEPTH_1_RADIUS = 30;
const getRadius = (d: Node | SimulationNodeDatum) => {
  if ("depth" in d) {
    return d.depth == 0
      ? DEPTH_1_RADIUS
      : d.depth == 1
      ? 15
      : d.depth == 2
      ? 5
      : 2;
  } else {
    return 2;
  }
};

// How much node repels
const getCharge = (factor: number) => (d: Node | SimulationNodeDatum) => {
  if ("depth" in d) {
    return d.depth == 0
      ? -5000 * factor
      : d.depth == 1
      ? -500 * factor
      : d.depth == 2
      ? -50 * factor
      : -5 * factor;
  } else {
    return -20 * factor;
  }
};

const getLinkStrokeWidth = (d: NodeLink) =>
  d.depth == 0 ? 8 : d.depth == 1 ? 2 : 1;

const linkTypeForceWeight = (linkType: LinkType) => {
  switch (linkType) {
    case LinkType.Child:
      return 0.9;
    case LinkType.To:
      return 0.6;
    case LinkType.From:
      return 0.5;
    case LinkType.NaturalTo:
      return 0.45;
    case LinkType.NaturalFrom:
      return 0.35;
    case LinkType.NaturalAlias:
      return 0.25;
    default:
      return 0.1;
  }
};

const linkDepthForceWeight = (link: NodeLink) =>
  link.depth == 0
    ? 0.08
    : link.depth == 1
    ? 0.2
    : link.depth == 2
    ? 0.15
    : 0.08;

// How much each link attracts
const getLinkForce = (factor: number) => (d: NodeLink) =>
  factor * linkTypeForceWeight(d.type) * linkDepthForceWeight(d);

export default function GraphDiagram({
  graph,
  width,
  height,
  scale,
}: GraphDiagramProps) {
  const ref = useRef(null);

  const viewHeight = height * scale;
  const viewWidth = width * scale;
  const minDimension = Math.min(viewWidth, viewHeight);
  const boundarySize = DEPTH_1_RADIUS * 2;
  const xOffset = viewWidth / 2;
  const yOffset = viewHeight / 2;

  const graphConfiguration: GraphConfiguration = {
    viewHeight,
    viewWidth,
    minDimension,
    boundarySize,
    xOffset,
    yOffset,
    leftBoundary: -viewWidth / 2 + boundarySize,
    rightBoundary: viewWidth / 2 - boundarySize,
    topBoundary: -yOffset + boundarySize,
    bottomBoundary: viewHeight - yOffset - boundarySize,
    xOffsetText: -35,
    yOffsetText: -10,
    heightText: 60,
    widthText: 1000,
    linkForceFactor: 1.5,
    chargeForceFactor: 1.5,
    centerForceFactor: Math.min(0.25 * (1100.0 / minDimension) ** 2, 0.3),

    getRadius,
    getCharge,
    getLinkStrokeWidth,
    linkTypeForceWeight,
    linkDepthForceWeight,
    getLinkForce,
  };

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.attr("viewBox", `0 0 ${viewWidth} ${viewHeight}`);
  }, [width, height, scale]);

  useEffect(() => {
    const svg = d3.select(ref.current);

    renderGraph(graph, graphConfiguration, svg);
  }, [width, height, graph]);

  return (
    <>
      <svg ref={ref} />
    </>
  );
}
