import { useState } from "react"
import { gql } from "@apollo/client"
import { ProductReviewFragment } from "./__generated__/product-review-fragment"

export const productReviewFragment = gql`
  fragment ProductReviewFragment on Product {
    reviews {
      id
      commentBody
    }
  }
`

export type Props = {
  readonly product: ProductReviewFragment
  readonly submitting: boolean;
  readonly onSubmit: (commentBody: string) => Promise<any>;
};

export default function ProductReview({
  product,
  submitting,
  onSubmit
}: Props) {
  const [commentBody, setCommentBody] = useState("")
  return (
    <>
      <ul>
        {product.reviews.map(review => (
          <li key={review.id}>{review.commentBody}</li>
        ))}
      </ul>
      <form
        onSubmit={async e => {
          e.preventDefault();
          await onSubmit(commentBody)
          setCommentBody("");
        }}
      >
        <textarea
          value={commentBody}
          onChange={e => setCommentBody(e.target.value)}
        />
        <button type="submit" disabled={submitting}>
          レビュー送信
        </button>
      </form>
    </>
  );
}
