import { v4 as uuid } from "uuid";
import type { PrismaClient, Product } from "@prisma/client";
import { IResolvers } from "apollo-server";

export const resolvers: IResolvers<
  any,
  { readonly prismaClient: PrismaClient }
> = {
  Product: {
    async reviews(parent: Product, _args, ctx) {
      const reviews = await ctx.prismaClient.review.findMany({
        where: {
          product: parent
        }
      });
      return reviews;
    }
  },
  Query: {
    async product(_root, { id }: { readonly id: string }, ctx) {
      const product = await ctx.prismaClient.product.findFirst({
        where: {
          id
        }
      });
      return product;
    },
    async products(_root, _args, ctx) {
      const products = await ctx.prismaClient.product.findMany();
      return products;
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
      const product = await ctx.prismaClient.product.findFirst({
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
