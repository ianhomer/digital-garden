import { LinkType } from "@garden/types";
import * as d3 from "d3";
import { useEffect, useRef } from "react";

import { Graph, Node, NodeLink } from "../lib/graph/types";
import collideRectangle from "./collideRectangle";

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
const getRadius = (d: Node) =>
  d.depth == 0 ? DEPTH_1_RADIUS : d.depth == 1 ? 15 : d.depth == 2 ? 10 : 4;

// How much node repels
const getCharge = (d: Node) =>
  d.depth == 0 ? -8000 : d.depth == 1 ? -500 : d.depth == 2 ? -300 : -50;

const getLinkStrokeWidth = (d: NodeLink) =>
  d.depth == 0 ? 8 : d.depth == 1 ? 2 : 1;

const linkTypeForceWeight = (linkType: LinkType) => {
  switch (linkType) {
    case LinkType.To:
      return 0.6;
    case LinkType.From:
      return 0.5;
    case LinkType.NaturalTo:
      return 0.45;
    case LinkType.NaturalFrom:
      return 0.35;
  }
};

const linkDepthForceWeight = (link: NodeLink) =>
  link.depth == 0 ? 0.08 : link.depth == 1 ? 0.2 : link.depth == 2 ? 0.8 : 1.2;

// How much each link attracts
const getLinkForce = (d: NodeLink) =>
  linkTypeForceWeight(d.type) * linkDepthForceWeight(d);

export default function GraphDiagram({
  graph,
  width,
  height,
  scale,
}: GraphDiagramProps) {
  const ref = useRef(null);
  const viewWidth = width * scale;
  const viewHeight = height * scale;
  const xOffset = viewWidth / 2;
  const yOffset = viewHeight / 2;
  const boundarySize = DEPTH_1_RADIUS * 2;
  const leftBoundary = -viewWidth / 2 + boundarySize;
  const rightBoundary = viewWidth / 2 - boundarySize;
  const topBoundary = -yOffset + boundarySize;
  const bottomBoundary = viewHeight - yOffset - boundarySize;
  const xOffsetText = -35;
  const yOffsetText = -10;
  const heightText = 50;
  const widthText = 800;

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.attr("viewBox", `0 0 ${viewWidth} ${viewHeight}`);
  }, [width, height, scale]);

  useEffect(() => {
    const svg = d3.select(ref.current);

    const link = svg
      .selectAll<SVGLineElement, NodeLink>(".link")
      .data(graph.links)
      .join("line")
      .attr("class", (d: NodeLink) => `link ${d.type}`)
      .attr("stroke-width", getLinkStrokeWidth);

    const group = svg
      .selectAll<SVGElement, Node>(".group")
      .data(graph.nodes)
      .join("g")
      .classed("group", true)
      .classed("wanted", (d: Node) => d.wanted)
      .classed("fixed", (d: Node) => d.fx !== undefined)
      .raise();

    group
      .append("circle")
      .attr("r", getRadius)
      .classed("node", true)
      .append("title")
      .text((d: Node) => d.id);

    const anchor = group.append("a").attr("href", (d: Node) => `/${d.id}`);

    anchor
      .filter((d: Node) => d.showLabel)
      .append("text")
      .text((d: Node) => d.title)
      .attr("x", xOffsetText)
      .attr("y", yOffsetText)
      .attr("class", (d: Node) => `depth-${d.depth}`)
      .classed("label", true);

    function tick() {
      link
        .attr("x1", (d) => (d.source as Node).x + xOffset)
        .attr("y1", (d) => (d.source as Node).y + yOffset)
        .attr("x2", (d) => (d.target as Node).x + xOffset)
        .attr("y2", (d) => (d.target as Node).y + yOffset);
      group.attr(
        "transform",
        (d: Node) =>
          "translate(" +
          (xOffset + (d?.x ?? 0)) +
          "," +
          (yOffset + (d?.y ?? 0)) +
          ")"
      );
    }

    function click(
      this: SVGElement,
      event: { currentTarget: never },
      d: Node
    ): void {
      delete d.fx;
      delete d.fy;
      d3.select(event.currentTarget).classed("fixed", false);
      simulation.alpha(0).restart();
    }

    const forceLink = d3.forceLink<Node, NodeLink>(graph.links);

    const simulation = d3
      .forceSimulation()
      .nodes(graph.nodes)
      .force("charge", d3.forceManyBody().strength(getCharge))
      .force("collide", d3.forceCollide().radius(getRadius))
      .force(
        "collideRectangle",
        collideRectangle([xOffsetText, yOffsetText, widthText, heightText])
      )
      .force("forceX", d3.forceX(0).strength(0.1))
      .force("forceY", d3.forceY(0).strength(0.1))
      .force("link", forceLink.id((d: Node) => d.id).strength(getLinkForce))
      .tick(200)
      .alphaMin(0.02)
      .alphaDecay(0.03)
      .on("tick", tick);

    function dragstart(this: SVGElement) {
      d3.select(this).classed("fixed", true);
    }

    function clamp(x: number, low: number, high: number) {
      return x < low ? low : x > high ? high : x;
    }

    function dragged(
      this: SVGElement,
      event: { subject: { fx: number; fy: number }; x: number; y: number }
    ) {
      event.subject.fx = clamp(event.x, leftBoundary, rightBoundary);
      event.subject.fy = clamp(event.y, topBoundary, bottomBoundary);
      simulation.alpha(1).restart();
    }

    const drag = d3
      .drag<SVGElement, Node, never>()
      .on("start", dragstart)
      .on("drag", dragged);

    group.call(drag).on("click", click);
  }, [graph]);

  return (
    <>
      <svg ref={ref} />
    </>
  );
}
