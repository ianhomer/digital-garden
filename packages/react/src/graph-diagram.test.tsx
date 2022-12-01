import "@testing-library/jest-dom";

import { Things } from "@garden/types";
import { render, screen } from "@testing-library/react";

import GraphDiagram from "./graph-diagram";

describe("graph diagram", () => {
  it("should render OK", async () => {
    const data: Things = {
      foo: { title: "foo", links: [{ name: "bar" }] },
      bar: { title: "bar", links: [] },
    };
    render(
      <GraphDiagram
        data={data}
        height={800}
        scale={1}
        start={"foo"}
        width={800}
      />
    );

    const svg = await screen.findByRole("figure");
    expect(svg).toBeDefined();
    const fooNode = await screen.findAllByText("foo");
    expect(fooNode).toBeDefined();
    expect(fooNode).toHaveLength(2);
    const nodes = svg.getElementsByTagName("circle");
    expect(nodes).toHaveLength(2);
    const links = svg.getElementsByTagName("line");
    expect(links).toHaveLength(1);
  });
});
