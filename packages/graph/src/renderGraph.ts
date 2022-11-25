import { Things } from "@garden/types";
import * as d3 from "d3";
import { Selection } from "d3";

import collideRectangle from "./collideRectangle";
import findDeepLinks from "./findDeepLinks";
import { createGraph } from "./graph";
import {
  GardenSimulation,
  Graph,
  GraphConfiguration,
  GraphNode,
  NodeLink,
} from "./types";

const onNodeMouseOver = (_: MouseEvent, current: GraphNode) => {
  d3.selectAll<SVGAElement, GraphNode>(".group")
    .filter((d: GraphNode) => d.id === current.id)
    .classed("active", true);
  d3.selectAll<SVGAElement, NodeLink>("line")
    .filter(
      (d: NodeLink) =>
        (d.target as GraphNode).id === current.id ||
        (d.source as GraphNode).id === current.id
    )
    .classed("active", true);
};

const onNodeMouseLeave = (_: MouseEvent, current: GraphNode) => {
  d3.selectAll<SVGAElement, GraphNode>(".group")
    .filter((d: GraphNode) => d.id === current.id)
    .classed("active", false);
  d3.selectAll<SVGAElement, NodeLink>("line")
    .filter(
      (d: NodeLink) =>
        (d.target as GraphNode).id === current.id ||
        (d.source as GraphNode).id === current.id
    )
    .classed("active", false);
};

function clamp(x: number, low: number, high: number) {
  return x < low ? low : x > high ? high : x;
}

function dragstart(this: SVGElement) {
  d3.select(this).classed("fixed", true);
}

const update = (
  config: GraphConfiguration,
  graph: Graph,
  svg: Selection<null, unknown, null, undefined>
) => {
  svg.selectAll("svg > *").remove();

  svg
    .selectAll<SVGLineElement, NodeLink>(".link")
    .data(graph.links)
    .join("line")
    .attr("class", (d: NodeLink) => `link ${d.type} depth-${d.depth}`)
    .attr("x1", config.xOffset)
    .attr("x2", config.xOffset)
    .attr("y1", config.yOffset)
    .attr("y2", config.yOffset);

  const group = svg
    .selectAll<SVGElement, GraphNode>(".group")
    .data(graph.nodes)
    .join("g")
    .classed("group", true)
    .classed("wanted", (d: GraphNode) => d.wanted)
    .classed("fixed", (d: GraphNode) => d.fx !== undefined)
    .classed("hideLabel", (d: GraphNode) => !d.showLabel)
    .attr("class", function (d: GraphNode) {
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
    .text((d: GraphNode) => d.id);

  const anchor = group.append("a").attr("href", (d: GraphNode) => `/${d.id}`);

  anchor
    .append("text")
    .on("mouseover", onNodeMouseOver)
    .on("mouseleave", onNodeMouseLeave)
    .text((d: GraphNode) => d.title)
    .attr("x", config.xOffsetText)
    .attr("y", config.yOffsetText)
    .classed("label", true)
    .append("text");

  anchor
    .filter((d: GraphNode) => d.showLabel && !!d.context)
    .append("text")
    .attr("x", config.xOffsetText)
    .attr(
      "y",
      (d: GraphNode) =>
        config.yOffsetText -
        ((depth) => (depth == 0 ? 40 : depth == 1 ? 30 : depth == 2 ? 15 : 10))(
          d.depth
        )
    )
    .text((d: GraphNode) => d.context || "n/a")
    .classed("context-label", true);
};

const newTick =
  (
    svg: Selection<null, unknown, null, undefined>,
    xOffset: number,
    yOffset: number
  ) =>
  () => {
    if (Math.random() > 0.8) {
      return;
    }
    svg
      .selectAll<SVGLineElement, NodeLink>(".link")
      .attr("x1", (d) => ((d.source as GraphNode).x ?? 0) + xOffset)
      .attr("y1", (d) => ((d.source as GraphNode).y ?? 0) + yOffset)
      .attr("x2", (d) => ((d.target as GraphNode).x ?? 0) + xOffset)
      .attr("y2", (d) => ((d.target as GraphNode).y ?? 0) + yOffset);
    svg
      .selectAll<SVGElement, GraphNode>(".group")
      .attr(
        "transform",
        (d: GraphNode) =>
          "translate(" +
          (xOffset + (d?.x ?? 0)) +
          "," +
          (yOffset + (d?.y ?? 0)) +
          ")"
      );
  };

const applySimulation = (
  config: GraphConfiguration,
  graph: Graph,
  svg: Selection<null, unknown, null, undefined>
): GardenSimulation => {
  const tick = newTick(svg, config.xOffset, config.yOffset);

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
      d3
        .forceLink<GraphNode, NodeLink>(graph.links)
        .id((d: GraphNode) => d.id)
        .strength(config.getLinkForce(config.linkForceFactor))
    )
    .tick(50)
    .alpha(1)
    .alphaMin(0.02)
    .alphaDecay(0.01)
    .on("tick", tick)
    .on("end", tick);

  function click(
    this: SVGElement,
    event: { currentTarget: never },
    d: GraphNode
  ): void {
    delete d.fx;
    delete d.fy;
    d3.select(event.currentTarget).classed("fixed", false);
    simulation.alpha(0).restart();
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
    .drag<SVGElement, GraphNode, never>()
    .on("start", dragstart)
    .on("drag", dragged);

  svg.selectAll<SVGElement, GraphNode>(".group").call(drag).on("click", click);

  return simulation as GardenSimulation;
};

const renderGraph = (
  start: string,
  data: Things,
  depth: number,
  config: GraphConfiguration,
  svg: Selection<null, unknown, null, undefined>
) => {
  const graph = createGraph(start, data, findDeepLinks(data, start, depth));

  update(config, graph, svg);
  return applySimulation(config, graph, svg);
};

export default renderGraph;
