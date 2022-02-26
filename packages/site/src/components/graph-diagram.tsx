import { useRef } from "react";

import { Graph } from "../types/graph";

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

  return (
    <>
      Test
      <svg ref={ref} className={props.className ?? "fullscreen"} />
    </>
  );
}
