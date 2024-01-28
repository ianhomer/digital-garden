import { createGarden, getPageItems } from "@garden/garden";
import { Nameable } from "@garden/types";
import { makeExecutableSchema } from "@graphql-tools/schema";

import config from "./garden-config";

const garden = createGarden(config);

const findItems = async (): Promise<Nameable[]> => {
  const things = await garden.load();
  return getPageItems(garden.repository, things);
};

const typeDefinitions = `
    type Query {
      content: [Item]
    }

    type Item {
      name: String
    }
  `;

const resolvers = {
  Query: {
    content: () => findItems(),
  },
};

export const schema = makeExecutableSchema({
  resolvers: [resolvers],
  typeDefs: [typeDefinitions],
});
