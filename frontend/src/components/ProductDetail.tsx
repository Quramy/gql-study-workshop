import { useState } from "react";
import { useParams } from "react-router-dom";
import { gql, useQuery, useMutation } from "@apollo/client";
import {
  ProductDetailQuery,
  ProductDetailQueryVariables
} from "./__generated__/product-detail-query";
import { AddReview, AddReviewVariables } from "./__generated__/add-review";
import ProductReview, { productReviewFragment } from "./ProductReview";

const query = gql`
  query ProductDetailQuery($pid: ID!) {
    product(id: $pid) {
      id
      name
      description
      price
      ...ProductReviewFragment
    }
  }
  ${productReviewFragment}
`;

const addReviewMutation = gql`
  mutation AddReview($pid: ID!, $commentBody: String!) {
    addReview(
      productId: $pid
      addReviewInput: { star: 0, commentBody: $commentBody }
    ) {
      id
    }
  }
`;

export default function ProductDetail() {
  const { productId } = useParams<{ readonly productId: string }>();
  const { data, loading, refetch } = useQuery<
    ProductDetailQuery,
    ProductDetailQueryVariables
  >(query, {
    variables: {
      pid: productId
    }
  });
  const [mutate, { loading: submitting }] = useMutation<
    AddReview,
    AddReviewVariables
  >(addReviewMutation);
  if (loading || !data || !data?.product) return null;
  const { product } = data;
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.price}円</p>
      <p style={{ whiteSpace: "pre-wrap" }}>{product.description}</p>
      <ProductReview
        product={product}
        submitting={submitting}
        onSubmit={commentBody =>
          mutate({
            variables: {
              commentBody,
              pid: productId
            },
            update() {
              refetch();
            }
          })
        }
      />
    </div>
  );
}
