import * as d3 from "d3";
import { useEffect, useRef } from "react";

import { Graph, Link, Node } from "../types/graph";

interface GraphDiagramProps {
  graph: Graph;
  className?: string;
  width?: number;
  height?: number;
}

GraphDiagram.defaultProps = {
  className: "fullscreen",
  width: 500,
  height: 500,
};

export default function GraphDiagram(props: GraphDiagramProps) {
  const ref = useRef(null);
  const width = props.width ?? 600;
  const height = props.height ?? 400;
  const xOffset = width / 2;
  const yOffset = height / 2;

  // Initial Load
  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.attr("viewBox", `0 0 ${width} ${height}`);
  }, []);

  // props update
  useEffect(() => {
    console.log("useEffect 2");
    const svg = d3.select(ref.current);

    const link = svg
      .selectAll(".link")
      .data(props.graph.links)
      .join("line")
      .classed("link", true)
      .attr("stroke-width", (d: Link) => d.size ?? 1);

    const group = svg
      .selectAll<SVGElement, Node>(".group")
      .data(props.graph.nodes)
      .join("g")
      .classed("group", true)
      .raise();

    group
      .append("circle")
      .attr("r", (d: Node) => d?.size ?? 5)
      .attr("data-type", (d: Node) => d?.type ?? "change")
      .classed("node", true)
      .classed("fixed", (d: Node) => d.fx !== undefined);

    const anchor = group.append("a").attr("href", (d: Node) => `/${d.label}`);

    anchor
      .append("text")
      .text((d: Node) => d?.label ?? null)
      .attr("x", (d: Node) => 5 + (d?.size ?? 5))
      .attr("y", 5)
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

    const forceLink = d3.forceLink<Node, Link>(props.graph.links);

    const simulation = d3
      .forceSimulation()
      .nodes(props.graph.nodes)
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(0, 0).strength(0.01))
      .force("link", forceLink.id((d: Node) => d.id).strength(0.1))
      // .alpha(0.1)
      // .alphaDecay(0)
      .on("tick", tick);

    function dragstart(this: SVGElement) {
      d3.select(this).classed("fixed", true);
    }

    function clamp(x: number, low: number, high: number) {
      return x < low ? low : x > high ? high : x;
    }

    function dragged(this: SVGElement, event: any) {
      event.subject.fx = clamp(event.x, -xOffset, xOffset);
      event.subject.fy = clamp(event.y, -yOffset, yOffset);
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
