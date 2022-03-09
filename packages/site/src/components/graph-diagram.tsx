import * as d3 from "d3";
import { useEffect, useRef } from "react";

import { Graph, Node, NodeLink } from "../lib/graph/types";
import collideRectangle from "./collideRectangle";

interface GraphDiagramProps {
  graph: Graph;
  className?: string;
  width: number;
  height: number;
  scale: number;
}

GraphDiagram.defaultProps = {
  className: "fullscreen",
};

const getRadius = (d: Node) =>
  d.depth == 0 ? 30 : d.depth == 1 ? 15 : d.depth == 2 ? 10 : 4;

const getCharge = (d: Node) =>
  d.depth == 0 ? -700 : d.depth == 1 ? -600 : d.depth == 2 ? -500 : -50;

const getLinkStrokeWidth = (d: NodeLink) =>
  d.depth == 0 ? 8 : d.depth == 1 ? 2 : 1;

export default function GraphDiagram(props: GraphDiagramProps) {
  const ref = useRef(null);
  const width = props.width * props.scale;
  const height = props.height * props.scale;
  const xOffset = width / 2;
  const yOffset = height / 8;
  const xOffsetText = -30;
  const yOffsetText = -15;
  const heightText = 20;
  const widthText = 200;

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const link = svg
      .selectAll(".link")
      .data(props.graph.links)
      .join("line")
      .classed("link", true)
      .attr("stroke-width", getLinkStrokeWidth);

    const group = svg
      .selectAll<SVGElement, Node>(".group")
      .data(props.graph.nodes)
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
      .filter((d: Node) => d.depth < 3)
      .append("text")
      .text((d: Node) => d.id)
      .attr("x", xOffsetText)
      .attr("y", yOffsetText)
      .attr("class", (d: Node) => `depth-${d.depth}`)
      .classed("label", true);

    function tick() {
      link
        .attr("x1", (d: any) => d.source.x + xOffset)
        .attr("y1", (d: any) => d.source.y + yOffset)
        .attr("x2", (d: any) => d.target.x + xOffset)
        .attr("y2", (d: any) => d.target.y + yOffset);
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

    function click(this: SVGElement, event: any, d: Node) {
      delete d.fx;
      delete d.fy;
      d3.select(event.currentTarget).classed("fixed", false);
      simulation.alpha(0).restart();
    }

    const forceLink = d3.forceLink<Node, NodeLink>(props.graph.links);

    const simulation = d3
      .forceSimulation()
      .nodes(props.graph.nodes)
      .force("charge", d3.forceManyBody().strength(getCharge))
      .force("collide", d3.forceCollide().radius(getRadius))
      .force(
        "collideRectangle",
        collideRectangle([xOffsetText, yOffsetText, widthText, heightText])
      )
      .force("center", d3.forceCenter(0, height / 3).strength(0.6))
      .force("link", forceLink.id((d: Node) => d.id).strength(0.2))
      .tick(150)
      .alphaMin(0.01)
      .alphaDecay(0.03)
      .on("tick", tick);

    function dragstart(this: SVGElement) {
      d3.select(this).classed("fixed", true);
    }

    function clamp(x: number, low: number, high: number) {
      return x < low ? low : x > high ? high : x;
    }

    function dragged(this: SVGElement, event: any) {
      event.subject.fx = clamp(event.x, -xOffset, xOffset);
      event.subject.fy = clamp(event.y, -yOffset, height - yOffset);
      simulation.alpha(1).restart();
    }

    const drag = d3
      .drag<SVGElement, Node, any>()
      .on("start", dragstart)
      .on("drag", dragged);

    group.call(drag).on("click", click);
  }, [props]);

  return (
    <>
      <svg ref={ref} className={props.className} />
    </>
  );
}
