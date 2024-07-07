import { hash, Items, ItemType, LinkType } from "@garden/graph";
import { findAllByText } from "@testing-library/dom";
import * as d3 from "d3";
import { BaseType } from "d3";

import defaultConfiguration from "./default-configuration";
import render from "./render";
import { GraphConfiguration } from "./types";

describe("render graph", () => {
  it("should render OK", async () => {
    const data: Items = {
      foo: {
        title: "foo",
        hash: hash("foo"),
        aliases: [],
        type: ItemType.Item,
        value: 0,
        links: [{ name: "bar", value: 1, type: LinkType.To }],
      },
      bar: {
        title: "bar",
        hash: hash("bar"),
        aliases: [],
        type: ItemType.Item,
        value: 0,
        links: [],
      },
    };

    const graphConfiguration: GraphConfiguration = defaultConfiguration({
      viewWidth: 800,
      viewHeight: 800,
    });

    const container = document.createElement("svg");
    const svg = d3.select<d3.BaseType, null>(
      container.getRootNode() as BaseType,
    );

    render("foo", data, graphConfiguration, svg);

    const fooNode = await findAllByText(container, "foo");
    expect(fooNode).toBeDefined();
    expect(fooNode).toHaveLength(2);

    const nodes = container.getElementsByTagName("circle");
    expect(nodes).toHaveLength(2);
    const links = container.getElementsByTagName("line");
    expect(links).toHaveLength(1);
  });
});
