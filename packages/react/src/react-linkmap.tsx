import { Items } from "@garden/graph";
import {
  defaultConfiguration,
  GardenSimulation,
  GraphConfiguration,
  render,
} from "@garden/linkmap";
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

interface LinkMapProps {
  width: number;
  height: number;
  scale: number;
  start: string;
  data: Items;
  callback?: (name: string, event: MouseEvent) => void;
}

LinkMap.defaultProps = {
  className: "fullscreen",
};

export default function LinkMap({
  data,
  height,
  scale,
  start,
  width,
  callback = (name: string, event: MouseEvent) => {
    console.log(`Linked to ${name} : ${event}`);
  },
}: LinkMapProps) {
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
      simulation.stop();
    }
    const svg = d3.select<d3.BaseType, null>(ref.current);
    const graphConfiguration: GraphConfiguration = defaultConfiguration({
      viewWidth,
      viewHeight,
    });

    setSimulation(render(start, data, graphConfiguration, svg, callback));
  }, [width, height, data]);

  return (
    <>
      <svg role="figure" ref={ref} />
    </>
  );
}
