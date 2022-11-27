import { Things } from "@garden/types";
import { findAllByText } from "@testing-library/dom";
import * as d3 from "d3";
import { BaseType } from "d3";

import defaultConfiguration from "./default-configuration";
import renderGraph from "./render-graph";
import { GraphConfiguration } from "./types";

describe("render graph", () => {
  it("should render OK", async () => {
    const data: Things = {
      foo: { title: "foo", links: [{ name: "bar" }] },
      bar: { title: "bar", links: [] },
    };

    const graphConfiguration: GraphConfiguration = defaultConfiguration({
      viewWidth: 400,
      viewHeight: 400,
    });

    const container = document.createElement("svg");
    const svg = d3.select(container.getRootNode() as BaseType);

    renderGraph("foo", data, 3, graphConfiguration, svg);

    const fooNode = await findAllByText(container, "foo");
    expect(fooNode).toBeDefined();
    expect(fooNode).toHaveLength(2);

    const nodes = container.getElementsByTagName("circle");
    expect(nodes).toHaveLength(2);
    const links = container.getElementsByTagName("line");
    expect(links).toHaveLength(1);
  });
});
