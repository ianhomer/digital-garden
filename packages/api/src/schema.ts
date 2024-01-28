import { createSchema } from "graphql-yoga";

export const schema = createSchema({
  typeDefs: `
    type Query {
      hello: String
    }
  `,
  resolvers: {
    Query: {
      hello: () => "world",
    },
  },
});
