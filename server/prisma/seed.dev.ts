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
      description:
        "なっとう味、めんたい味など種類が豊富でユニークなフレーバー（味）があり、これまで40種類程度が発売された。\n値段も安価なことから子供や若者を中心に人気のある駄菓子である。",
      imageURL:
        "https://fakeimg.pl/350x200/?text=%E3%81%86%E3%81%BE%E3%81%84%E3%83%90%E3%83%BC&font=noto",
      price: 10
    },
    {
      id: "002",
      name: "やっちゃんイカ",
      description:
        "やっちゃんイカと呼ばれることが多いが、原材料はイカだけではないため現在の正式名称は「カットやっちゃん」シリーズの展開である。",
      imageURL:
        "https://fakeimg.pl/350x200/?text=%E3%82%84%E3%81%A3%E3%81%A1%E3%82%83%E3%82%93&font=noto",
      price: 50
    },
    {
      id: "003",
      name: "ブラックダンサー",
      description: "おいしさイナズマ級！\n若い女性に大ヒット中！",
      imageURL:
        "https://fakeimg.pl/350x200/?text=%E9%BB%92%E3%81%A0%E3%82%93%E3%81%95%E3%83%BC&font=noto",
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
