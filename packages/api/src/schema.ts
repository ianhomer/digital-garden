import { createSchema } from "graphql-yoga";

const content = () => {};

export const schema = createSchema({
  typeDefs: `
    type Query {
      content: Content[]
    }

    type Content {
      name: String
    }
  `,
  resolvers: {
    Query: {
      content: () => content(),
    },
  },
});
