import { parse } from "./markdown";
import { Thing } from "./thing";

it("should parse OK", () => {
  const tree = parse({
    name: "my-name",
    content: () => "# My Name",
  });

  expect(tree.type).toBe("root");
  expect(tree.children[0].type).toBe("heading");
});
