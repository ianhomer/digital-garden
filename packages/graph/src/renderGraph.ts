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
  svg: Selection<null, unknown, null, undefined>,
  simulation: GardenSimulation,
  start: string,
  data: Things,
  depth: number,
  updateEvent: (
    this: HTMLAnchorElement,
    event: { currentTarget: never },
    d: GraphNode
  ) => void,
  firstTime = true
) => {
  const graph = createGraph(start, data, findDeepLinks(data, start, depth));

  svg
    .selectAll<SVGLineElement, NodeLink>(".link")
    .data(graph.links, (d: NodeLink) => `${d.source}|${d.target}`)
    .join(
      (entry) =>
        entry
          .append("line")
          .attr("class", (d: NodeLink) => `link ${d.type} depth-${d.depth}`)
          .attr("x1", config.xOffset)
          .attr("x2", config.xOffset)
          .attr("y1", config.yOffset)
          .attr("y2", config.yOffset)
          .lower(),
      (update) =>
        update
          .attr("class", (d: NodeLink) => `link ${d.type} depth-${d.depth}`)
          .lower(),
      (exit) => exit.remove()
    );

  svg
    .selectAll<SVGElement, GraphNode>(".group")
    .data(graph.nodes, (d: GraphNode) => d.id)
    .join(
      (entry) => {
        const group = entry
          .append("g")
          .attr("class", function (d: GraphNode) {
            return `depth-${d.depth}`;
          })
          .classed("group", true)
          .classed("wanted", (d: GraphNode) => d.wanted)
          .classed("fixed", (d: GraphNode) => d.fx !== undefined)
          .classed("hideLabel", (d: GraphNode) => !d.showLabel)
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

        const anchor = group.append("a").on("click", updateEvent);
        // .attr("href", (d: GraphNode) => `/${d.id}`);

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
              ((depth) =>
                depth == 0 ? 40 : depth == 1 ? 30 : depth == 2 ? 15 : 10)(
                d.depth
              )
          )
          .text((d: GraphNode) => d.context || "n/a")
          .classed("context-label", true);

        return group;
      },
      (update) => {
        update
          .classed("hideLabel", (d: GraphNode) => !d.showLabel)
          .classed("depth-0", (d: GraphNode) => d.depth == 0)
          .classed("depth-1", (d: GraphNode) => d.depth == 1)
          .classed("depth-2", (d: GraphNode) => d.depth == 2)
          .classed("depth-3", (d: GraphNode) => d.depth == 3)
          .classed("fixed", (d: GraphNode) => d.fx !== undefined)
          .attr("data-depth", (d: GraphNode) => d.depth)
          .attr("data-start", start)
          .attr("data-fx", (d: GraphNode) => d.fx ?? -1)
          .select("circle")
          .attr("r", config.getRadius);
        return update;
      },
      function (exit) {
        exit.selectChildren().remove();
        exit.remove();
        return exit;
      }
    );

  svg.selectAll<SVGElement, GraphNode>(".group");

  return applySimulation(config, graph, svg, simulation, firstTime);
};

const newTick =
  (
    svg: Selection<null, unknown, null, undefined>,
    xOffset: number,
    yOffset: number
  ) =>
  () => {
    svg
      .selectAll<SVGLineElement, NodeLink>(".link")
      .attr("x1", (d) => ((d?.source as GraphNode)?.x ?? 0) + xOffset)
      .attr("y1", (d) => ((d?.source as GraphNode)?.y ?? 0) + yOffset)
      .attr("x2", (d) => ((d?.target as GraphNode)?.x ?? 0) + xOffset)
      .attr("y2", (d) => ((d?.target as GraphNode)?.y ?? 0) + yOffset);
    svg
      .selectAll<SVGElement, GraphNode>(".group")
      .attr("transform", (d: GraphNode) => {
        // console.log(d.id);
        return (
          "translate(" +
          (xOffset + (d?.x ?? 0)) +
          "," +
          (yOffset + (d?.y ?? 0)) +
          ")"
        );
      });
  };

const createSimulation = (
  config: GraphConfiguration,
  svg: Selection<null, unknown, null, undefined>
): GardenSimulation => {
  const tick = newTick(svg, config.xOffset, config.yOffset);
  return d3
    .forceSimulation()
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
    .tick(50)
    .alpha(1)
    .alphaMin(0.02)
    .alphaDecay(0.05)
    .on("tick", tick);
};

const applySimulation = (
  config: GraphConfiguration,
  graph: Graph,
  svg: Selection<null, unknown, null, undefined>,
  simulation: GardenSimulation,
  firstTime: boolean
) => {
  simulation.nodes(graph.nodes);
  simulation.force(
    "link",
    d3
      .forceLink<GraphNode, NodeLink>(graph.links)
      .id((d: GraphNode) => d.id)
      .strength(config.getLinkForce(config.linkForceFactor))
  );

  if (!firstTime) {
    // hack - delay restart otherwise simulation doesn't apply. Not sure why.
    setTimeout(() => simulation.alpha(1).restart(), 10);
  }

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
    d3.select(this)
      .attr("data-fx", event.subject.fx)
      .attr("data-fy", event.subject.fy);
    simulation.alpha(1).restart();
  }

  const drag = d3
    .drag<SVGElement, GraphNode, never>()
    .on("start", dragstart)
    .on("drag", dragged);

  svg.selectAll<SVGElement, GraphNode>(".group").call(drag).on("click", click);
};

const renderGraph = (
  start: string,
  data: Things,
  depth: number,
  config: GraphConfiguration,
  svg: Selection<null, unknown, null, undefined>,
  callback = (name: string) => {
    console.log(`Linked to ${name}`);
  }
) => {
  const simulation = createSimulation(config, svg);
  function updateEvent(
    this: HTMLAnchorElement,
    event: { currentTarget: never },
    d: GraphNode
  ): void {
    console.log(`Updating with ${JSON.stringify(d)}`);
    callback(d.id);
    update(config, svg, simulation, d.id, data, depth, updateEvent, false);
  }

  update(config, svg, simulation, start, data, depth, updateEvent);
  return simulation;
};

export default renderGraph;
