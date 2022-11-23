import {
  defaultConfiguration,
  Graph,
  GraphConfiguration,
  renderGraph,
} from "@garden/graph";
import * as d3 from "d3";
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

export default function GraphDiagram({
  graph,
  width,
  height,
  scale,
}: GraphDiagramProps) {
  const ref = useRef(null);

  const viewHeight = height * scale;
  const viewWidth = width * scale;

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.attr("viewBox", `0 0 ${viewWidth} ${viewHeight}`);
  }, [width, height, scale]);

  useEffect(() => {
    const svg = d3.select(ref.current);
    const graphConfiguration: GraphConfiguration = defaultConfiguration({
      viewWidth,
      viewHeight,
    });

    renderGraph(graph, graphConfiguration, svg);
  }, [width, height, graph]);

  return (
    <>
      <svg ref={ref} />
    </>
  );
}
