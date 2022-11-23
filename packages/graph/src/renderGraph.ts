import * as d3 from "d3";
import { Selection } from "d3";

import collideRectangle from "./collideRectangle";
import { Graph, GraphConfiguration, Node, NodeLink } from "./types";

const renderGraph = (
  graph: Graph,
  config: GraphConfiguration,
  svg: Selection<null, unknown, null, undefined>
) => {
  svg.selectAll("svg > *").remove();

  const link = svg
    .selectAll<SVGLineElement, NodeLink>(".link")
    .data(graph.links)
    .join("line")
    .attr("class", (d: NodeLink) => `link ${d.type}`)
    .attr("x1", config.xOffset)
    .attr("x2", config.xOffset)
    .attr("y1", config.yOffset)
    .attr("y2", config.yOffset)
    .attr("stroke-width", config.getLinkStrokeWidth);

  const group = svg
    .selectAll<SVGElement, Node>(".group")
    .data(graph.nodes)
    .join("g")
    .classed("group", true)
    .classed("wanted", (d: Node) => d.wanted)
    .classed("fixed", (d: Node) => d.fx !== undefined)
    .attr("transform", `translate(${config.xOffset},${config.yOffset})`)
    .raise();

  group
    .append("circle")
    .attr("r", config.getRadius)
    .classed("node", true)
    .append("title")
    .text((d: Node) => d.id);

  const anchor = group.append("a").attr("href", (d: Node) => `/${d.id}`);

  anchor
    .filter((d: Node) => d.showLabel)
    .append("text")
    .text((d: Node) => d.title)
    .attr("x", config.xOffsetText)
    .attr("y", config.yOffsetText)
    .attr("class", (d: Node) => `depth-${d.depth}`)
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