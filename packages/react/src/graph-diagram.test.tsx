import "@testing-library/jest-dom";

import { Things } from "@garden/types";
import { render, screen } from "@testing-library/react";

import GraphDiagram from "./graph-diagram";

describe("graph diagram", () => {
  it("should render OK", async () => {
    const data: Things = { root: { title: "root", links: [] } };
    render(
      <GraphDiagram
        data={data}
        depth={3}
        height={400}
        scale={1}
        start={"root"}
        width={400}
      />
    );

    expect(screen.findByRole("figure")).toBeDefined();
  });
});
