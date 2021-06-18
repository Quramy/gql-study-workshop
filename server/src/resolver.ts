import { v4 as uuid } from "uuid";
import type { PrismaClient, Product } from "@prisma/client";
import { IResolvers } from "apollo-server";

export const resolvers: IResolvers<
  any,
  { readonly prismaClient: PrismaClient }
> = {
  Product: {
    reviews(parent: Product, _args, ctx) {
      return ctx.prismaClient.product
        .findUnique({
          where: {
            id: parent.id
          }
        })
        .reviews();
    }
  },
  Query: {
    async product(_root, { id }: { readonly id: string }, ctx) {
      return ctx.prismaClient.product.findUnique({
        where: {
          id
        }
      });
    },
    products(_root, _args, ctx) {
      return ctx.prismaClient.product.findMany();
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
