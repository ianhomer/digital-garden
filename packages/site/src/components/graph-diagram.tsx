import * as d3 from "d3";
import { useEffect, useRef } from "react";

import { Graph, Node, NodeLink } from "../lib/graph/types";
import collideRectangle from "./collideRectangle";

interface GraphDiagramProps {
  graph: Graph;
  className?: string;
  width?: number;
  height?: number;
}

GraphDiagram.defaultProps = {
  className: "fullscreen",
  width: 2000,
  height: 2000,
};

const getRadius = (d: Node) => (d.depth == 1 ? 30 : d.depth == 2 ? 15 : 10);

export default function GraphDiagram(props: GraphDiagramProps) {
  const ref = useRef(null);
  const width = props.width ?? 600;
  const height = props.height ?? 400;
  const xOffset = width / 2;
  const yOffset = height / 8;
  const xOffsetText = -50;
  const yOffsetText = -20;
  const heightText = 20;
  const widthText = 200;

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.attr("viewBox", `0 0 ${width} ${height}`);
  }, []);

  useEffect(() => {
    const svg = d3.select(ref.current);

    const link = svg
      .selectAll(".link")
      .data(props.graph.links)
      .join("line")
      .classed("link", true)
      .attr("stroke-width", (d: NodeLink) =>
        d.depth == 1 ? 8 : d.depth == 2 ? 2 : 1
      );

    const group = svg
      .selectAll<SVGElement, Node>(".group")
      .data(props.graph.nodes)
      .join("g")
      .classed("group", true)
      .classed("wanted", (d: Node) => d.wanted)
      .classed("fixed", (d: Node) => d.fx !== undefined)
      .raise();

    // group
    //   .append("rect")
    //   .attr("x", xOffsetText)
    //   .attr("y", yOffsetText - heightText)
    //   .attr("width", widthText)
    //   .attr("height", heightText);

    group.append("circle").attr("r", getRadius).classed("node", true);

    const anchor = group.append("a").attr("href", (d: Node) => `/${d.id}`);

    anchor
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
      .force("charge", d3.forceManyBody().strength(-700))
      // .force("collide", d3.forceCollide().radius(getRadius))
      .force(
        "collideRectangle",
        collideRectangle([xOffsetText, yOffsetText, widthText, heightText])
      )
      .force("center", d3.forceCenter(0, height / 3).strength(0.6))
      .force("link", forceLink.id((d: Node) => d.id).strength(0.2))
      .tick(80)
      .alphaMin(0.1)
      .alphaDecay(0.02)
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
      <svg ref={ref} className={props.className ?? "fullscreen"} />
    </>
  );
}
