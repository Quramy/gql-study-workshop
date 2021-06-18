import { ApolloServer } from "apollo-server";
import { PrismaClient } from "@prisma/client";
import { resolvers } from "./resolver";

const typeDefs = `
  type Product {
    id: ID!
    name: String!
    imageURL: String!
    description: String!
    price: Int!
    reviews: [Review!]!
  }

  type Review {
    id: ID!
    star: Int!
    commentBody: String!
  }

  input AddReviewInput {
    star: Int!
    commentBody: String!
  }


  type Query {
    products: [Product]!
    product(id: ID!): Product
  }

  type Mutation {
    addReview(productId: ID!, addReviewInput: AddReviewInput!): Review
  }

`;

const server = new ApolloServer({
  typeDefs,
  cors: true,
  context() {
    const prismaClient = new PrismaClient();
    return {
      prismaClient
    };
  },
  resolvers
  // mocks: {},
});

const port = parseInt(process.env.PORT ?? "4010", 10);

server.listen({ port }).then(() => {
  console.log(`GraphQL server is litening on ${port}.`);
  console.log(`Open http://localhost:${port}/graphql`);
});
