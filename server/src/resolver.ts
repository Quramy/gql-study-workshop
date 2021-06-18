import { v4 as uuid } from "uuid";
import { IResolvers } from "apollo-server";

import type { PrismaClient, Product } from "@prisma/client";
import { PrismaSelect } from "@paljs/plugins";

export const resolvers: IResolvers<
  any,
  { readonly prismaClient: PrismaClient }
> = {
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
