import "@testing-library/jest-dom";

import { findAllByText, waitFor } from "@testing-library/dom";
import { JSDOM } from "jsdom";
import path from "path";

describe("standalone linkmap", () => {
  it("should render OK from bundled package", async () => {
    await JSDOM.fromFile(path.join(__dirname, "index.html"), {
      resources: "usable",
      runScripts: "dangerously",
    }).then(async (dom) => {
      await waitFor(
        async () => {
          const fooNode = await findAllByText(dom.window.document.body, "foo");
          expect(fooNode).toBeDefined();
        },
        { timeout: 3000 },
      ).catch((error) => {
        console.log(error, dom.serialize());
        throw error;
      });
    });
  });
});
