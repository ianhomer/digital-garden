import { parse, process } from "./markdown";
import { Thing } from "./thing";

it("should parse OK", () => {
  const tree = parse({
    name: "my-name",
    content: () => "# My Name",
  });

  expect(tree.type).toBe("root");
  expect(tree.children[0].type).toBe("heading");
});

it("should process OK", () => {
  const meta = process({
    name: "my-name",
    content: () => "# My [[link]]",
  });

  expect(meta.name).toBe("my-name");
  expect(meta.links[0].to).toBe("link");
});
