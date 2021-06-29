# Chapter 2. Frontend 開発一巡り

## ToC

- [はじめに](#%E3%81%AF%E3%81%98%E3%82%81%E3%81%AB)
- [Apollo Client の導入](#apollo-client-%E3%81%AE%E5%B0%8E%E5%85%A5)
- [React Component から GraphQL Query を実行する](#react-component-%E3%81%8B%E3%82%89-graphql-query-%E3%82%92%E5%AE%9F%E8%A1%8C%E3%81%99%E3%82%8B)
- [GraphQL Frontend の開発環境を整える](#graphql-frontend-%E3%81%AE%E9%96%8B%E7%99%BA%E7%92%B0%E5%A2%83%E3%82%92%E6%95%B4%E3%81%88%E3%82%8B)
  - [Apollo Client の Inspection](#apollo-client-%E3%81%AE-inspection)
  - [GraphQL のクエリのエディタ補完](#graphql-%E3%81%AE%E3%82%AF%E3%82%A8%E3%83%AA%E3%81%AE%E3%82%A8%E3%83%87%E3%82%A3%E3%82%BF%E8%A3%9C%E5%AE%8C)
  - [クエリの実行結果と TypeScript の型](#%E3%82%AF%E3%82%A8%E3%83%AA%E3%81%AE%E5%AE%9F%E8%A1%8C%E7%B5%90%E6%9E%9C%E3%81%A8-typescript-%E3%81%AE%E5%9E%8B)
- [引数付きのクエリを実行する](#%E5%BC%95%E6%95%B0%E4%BB%98%E3%81%8D%E3%81%AE%E3%82%AF%E3%82%A8%E3%83%AA%E3%82%92%E5%AE%9F%E8%A1%8C%E3%81%99%E3%82%8B)
- [Mutation を実行する](#mutation-%E3%82%92%E5%AE%9F%E8%A1%8C%E3%81%99%E3%82%8B)
  - [Mutation 実行後にクエリを再実行する](#mutation-%E5%AE%9F%E8%A1%8C%E5%BE%8C%E3%81%AB%E3%82%AF%E3%82%A8%E3%83%AA%E3%82%92%E5%86%8D%E5%AE%9F%E8%A1%8C%E3%81%99%E3%82%8B)
- [その他の GraphQL Client Library](#%E3%81%9D%E3%81%AE%E4%BB%96%E3%81%AE-graphql-client-library)

## はじめに

本章では、 Chapter 1. で触れた GraphQL サービスに接続するクライアントサイドのアプリケーションを作っていきます。

作成する機能は次のようになります。

- 商品一覧のページ
- 商品詳細のページ
  - 商品詳細ページからは商品のレビューを投稿可能

開発にあたっては下記のスタックを利用します。

- React.js
- Apollo Client

プロジェクトのスケルトンを用意しているので、まずは起動を確認してください。

```sh
$ cd frontend
$ npm i
$ npm start
```

http://localhost:4000 を開いてみましょう。

## Apollo Client の導入

まずは Apollo Client をプロジェクトに導入しましょう。

```sh
$ npm i @apollo/client graphql -S
```

`src/App.tsx` ファイルを開き、Apollo Client の設定を行います。

```tsx
import React from "react";
import { HashRouter, Switch, Route, Redirect } from "react-router-dom";

import { InMemoryCache, ApolloProvider, ApolloClient } from "@apollo/client";

function App() {
  // client オブジェクトの作成
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    uri: "http://localhost:4010/graphql"
  });

  // 全体を ApolloProvider でラップする
  return (
    <ApolloProvider client={client}>
      <HashRouter>{/* 中身は変更不要 */}</HashRouter>
    </ApolloProvider>
  );
}

export default App;
```

`ApolloClient` はブラウザから GraphQL サービスへの接続を担うクラスです。上記のように GraphQL の endpoint URL はここに記載します。

`cache` に指定した `InMemoryCache` というクラスについては後述します。とりあえずはおまじないとして必要であると思っていてください。

`ApolloProvider` は React Context Provider をラップした Component です。この Component でラップすることで、このアプリケーションからはどの Component からでも `useQuery` や `useMutation` といった hooks 関数が利用できるようになります。

## React Component から GraphQL Query を実行する

Chapter 1. と同じく、まずは商品一覧の取得を行いましょう。

`src/components/Products.tsx` の名前で新しくファイルを作成します。このファイルは最終的に商品一覧ページの React Component となります。

Component のことはさておき、まずは GraphQL クエリを書いていきましょう。

```tsx
import { gql } from "@apollo/client";

const query = gql`
  query ProductsQuery {
    products {
      id
      name
    }
  }
`;
```

クエリの中身については最早説明不要でしょう。

`gql` という Tagged Template Function は Apollo Client を使う上でのおまじないようなものなので、深く気にしなくて大丈夫です。

つづいて、Component 部分を書いていきます。以下のように編集してみてください。

```tsx
/* src/components/Products.tsx */

import { gql, useQuery } from "@apollo/client";

const query = gql`
  query ProductsQuery {
    products {
      id
      name
    }
  }
`;

export default function Products() {
  const { data, loading } = useQuery(query);
  if (loading || !data) return null;
  return (
    <>
      <ul>
        {data.products.map((product: { id: string; name: string }) => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </>
  );
}
```

GraphQL の Query を実行するには `useQuery` というフック関数を利用します。

このフック関数はオブジェクトを返却します。下記は特に頻繁に使います。

| key       | description                            |
| :-------- | :------------------------------------- |
| `data`    | クエリが正常に実行できた場合の取得結果 |
| `erros`   | クエリのエラー情報                     |
| `loading` | クエリが実行中の場合に `true` となる   |
| `refetch` | このクエリを再実行するための関数       |

さて、商品一覧ページが完成したので、 `src/App.tsx` を編集して作成した `Products` Component が表示されるようにしましょう。

```tsx
/* src/App.tsx */

import Products from "./components/Products";

function App() {
  // 略
  return (
    <ApolloProvider client={client}>
      {/* 中略 */}
      <Route path="/products">
        <Products />
      </Route>
    </ApolloProvider>
  );
}
```

`http://localhost:4000/#/products` をブラウザで開き、商品の一覧が表示されたら成功です！

## GraphQL Frontend の開発環境を整える

商品詳細画面の開発に入る前に、より便利に GraphQL Frontend を開発していくためのツールをいくつか導入していきます。

### Apollo Client の Inspection

まずは 開発中に Apollo Client の内部の様子を Debug するための Chrome 拡張です。以下のリンクからインストールしてください。

https://chrome.google.com/webstore/detail/apollo-client-devtools/jdkknkkbebbapilgoeccciglkfbmbnfm

この拡張機能がインストールされると、Chrome Devtool で "Apollo" というタブが選択可能になります（もしタブが追加されない場合は、別タブで `http://localhost:4000` を開き直すなどしてみてください）。

さらに Apollo 拡張機能の "CACHE" をクリックします。

このタブは Apollo Client に設定したキャッシュの内部を表示しています。

```ts
const client = new ApolloClient({
  cache: new InMemoryCache() // これ
});
```

`<ApolloProvider>` を設定した際に登場した `cache` もこのキャッシュのことです。

Apollo Client における「キャッシュ」は、Redux でいうところの `state` と同じような存在です。

非同期実行した GraphQL のクエリ実行結果のすべてがキャッシュに保存され、このキャッシュ上の値が `useQuery` などの API を通して React Component に渡っているのです。State 上の値が `useSelector` を通して React Component に渡される、というのととても似ていますよね？

もう少し詳細に Apollo Client キャッシュの中身を見ていきましょう。おそらく下記のようになっているはずです。

```json
{
  "ROOT_QUERY": {
    "__typename": "Query",
    "products": [
      {
        "__ref": "Product:001"
      },
      {
        "__ref": "Product:002"
      },
      {
        "__ref": "Product:003"
      }
    ]
  },
  "Product:001": {
    "id": "001",
    "__typename": "Product",
    "name": "うまいバー",
    "price": 10
  },
  "Product:002": {
    "id": "002",
    "__typename": "Product",
    "name": "やっちゃんイカ",
    "price": 50
  },
  "Product:003": {
    "id": "003",
    "__typename": "Product",
    "name": "ブラックダンサー",
    "price": 30
  }
}
```

一見すると何もおかしな箇所は無いように見える？

そう思うのであれば、プレイグラウンドからもう一度同じクエリを実行してみてください。

```graphql
query ProductsQuery {
  products {
    id
    name
  }
}
```

プレイグラウンドでの結果は下記のようになったはずです。

```json
{
  "data": {
    "products": [
      {
        "id": "001",
        "name": "うまいバー"
      },
      {
        "id": "002",
        "name": "やっちゃんイカ"
      },
      {
        "id": "003",
        "name": "ブラックダンサー"
      }
    ]
  }
}
```

Apollo Client のキャッシュとプレイグラウンドの実行結果を見比べると、以下の違いが分かります。

1. クエリに記載していない `__typename` というフィールドが生えている
2. `products` の配列要素が `"__ref": "Product:001"` のように参照を表すような構造になっている

Apollo Client は GraphQL サービスからのレスポンスをキャッシュに格納する際に正規化を施します。

`__typename` というフィールドは GraphQL の仕様で定義された特殊な項目で、そのオブジェクトの Type 名を返します。Apollo Client では 「`id`, `_id`, `key` といった名前のフィールドと `__typename` の値を連結したもの」をキャッシュのキーとして正規化を行います。

### GraphQL のクエリのエディタ補完

ところで、プレイグラウンドでは、Query や Mutation を編集する際に利用可能なフィールドやオブジェクト（正確には Selection と呼ぶ）が、その場で補完されて便利でしたよね。

一方で TSX ファイルの中での GraphQL Query はただの文字列であるため、エラーチェックや補完がされません。折角 GraphQL という静的に型が付いた言語を扱っているのに、その恩恵が開発時に得られないのはもったいないです。

```ts
const query = gql`
  query ProductsQuery {
    products {
      id
      namae # typo しても気づきにくい
    }
  }
`;
```

そこで、プレイグラウンドと同等のことができるように補助ツールを導入します。

まず準備として、プレイグラウンドから Server の Schema SDL ファイルを DL して、 schema.graphql という名前で `frontend` ディレクトリに配置します。

つづいて、以下のパッケージをインストールします。

```sh
$ npm i ts-graphql-plugin -D
```

TypeScript の設定ファイルに、ts-graphql-plugin の設定を追記します。これで補完やエラーチェックが有効になるはずです。

```json
{
  "compilerOptions": {
    // 中略
    "plugins": [
      { "name": "ts-graphql-plugin", "schema": "schema.graphql", "tag": "gql" }
    ]
  }
}
```

```ts
const query = gql`
  query ProductsQuery {
    products {
      id
      namae # エディタ上にエラーが表示される
    }
  }
`;
```

### クエリの実行結果と TypeScript の型

現状では、 `useQuery` で取得してきた `data` は TypeScript 上では `any` 型となってしまっています。

```ts
const { data, loading } = useQuery(query); // data の型が any になってしまう
```

これは Apollo Client 自体は、GraphQL Query のレスポンスとなる型を知らないためです。 `useQuery` のフック関数は、下記のようにジェネリクスとしてレスポンスの型を指定すると、対応して `data` にも型があたります。

```ts
cosnt { data } = useQuery<{ id: string }>(query) // data の型は { id: string } 型となる
```

ただ、GraphQL のクエリを編集するたびに、開発者自身が自分で `{ id: string }` の部分を書いてしまうと問題が生じます:

- typo などのバグの元
- そもそも面倒くさい

そこで、TSX 上のクエリから、対応する data の型を自動で生成するようにします。

今回の workshop では先程インストールした `ts-graphql-plugin` の CLI を利用するようにします(クエリから型を生成するツールは他にも色々なパッケージが npm 上で提供されています。e.g. graphql-codegen, apollo-tooliing, etc... )。

```sh
$ npx ts-graphql-plugin typegen
```

これで `__generated__` ディレクトリ以下にクエリに応じた TypeScript の型ファイルが生成されました。import して `useQuery` のジェネリクス(型パラメータ)にセットしましょう。

```ts
/* src/components/Products.tsx */

import {
  ProductsQuery,
  ProductsQueryVariables
} from "./__generated__/products-query";

// 中略
const { data, loading } = useQuery<ProductsQuery, ProductsQueryVariables>(
  query
); // dataは `query` に応じた結果の型となる
```

## 引数付きのクエリを実行する

次に商品の詳細ページを作っていきます。

まずは

- 商品名
- 説明
- レビュー内容のリスト

を表示できるようにしましょう。GraphQL のクエリは以下のようになりますね。

```graphql
query ProductDetailQuery($id: ID!) {
  product(id: $id) {
    id
    name
    description
    reviews {
      id
      commentBody
    }
  }
}
```

React 部分については、商品一覧の場合とほぼ同様に作ります。商品の ID を router から取得して Apollo Client に Variable として渡しています。

```tsx
/* src/components/ProductDetail.tsx */

import { useParams } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";

import {
  ProductDetailQuery,
  ProductDetailQueryVariables
} from "./__generated__/product-detail-query";

const query = gql`
  query ProductDetailQuery($id: ID!) {
    product(id: $id) {
      id
      name
      description
      reviews {
        id
        commentBody
      }
    }
  }
`;

export default function () {
  const { productId } = useParams<{ readonly productId: string }>();
  const { data, loading } = useQuery<
    ProductDetailQuery,
    ProductDetailQueryVariables
  >(query, {
    variables: {
      id: productId
    }
  });
  if (loading) return <div>loading...</div>;
  if (!data?.product) return <div>not found </div>;
  const { product } = data;
  return (
    <>
      <h1>{product.name}</h1>
      <p style={{ whiteSpace: "pre-wrap" }}>{product.description}</p>
      <div>
        <h2>レビュー</h2>
        {product.reviews.length ? (
          <ul>
            {product.reviews.map(r => (
              <li key={r.id}>{r.commentBody}</li>
            ))}
          </ul>
        ) : (
          <p>レビューはまだありません</p>
        )}
      </div>
    </>
  );
}
```

Component を実装したら、Routing を更新して正しく動作することを確認しましょう。

```tsx
/* src/App.tsx */

import Products from "./components/Products";
import ProductDetail from "./components/ProductDetail"; // 追加

function App() {
  return (
    <HashRouter>
      <Switch>
        {/* route 定義を編集 */}
        <Route path="/products/:productId">
          <ProductDetail />
        </Route>

        <Route path="/products" exact>
          <Products />
        </Route>
      </Switch>
    </HashRouter>
  );
}
```

## Mutation を実行する

この章の仕上げとして、商品詳細ページからレビューコメントを投稿できるようにしてみます。

`useMutation` という Apollo Client の フック関数を利用します。 `useMutation` は次のように利用します。

```tsx
import { gql, useMutation } from "@apollo/client";

const mutation = gql`
  mutation MyMutation {
    # mutation の詳細
  }
`;

const [myMutation, { data, loading }] = useMutation(mutation);
// myMutation({ variables: { /* Mutation に渡す変数 */ } }) で実行する
```

フック関数は次の構造のタプルを返します。

- 1 つめ: Mutation を実行するための関数
- 2 つめ: Mutation が実行されたときの State

実際に商品詳細の画面に、レビューコメント投稿の form を追加して `useMutation` を使ってみましょう。

```tsx
const mutation = gql`
  mutation AddReviewMutation($pid: ID!, $comment: String!) {
    addReview(
      productId: $pid
      addReviewInput: { commentBody: $comment, star: 0 }
    ) {
      id
    }
  }
`;

export default function () {
  const [myComment, setMyComment] = useState("");
  const [addReview, { loading: submitting }] = useMutation<
    AddReviewMutation,
    AddReviewMutationVariables
  >(mutation);

  return (
    <>
      {/* 中略 */}

      <form
        onSubmit={e => {
          e.preventDefault();
          addReview({
            variables: {
              pid: productId,
              comment: myComment
            }
          });
        }}
      >
        <div>
          <label>
            コメント
            <textarea
              value={myComment}
              onChange={e => setMyComment(e.target.value)}
            />
          </label>
        </div>
        <button type="submit" disabled={submitting}>
          追加
        </button>
      </form>
    </>
  );
}
```

画面から実行して見ください。プレイグラウンド上で、選択した商品の `reviews` に投稿が追加されたことが確認できるはずです。

### Mutation 実行後にクエリを再実行する

ここまでの実装では「追加」をタップしたときにレビューが投稿され、Server 上のデータが変わったことは確認できたものの、画面にはそれが反映されていない状態となってしまっているはずです。

Mutation 実行後に画面を更新する方法はいくつか存在しますが、いずれの方法の場合でも「Apollo Client のキャッシュを正しく更新する必要がある」が基本的な考え方です。

Apollo Client 拡張から、Mutation 実行直後のキャッシュを確認してみてください。

商品、すなわち `Product` Type に対応するキャッシュとして `Product:002` などが表示されているはずですが、 `addReview` Mutation 実行直後は以下のように対応する `reviews` には追加したレビューが含まれない状態です。

```json
{
  "Product:002": {
    "reviews": []
  }
}
```

もっとも簡単に Apollo Client のキャッシュを更新する方法として、ここでは「関係するクエリを再度実行する」という方法を用います。

`useMutation` の第二引数に `update` という関数を渡すと、当該の Mutation が完了した歳にその関数が Callback されます。今回はこのコールバック関数に `useQuery` で指定した商品詳細の取得クエリを再実行するようにしましょう。

```tsx
// `useQuery` の戻り値から、Query 実行関数を取得しておく
const { data, loading, refetch } = useQuery<
  ProductDetailQuery,
  ProductDetailQueryVariables
>(query, {
  variables: {
    id: productId
  }
});

const [addReview, { loading: submitting }] = useMutation<
  AddReviewMutation,
  AddReviewMutationVariables
>(mutation, {
  // Mutation 実行後に動作する関数
  update(_, { data }) {
    if (!data?.addReview) return;
    setMyComment("");
    refetch();
  }
});
```

実際に画面からレビューを投稿し、レビュー一覧に反映されることを確認してみましょう。

## その他の GraphQL Client Library

この workshop では Apollo Client を紹介しました。JavaScript フロントエンドで利用可能な GraphQL ライブラリには Apollo Client 以外にも以下があります。

| 名前                                             | 特徴                                                                                                                                                          |
| :----------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Relay](https://github.com/facebook/relay)       | Facebook 社が作成した React と GraphQL を統合したフロントエンド向けフレームワーク。Relay QL Spec という追加仕様をサーバーサイドに要求することもあり敷居が高い |
| [urql](https://formidable.com/open-source/urql/) | 軽量、カスタマイズ性の高い GraphQL クライアントライブラリ。React 以外にも Vue.js や Svelte 向けの実装も存在している                                           |
| [gqless](https://gqless.com/)                    | React JSX から自動的に GraphQL Query を生成するアプローチのクライアントライブラリ                                                                             |

---

[Chapter 1 へ](./01_what_gql.md)
[Chapter 3 へ](./03_colocation.md)
