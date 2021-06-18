import { v4 as uuid } from "uuid";
import { PrismaClient, Product, Review } from "@prisma/client";
const prisma = new PrismaClient();

async function deleteAll() {
  const deleteReviews = prisma.review.deleteMany();
  const deleteProducs = prisma.product.deleteMany();
  await prisma.$transaction([deleteReviews, deleteProducs]);
}

async function createSeed() {
  const producs: Product[] = [
    {
      id: "001",
      name: "うまいバー",
      imageURL: "",
      price: 30
    },
    {
      id: "002",
      name: "やっちゃんイカ",
      imageURL: "",
      price: 30
    },
    {
      id: "003",
      name: "ブラックダンサー",
      imageURL: "",
      price: 30
    }
  ];

  for (const data of producs) {
    await prisma.product.create({ data });
  }

  const reviews: Review[] = [
    {
      id: "aa906a86-0085-463a-a6e8-de3c3867e870",
      commentBody: "めんたい味こそ至高",
      star: 3,
      productId: "001"
    }
  ];

  for (const data of reviews) {
    const { productId, ...rest } = data;
    await prisma.review.create({
      data: {
        ...rest,
        product: {
          connect: {
            id: productId!
          }
        }
      }
    });
  }
}

async function main() {
  try {
    await deleteAll();
    await createSeed();
    await prisma.$disconnect();
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
