import { LinkType } from "@garden/types";
import { SimulationNodeDatum } from "d3";

import { GraphConfiguration, NodeLink } from "./types";

const DEPTH_1_RADIUS = 30;
const boundarySize = DEPTH_1_RADIUS * 2;

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

type DefaultConfigurationParameters = {
  viewWidth: number;
  viewHeight: number;
};

const defaultConfiguration = (
  parameters: DefaultConfigurationParameters
): GraphConfiguration => {
  const viewHeight = parameters.viewHeight;
  const viewWidth = parameters.viewWidth;
  const minDimension = Math.min(viewWidth, viewHeight);
  const xOffset = viewWidth / 2;
  const yOffset = viewHeight / 2;

  return {
    viewHeight,
    viewWidth,
    minDimension,
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
    boundarySize,
    getRadius: (d: Node | SimulationNodeDatum) => {
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
    },

    // How much node repels
    getCharge: (factor: number) => (d: Node | SimulationNodeDatum) => {
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
    },

    linkTypeForceWeight,
    linkDepthForceWeight,

    // How much each link attracts
    getLinkForce: (factor: number) => (d: NodeLink) =>
      factor * linkTypeForceWeight(d.type) * linkDepthForceWeight(d),
  };
};

export default defaultConfiguration;
