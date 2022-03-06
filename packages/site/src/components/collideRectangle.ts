import { SimulationNodeDatum } from "d3-force";
import { quadtree } from "d3-quadtree";

function x(d: SimulationNodeDatum) {
  return d.x + d.vx;
}

function y(d: SimulationNodeDatum) {
  return d.y + d.vy;
}

// box is [x,y,width,height]
function apply(d: SimulationNodeDatum, box: number[]) {
  return (quad: { data: SimulationNodeDatum }) => {
    if (quad.data && quad.data != d) {
      const x = d.x - quad.data.x;
      const y = d.y - quad.data.y;
      const absX = Math.abs(x);
      const absY = Math.abs(y);

      // Adjust nodes after collision
      if (absX < 100 && absY < 30) {
        d.x -= x;
        d.y -= y;
        quad.data.x += x;
        quad.data.y += y;
        return true;
      }
    }
    return false;
  };
}

export default function (box: number[]) {
  let nodes: SimulationNodeDatum[];
  function force() {
    const tree = quadtree(nodes, x, y);

    for (const d of nodes) {
      tree.visit(apply(d, box));
    }
  }
  force.initialize = (_: SimulationNodeDatum[]) => (nodes = _);
  return force;
}
