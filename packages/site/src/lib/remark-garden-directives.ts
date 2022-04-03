import { h } from "hastscript";
import { Root } from "mdast";
import { visit } from "unist-util-visit";

export function remarkGardenDirectives() {
  return (tree: Root) => {
    visit(tree, (node) => {
      if (node.type === "containerDirective") {
        const data = node.data || (node.data = {});
        const tagName = "div";
        data.hName = tagName;
        data.hProperties = h(tagName, {
          class: "container-directive",
        }).properties;
      }
    });
  };
}
