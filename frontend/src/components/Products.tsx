import { gql, useQuery } from "@apollo/client";
import { Link } from "react-router-dom";
import {
  ProductsQuery,
  ProductsQueryVariables
} from "./__generated__/products-query";

const query = gql`
  query ProductsQuery {
    products {
      id
      name
    }
  }
`;

export default function Products() {
  const { data, loading } = useQuery<ProductsQuery, ProductsQueryVariables>(
    query
  );
  if (loading || !data) return null;
  return (
    <>
      <ul>
        {data.products.map(p => (
          <li key={p.id}>
            <Link to={`/products/${p.id}`}>{p.name}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}
