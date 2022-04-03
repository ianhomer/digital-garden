import { h } from "hastscript";
import { Root } from "mdast";
import { visit } from "unist-util-visit";

export function remarkGardenDirectives() {
  return (tree: Root) => {
    visit(tree, (node) => {
      console.log(node.type);
      if (node.type === "containerDirective") {
        console.log(node);
        const data = node.data || (node.data = {});
        const tagName = "div";
        data.hName = tagName;
        data.hProperties = h(tagName, {
          class: "container-directive container-directive-info",
        }).properties;
        console.log(data);
      }
    });
  };
}
