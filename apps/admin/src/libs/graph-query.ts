
import {gql} from "urql";

 const ownedNftsQuery = gql`

   query  schoolOwnedNfts{schoolOwnedNfts(subgraphError: allow) {
      id
      nfts {
        id
        tokenUri
      }
    }
  }
  `
 const nftListQuery = gql`

  query schoolTokenUris($skip:Int, $first:Int) {schoolTokenUris(subgraphError: allow,skip: $skip,first: $first) {
    id
    tokenUri
    mintedAt
  }
}`

const nftDetailsQuery = gql`

query schoolTokenUri($id: ID!) {
  schoolTokenUri(id: $id, subgraphError: allow) {
    id
    tokenUri
    owner {
      id
    }
  }
  schoolTransfers(subgraphError: allow, where: {tokenId: $id}) {
    blockNumber
    blockTimestamp
    from
    id
    to
    tokenId
    transactionHash
  }
  collectorTransfers(subgraphError: allow, where: {tokenId: $id}) {
    blockNumber
    blockTimestamp
    from
    id
    to
    tokenId
    transactionHash
  }
}
`

export const Queries ={
  ownedNftsQuery,
  nftListQuery,
  nftDetailsQuery
}



 