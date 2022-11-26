import {
  defaultConfiguration,
  GardenSimulation,
  GraphConfiguration,
  renderGraph,
} from "@garden/graph";
import { Things } from "@garden/types";
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

interface GraphDiagramProps {
  width: number;
  height: number;
  scale: number;
  start: string;
  depth: number;
  data: Things;
}

GraphDiagram.defaultProps = {
  className: "fullscreen",
};

export default function GraphDiagram({
  data,
  depth,
  height,
  scale,
  start,
  width,
}: GraphDiagramProps) {
  const ref = useRef(null);
  const [simulation, setSimulation] = useState<GardenSimulation | null>(null);

  const viewHeight = height * scale;
  const viewWidth = width * scale;

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.attr("viewBox", `0 0 ${viewWidth} ${viewHeight}`);
  }, [width, height, scale]);

  useEffect(() => {
    if (simulation) {
      console.log("Stopping previous simulation");
      simulation.stop();
    }
    const svg = d3.select(ref.current);
    const graphConfiguration: GraphConfiguration = defaultConfiguration({
      viewWidth,
      viewHeight,
    });

    setSimulation(renderGraph(start, data, depth, graphConfiguration, svg));
  }, [width, height, data]);

  return (
    <>
      <svg ref={ref} />
    </>
  );
}
