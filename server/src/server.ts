import { ApolloServer } from "apollo-server";
import { PrismaClient } from "@prisma/client";
import { resolvers } from "./resolver";

const typeDefs = `
  """
  商品。だがし。
  """
  type Product {
    id: ID!
    name: String!
    imageURL: String!
    description: String!
    price: Int!
    reviews: [Review!]!
  }

  """
  商品のレビュー
  """
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
    "商品の全件取得"
    products: [Product!]!

    "IDを指定した商品単品取得"
    product(id: ID!): Product
  }

  type Mutation {
    "指定した商品にレビューを追加する"
    addReview(productId: ID!, addReviewInput: AddReviewInput!): Review
  }
`;

const server = new ApolloServer({
  typeDefs,
  cors: true,
  context() {
    const prismaClient = new PrismaClient({
      log: ["query", "info", "warn", "error"]
    });
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
