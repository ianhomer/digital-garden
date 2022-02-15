import dotenv from "dotenv";
import { join } from "path";
dotenv.config();

function resolveDirectory() {
  if (process.env.GARDENS_DIRECTORY) {
    return join(process.cwd(), process.env.GARDENS_DIRECTORY);
  }
  return join(process.cwd(), "gardens");
}

export default {
  gardens: {
    boxofjam: "https://github.com/purplepip/boxofjam.git",
  },
  directory: resolveDirectory(),
};
