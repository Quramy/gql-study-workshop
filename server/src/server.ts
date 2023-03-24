import { setTimeout } from "timers/promises";
import { v4 as uuid } from "uuid";
import { ApolloServer } from "apollo-server";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { PrismaClient } from "@prisma/client";
import { PrismaSelect } from "@paljs/plugins";
import { IResolvers } from "@graphql-tools/utils";

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
    commentBody: String!
    star: Int
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

    "指定したレビューを削除する"
    deleteReview(reviewId: ID!): ID

    "レビューの Star 数 を増やす"
    incrementReviewStars(reviewId: ID!): Review
  }
`;

const resolvers: IResolvers<any, { readonly prismaClient: PrismaClient }> = {
  Query: {
    product(_root, { id }: { readonly id: string }, ctx, info) {
      const select = new PrismaSelect(info as any);
      return ctx.prismaClient.product.findUnique({
        ...select.value,
        where: {
          id,
        },
      });
    },
    products(_root, _args, ctx, info) {
      const select = new PrismaSelect(info as any);
      return ctx.prismaClient.product.findMany({
        ...select.value,
      });
    },
  },
  Mutation: {
    async addReview(
      _root,
      {
        productId,
        addReviewInput: { commentBody, star = 0 },
      }: {
        readonly productId: string;
        readonly addReviewInput: {
          readonly commentBody: string;
          readonly star?: number;
        };
      },
      ctx
    ) {
      if (productId.indexOf("003") !== -1) {
        await setTimeout(1000);
      }
      const product = await ctx.prismaClient.product.findUnique({
        where: {
          id: productId,
        },
      });
      if (!product) return null;
      const review = await ctx.prismaClient.review.create({
        data: {
          id: uuid(),
          commentBody,
          star,
          productId,
        },
      });
      return review;
    },
    async deleteReview(
      _root,
      { reviewId }: { readonly reviewId: string },
      ctx
    ) {
      await ctx.prismaClient.review.delete({
        where: {
          id: reviewId,
        },
      });
      return reviewId;
    },
    async incrementReviewStars(
      _root,
      { reviewId }: { readonly reviewId: string },
      ctx
    ) {
      const review = await ctx.prismaClient.review.findUnique({
        where: {
          id: reviewId,
        },
      });
      if (!review) return null;
      await ctx.prismaClient.review.update({
        where: {
          id: reviewId,
        },
        data: {
          ...review,
          star: review.star + 1,
        },
      });
      return {
        ...review,
        star: review.star + 1,
      };
    },
  },
};

const prismaClient = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

const server = new ApolloServer({
  cors: true,
  context() {
    return {
      prismaClient,
    };
  },
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
});

const port = parseInt(process.env.PORT ?? "4010", 10);

server.listen({ port }).then(() => {
  console.log(`GraphQL server is litening on ${port}.`);
  console.log(`Open http://localhost:${port}/graphql`);
});
