import { SimulationNodeDatum } from "d3-force";
import { quadtree } from "d3-quadtree";

function x(d: SimulationNodeDatum) {
  return d.x + d.vx;
}

function y(d: SimulationNodeDatum) {
  return d.y + d.vy;
}

function apply(d: SimulationNodeDatum) {
  return (quad: { data: SimulationNodeDatum }) => {
    if (quad.data && quad.data != d) {
      const x = d.x - quad.data.x;
      const y = d.y - quad.data.y;
      const absX = Math.abs(x);
      const absY = Math.abs(y);

      if (absX < 10 && absY < 60) {
        console.log("collide");
      }
    }
  };
}

export default function () {
  let nodes: SimulationNodeDatum[];
  function force() {
    const tree = quadtree(nodes, x, y);

    for (const d of nodes) {
      tree.visit(apply(d));
    }
  }
  force.initialize = (_: SimulationNodeDatum[]) => (nodes = _);
  return force;
}
