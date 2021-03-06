import { quadtree } from "d3-quadtree";

import { Node } from "../lib/graph/types";

function x(d: Node) {
  return d.x + d.vx;
}

function y(d: Node) {
  return d.y + d.vy;
}

function xCenterOfBox(d: Node, box: number[]) {
  return d.x + box[0] + box[2] / 2;
}

function yCenterOfBox(d: Node, box: number[]) {
  return d.y + box[1] + box[3] / 2;
}

// box is [x,y,width,height]
function apply(d: Node, box: number[]) {
  const strength = 0.6;
  return (quad: { data: Node }) => {
    if (!quad.data) {
      return;
    }
    if (quad.data.index <= d.index) {
      // only apply force between 2 nodes once
      return;
    }
    const quadDataXCenter = xCenterOfBox(quad.data, box);
    const quadDataYCenter = yCenterOfBox(quad.data, box);
    const dXCenter = xCenterOfBox(d, box);
    const dYCenter = yCenterOfBox(d, box);

    const xDistance = dXCenter - quadDataXCenter;
    const yDistance = dYCenter - quadDataYCenter;
    const absX = Math.abs(xDistance);
    const absY = Math.abs(yDistance);
    const overlapX = absX - box[2] + d.depth * 15;
    const overlapY = absY - box[3] + d.depth * 15;

    // Adjust nodes after collision
    if (overlapX < 0 && overlapY < 0) {
      const distance = Math.sqrt(xDistance * xDistance + yDistance * yDistance);

      if (Math.abs(overlapY) < Math.abs(overlapX)) {
        // Move nodes vertically
        const delta = (strength * yDistance * overlapY) / distance;
        d.vy -= delta;
        quad.data.vy += delta;
      } else {
        // Move nodes horizontally
        const delta = (strength * xDistance * overlapX) / distance;
        d.vx -= delta;
        quad.data.vx += delta;
      }
      return true;
    }
  };
}

export default function (box: number[]) {
  let nodes: Node[];
  let iterations = 1;
  function force() {
    const tree = quadtree(nodes, x, y);

    // When iterations set then we automatically run given number of iterations
    for (let k = 0; k < iterations; ++k) {
      for (const d of nodes) {
        if (d.showLabel) {
          tree.visit(apply(d, box));
        }
      }
    }
  }
  force.iterations = function (_: string | number) {
    return arguments.length ? ((iterations = +_), force) : iterations;
  };

  force.initialize = (_: Node[]) => (nodes = _);
  return force;
}
