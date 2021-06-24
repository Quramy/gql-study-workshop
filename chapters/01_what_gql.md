# Chapter 1. はじめての GraphQL

## ToC

- [はじめに](#%E3%81%AF%E3%81%98%E3%82%81%E3%81%AB)
- [触ってみよう](#%E8%A7%A6%E3%81%A3%E3%81%A6%E3%81%BF%E3%82%88%E3%81%86)
- [はじめての Query](#%E3%81%AF%E3%81%98%E3%82%81%E3%81%A6%E3%81%AE-query)
  - [取得するフィールドを追加する](#%E5%8F%96%E5%BE%97%E3%81%99%E3%82%8B%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E3%82%92%E8%BF%BD%E5%8A%A0%E3%81%99%E3%82%8B)
  - [ネストしたオブジェクトの取得](#%E3%83%8D%E3%82%B9%E3%83%88%E3%81%97%E3%81%9F%E3%82%AA%E3%83%96%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E3%81%AE%E5%8F%96%E5%BE%97)
- [Query と型](#query-%E3%81%A8%E5%9E%8B)
- [引数付きの Query](#%E5%BC%95%E6%95%B0%E4%BB%98%E3%81%8D%E3%81%AE-query)
  - [引数を変数化する](#%E5%BC%95%E6%95%B0%E3%82%92%E5%A4%89%E6%95%B0%E5%8C%96%E3%81%99%E3%82%8B)
  - [動的に Query を組み立ててはいけない](#%E5%8B%95%E7%9A%84%E3%81%AB-query-%E3%82%92%E7%B5%84%E3%81%BF%E7%AB%8B%E3%81%A6%E3%81%A6%E3%81%AF%E3%81%84%E3%81%91%E3%81%AA%E3%81%84)
- [Mutation でサーバーのデータを変更する](#mutation-%E3%81%A7%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E3%81%AE%E3%83%87%E3%83%BC%E3%82%BF%E3%82%92%E5%A4%89%E6%9B%B4%E3%81%99%E3%82%8B)

## はじめに

このワークショップの目的は参加者に React を使った GraphQL のフロントエンド開発を学んでもらうことです。

いきなりフロントエンドのコードを書く前に、まずは「GraphQL とはどういうものなのか」「どのようなことができるのか」の概要を知ってもらった方が良いと考え、この章を用意しました。GraphQL の概要をご存知の方は読み飛ばして構いません。

GraphQL は Facebook が 2012 年頃から開発を始めたクエリ言語です。2015 年にオープンソース化され、2018 年からは GraphQL Foundation という独立した組織でメンテナンスされるようになっています。

一貫した型システムやそれに付随する静的検証が言語仕様に組み込まれており、 JavaScript や Ruby, Java など様々なプログラミング言語で汎用的に API 通信が行えるように設計されています。

## 触ってみよう

能書きはこれくらいにしておき、実際に GraphQL でクエリを実行しながら見ていきましょう。

まずは GraphQL server を立ち上げてみましょう。本ワークショップでは実装済みの GraphQL Server を使います。

```sh
$ cd server
$ npm i
$ npm run seed
$ npm start
```

上記のコマンドが正常に実行されると、以下のアドレスにアクセスできるようになります:

http://localhost:4010/graphql

この画面は GraphQL プレイグラウンドと呼ばれます。

## はじめての Query

プレイグラウンドの左側はエディタになっています。このエディタ部分に以下のように書いてみて、実行ボタンをクリックしてください。

```graphql
query {
  products {
    id
    name
  }
}
```

商品のリストが `data` として取得できましたか？

### 取得するフィールドを追加する

```graphql
query {
  products {
    id
    name
    imageURL # <--- 追加
  }
}
```

### ネストしたオブジェクトの取得

```graphql
query {
  products {
    name
    reviews
  }
}
```

これはエラーになってしまいます。

以下の様に、 `reviews` に続けて `{ }` を記述し、その中にフィールド名を書いてから実行してみましょう。

```graphql
query {
  products {
    name
    reviews {
      # オブジェクトについては、下層のフィールド名をきちんと列挙する必要がある
      id
      commentBody
    }
  }
}
```

## Query と型

GraphQL は「どのような検索ができるか」「どのような更新をおこなえるか」について、静的な型と一緒に運用されます。

プレイグラウンドの右側から「Schema」をクリックしてみましょう。

この Server で提供されている GraphQL サービスのスキーマを観ることができます。

```graphql
type Query {
  products: [Product]!
  product(id: ID!): Product
}
```

```graphql
# 商品。だがし。
type Product {
  id: ID!
  name: String!
  imageURL: String!
  description: String!
  price: Int!
  reviews: [Review!]!
}

# 商品のレビュー
type Review {
  id: ID!
  star: Int!
  commentBody: String!
}
```

`Product` や `Review` など `type` というキーワードからはじまっている部分はタイプと呼ばれます（正確には "Output Type" だが、通常は「タイプ」と呼ばれることが多い）。type はフィールド名とそのフィールドの値の型で定義されるオブジェクトライクな構造を示しています。

先程ネストの例で見たように、フィールドの type がまた別の type を指すこともありますし、自己参照や循環参照することも許容されています。`Query` という名前の type は特殊な意味をもっており「このスキーマで実行可能なトップレベルのクエリ」を意味しています。

`ID` や `String` は基本型（GraphQL の用語では Scalar 型という）に分類されます。

| 名前      | 説明                             |
| :-------- | :------------------------------- |
| `Boolean` | 真偽値                           |
| `Int`     | 整数値                           |
| `Float`   | 浮動小数点の数値型               |
| `String`  | 文字列型                         |
| `ID`      | 一意識別子として利用される値の型 |

`ID!` のように、型名の後ろに `!` をつけると「そのフィールドは絶対に値がある」という意味になります。逆に `!` が無い場合は「値が取得できない可能性がある」という意味になります。

`[String]` のように、型名を `[ ]` で囲むと「囲んだ型を値に持つリスト」という意味になります。 `[[String]]` のように二次元リストのようにすることも可能です。

これ以外にも `Interface` や `Union` , `Enum` などの概念も存在しますが、ここでは割愛します。

## 引数付きの Query

先程みたように、このサービスでは `product` という Query も提供されていることがスキーマから分かりました。今度はこれを実行してみましょう。

```graphql
type Query {
  product(id: ID!): Product
}
```

```graphql
query {
  product(id: "002") {
    name
  }
}
```

### 引数を変数化する

実際のアプリケーションでは、商品 id は色々な値に変更したくなります。

GraphQL には、静的な Query に対して変数を埋め込む機構が用意されています。

```graphql
query ProductQuery($id: ID!) {
  product(id: $id) {
    name
  }
}
```

SQL の Prepared Statement と似ていますね。

変数を使う場合、 `query ProductQuery` のように、Query に名前をつける必要があります。関数名のようなものです。また変数名は "$" から始まっている必要があります。

Query の変数は JSON として用意します。プレイグラウンドの「Query Variables」をクリックして以下の JSON を記述しましょう。

```json
{
  "id": "002"
}
```

### 動的に Query を組み立ててはいけない

詳細は割愛しますが、以下のように Template String などで動的に **GraphQL の Query を組み立てるのは絶対にやめてください** 。

```js
const productId = router.query.params.productId;

const query = `
  query {
    product(id: "${productId}") {
      name
    }
  }
`;
```

余裕があれば、どのような不都合が生じるか考えてみてください。

## Mutation でサーバーのデータを変更する

ここまでは Query を扱ってきました。

続いて、Server 上の値の変更を扱ってみましょう。

GraphQL では破壊的な操作はすべて Mutation と呼ばれる操作で実行する必要があります。

- Query: 安全な処理. REST では GET
- Mutation: 安全でない、すなわち破壊的な処理. REST での POST/PUT/DELETE/PATCH

文法は Query の場合と同様です。

今回のスキーマには以下で定義された Mutation がありますので、これを実行してみましょう。

```graphql
type Mutation {
  # 指定した商品にレビューを追加する
  addReview(productId: ID!, addReviewInput: AddReviewInput!): Review
}
```

```graphql
mutation AddReview {
  addReview(
    productId: "002"
    addReviewInput: { commentBody: "すっぱい", star: 1 }
  ) {
    id
    commentBody
    star
  }
}
```

Mutation 実行後にもう一度 `ProductQuery` を実行し、レビューが投稿できたことを確かめてみましょう。

---

[Chapter 2 へ](./02_frontend_dev.md)
