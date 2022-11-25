import { Things } from "@garden/types";
import * as d3 from "d3";
import { Selection } from "d3";

import collideRectangle from "./collideRectangle";
import findDeepLinks from "./findDeepLinks";
import { createGraph } from "./graph";
import { GraphConfiguration, Node, NodeLink } from "./types";

const onNodeMouseOver = (_: MouseEvent, current: Node) => {
  d3.selectAll<SVGAElement, Node>(".group")
    .filter((d: Node) => d.id === current.id)
    .classed("active", true);
  d3.selectAll<SVGAElement, NodeLink>("line")
    .filter(
      (d: NodeLink) =>
        (d.target as Node).id === current.id ||
        (d.source as Node).id === current.id
    )
    .classed("active", true);
};

const onNodeMouseLeave = (_: MouseEvent, current: Node) => {
  d3.selectAll<SVGAElement, Node>(".group")
    .filter((d: Node) => d.id === current.id)
    .classed("active", false);
  d3.selectAll<SVGAElement, NodeLink>("line")
    .filter(
      (d: NodeLink) =>
        (d.target as Node).id === current.id ||
        (d.source as Node).id === current.id
    )
    .classed("active", false);
};

const renderGraph = (
  start: string,
  data: Things,
  depth: number,
  config: GraphConfiguration,
  svg: Selection<null, unknown, null, undefined>
) => {
  const graph = createGraph(start, data, findDeepLinks(data, start, depth));

  svg.selectAll("svg > *").remove();

  const link = svg
    .selectAll<SVGLineElement, NodeLink>(".link")
    .data(graph.links)
    .join("line")
    .attr("class", (d: NodeLink) => `link ${d.type} depth-${d.depth}`)
    .attr("x1", config.xOffset)
    .attr("x2", config.xOffset)
    .attr("y1", config.yOffset)
    .attr("y2", config.yOffset);

  const group = svg
    .selectAll<SVGElement, Node>(".group")
    .data(graph.nodes)
    .join("g")
    .classed("group", true)
    .classed("wanted", (d: Node) => d.wanted)
    .classed("fixed", (d: Node) => d.fx !== undefined)
    .classed("hideLabel", (d: Node) => !d.showLabel)
    .attr("class", function (d: Node) {
      return `${d3.select(this).attr("class")} depth-${d.depth}`;
    })
    .attr("transform", `translate(${config.xOffset},${config.yOffset})`)
    .raise();

  group
    .append("circle")
    .on("mouseover", onNodeMouseOver)
    .on("mouseleave", onNodeMouseLeave)
    .attr("r", config.getRadius)
    .classed("node", true)
    .append("title")
    .text((d: Node) => d.id);

  const anchor = group.append("a").attr("href", (d: Node) => `/${d.id}`);

  anchor
    .append("text")
    .on("mouseover", onNodeMouseOver)
    .on("mouseleave", onNodeMouseLeave)
    .text((d: Node) => d.title)
    .attr("x", config.xOffsetText)
    .attr("y", config.yOffsetText)
    .classed("label", true)
    .append("text");

  anchor
    .filter((d: Node) => d.showLabel && !!d.context)
    .append("text")
    .attr("x", config.xOffsetText)
    .attr(
      "y",
      (d: Node) =>
        config.yOffsetText -
        ((depth) => (depth == 0 ? 40 : depth == 1 ? 30 : depth == 2 ? 15 : 10))(
          d.depth
        )
    )
    .text((d: Node) => d.context || "n/a")
    .classed("context-label", true);

  function tick() {
    if (Math.random() > 0.4) {
      return;
    }
    link
      .attr("x1", (d) => ((d.source as Node).x ?? 0) + config.xOffset)
      .attr("y1", (d) => ((d.source as Node).y ?? 0) + config.yOffset)
      .attr("x2", (d) => ((d.target as Node).x ?? 0) + config.xOffset)
      .attr("y2", (d) => ((d.target as Node).y ?? 0) + config.yOffset);
    group.attr(
      "transform",
      (d: Node) =>
        "translate(" +
        (config.xOffset + (d?.x ?? 0)) +
        "," +
        (config.yOffset + (d?.y ?? 0)) +
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
    .force(
      "charge",
      d3.forceManyBody().strength(config.getCharge(config.chargeForceFactor))
    )
    .force("collide", d3.forceCollide().radius(config.getRadius))
    .force(
      "collideRectangle",
      collideRectangle(
        [
          config.xOffsetText,
          config.yOffsetText,
          config.widthText,
          config.heightText,
        ],
        2
      )
    )
    .force("forceX", d3.forceX(0).strength(config.centerForceFactor))
    .force("forceY", d3.forceY(0).strength(config.centerForceFactor))
    .force(
      "link",
      forceLink
        .id((d: Node) => d.id)
        .strength(config.getLinkForce(config.linkForceFactor))
    )
    .tick(50)
    .alpha(1)
    .alphaMin(0.02)
    .alphaDecay(0.01)
    .on("tick", tick)
    .on("end", tick);

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
    event.subject.fx = clamp(
      event.x,
      config.leftBoundary,
      config.rightBoundary
    );
    event.subject.fy = clamp(
      event.y,
      config.topBoundary,
      config.bottomBoundary
    );
    simulation.alpha(1).restart();
  }

  const drag = d3
    .drag<SVGElement, Node, never>()
    .on("start", dragstart)
    .on("drag", dragged);

  group.call(drag).on("click", click);
};

export default renderGraph;
