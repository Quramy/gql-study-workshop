import { v4 as uuid } from "uuid";
import { ApolloServer, IResolvers } from "apollo-server";
import { PrismaClient } from "@prisma/client";
import { PrismaSelect } from "@paljs/plugins";

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

const resolvers: IResolvers<any, { readonly prismaClient: PrismaClient }> = {
  Query: {
    product(_root, { id }: { readonly id: string }, ctx, info) {
      const select = new PrismaSelect(info);
      return ctx.prismaClient.product.findUnique({
        ...select.value,
        where: {
          id
        }
      });
    },
    products(_root, _args, ctx, info) {
      const select = new PrismaSelect(info);
      return ctx.prismaClient.product.findMany({
        ...select.value
      });
    }
  },
  Mutation: {
    async addReview(
      _root,
      {
        productId,
        addReviewInput
      }: {
        readonly productId: string;
        readonly addReviewInput: {
          readonly commentBody: string;
          readonly star: number;
        };
      },
      ctx
    ) {
      const product = await ctx.prismaClient.product.findUnique({
        where: {
          id: productId
        }
      });
      if (!product) return null;
      const review = await ctx.prismaClient.review.create({
        data: {
          id: uuid(),
          ...addReviewInput,
          productId
        }
      });
      return review;
    }
  }
};

const server = new ApolloServer({
  cors: true,
  context() {
    const prismaClient = new PrismaClient({
      log: ["query", "info", "warn", "error"]
    });
    return {
      prismaClient
    };
  },
  typeDefs,
  resolvers
});

const port = parseInt(process.env.PORT ?? "4010", 10);

server.listen({ port }).then(() => {
  console.log(`GraphQL server is litening on ${port}.`);
  console.log(`Open http://localhost:${port}/graphql`);
});
