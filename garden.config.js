import { join } from "path";
require("dotenv").config();

function resolveDirectory() {
  if (process.env.GARDENS_DIRECTORY) {
    return join(process.cwd(), process.env.GARDENS_DIRECTORY);
  }
  return join(process.cwd(), "gardens");
}

module.exports = {
  gardens: {
    boxofjam: "https://github.com/purplepip/boxofjam.git",
  },
  directory: resolveDirectory(),
};
