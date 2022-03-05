import { SimulationNodeDatum } from "d3-force";

export default function () {
  let nodes: SimulationNodeDatum[];
  function force() {
    for (const d of nodes) {
      console.log(d);
    }
  }
  force.initialize = (_: SimulationNodeDatum[]) => (nodes = _);
  return force;
}
