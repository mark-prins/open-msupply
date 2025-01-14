import * as Types from '@openmsupply-client/common';

import { GraphQLClient } from 'graphql-request';
import { GraphQLClientRequestHeaders } from 'graphql-request/build/cjs/types';
import gql from 'graphql-tag';
import { graphql, ResponseResolver, GraphQLRequest, GraphQLContext } from 'msw'
export type ServiceItemRowFragment = { __typename: 'ItemNode', id: string, code: string, name: string, unitName?: string | null };

export type StockLineFragment = { __typename: 'StockLineNode', availableNumberOfPacks: number, batch?: string | null, costPricePerPack: number, expiryDate?: string | null, id: string, itemId: string, note?: string | null, onHold: boolean, packSize: number, sellPricePerPack: number, storeId: string, totalNumberOfPacks: number, location?: { __typename: 'LocationNode', code: string, id: string, name: string, onHold: boolean } | null, item: { __typename: 'ItemNode', name: string, code: string, unitName?: string | null } };

export type ItemRowFragment = { __typename: 'ItemNode', id: string, code: string, name: string, unitName?: string | null };

export type ItemWithPackSizeFragment = { __typename: 'ItemNode', defaultPackSize: number, id: string, code: string, name: string, unitName?: string | null };

export type ItemStockOnHandFragment = { __typename: 'ItemNode', availableStockOnHand: number, defaultPackSize: number, id: string, code: string, name: string, unitName?: string | null };

export type ItemRowWithStatsFragment = { __typename: 'ItemNode', availableStockOnHand: number, defaultPackSize: number, id: string, code: string, name: string, unitName?: string | null, stats: { __typename: 'ItemStatsNode', averageMonthlyConsumption: number, availableStockOnHand: number, availableMonthsOfStockOnHand?: number | null } };

export type ItemFragment = { __typename: 'ItemNode', id: string, code: string, name: string, atcCategory: string, ddd: string, defaultPackSize: number, doses: number, isVaccine: boolean, margin: number, msupplyUniversalCode: string, msupplyUniversalName: string, outerPackSize: number, strength: string, type: Types.ItemNodeType, unitName?: string | null, volumePerOuterPack: number, volumePerPack: number, weight: number, availableStockOnHand: number, availableBatches: { __typename: 'StockLineConnector', totalCount: number, nodes: Array<{ __typename: 'StockLineNode', availableNumberOfPacks: number, batch?: string | null, costPricePerPack: number, expiryDate?: string | null, id: string, itemId: string, note?: string | null, onHold: boolean, packSize: number, sellPricePerPack: number, storeId: string, totalNumberOfPacks: number, location?: { __typename: 'LocationNode', code: string, id: string, name: string, onHold: boolean } | null, item: { __typename: 'ItemNode', name: string, code: string, unitName?: string | null } }> }, stats: { __typename: 'ItemStatsNode', averageMonthlyConsumption: number, availableStockOnHand: number, availableMonthsOfStockOnHand?: number | null } };

export type ItemsWithStockLinesQueryVariables = Types.Exact<{
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  key: Types.ItemSortFieldInput;
  desc?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
  filter?: Types.InputMaybe<Types.ItemFilterInput>;
  storeId: Types.Scalars['String']['input'];
}>;


export type ItemsWithStockLinesQuery = { __typename: 'Queries', items: { __typename: 'ItemConnector', totalCount: number, nodes: Array<{ __typename: 'ItemNode', id: string, code: string, name: string, atcCategory: string, ddd: string, defaultPackSize: number, doses: number, isVaccine: boolean, margin: number, msupplyUniversalCode: string, msupplyUniversalName: string, outerPackSize: number, strength: string, type: Types.ItemNodeType, unitName?: string | null, volumePerOuterPack: number, volumePerPack: number, weight: number, availableStockOnHand: number, availableBatches: { __typename: 'StockLineConnector', totalCount: number, nodes: Array<{ __typename: 'StockLineNode', availableNumberOfPacks: number, batch?: string | null, costPricePerPack: number, expiryDate?: string | null, id: string, itemId: string, note?: string | null, onHold: boolean, packSize: number, sellPricePerPack: number, storeId: string, totalNumberOfPacks: number, location?: { __typename: 'LocationNode', code: string, id: string, name: string, onHold: boolean } | null, item: { __typename: 'ItemNode', name: string, code: string, unitName?: string | null } }> }, stats: { __typename: 'ItemStatsNode', averageMonthlyConsumption: number, availableStockOnHand: number, availableMonthsOfStockOnHand?: number | null } }> } };

export type ItemsQueryVariables = Types.Exact<{
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  key: Types.ItemSortFieldInput;
  desc?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
  filter?: Types.InputMaybe<Types.ItemFilterInput>;
  storeId: Types.Scalars['String']['input'];
}>;


export type ItemsQuery = { __typename: 'Queries', items: { __typename: 'ItemConnector', totalCount: number, nodes: Array<{ __typename: 'ItemNode', id: string, code: string, name: string, unitName?: string | null }> } };

export type ItemStockOnHandQueryVariables = Types.Exact<{
  storeId: Types.Scalars['String']['input'];
  key?: Types.InputMaybe<Types.ItemSortFieldInput>;
  isDesc?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
  filter?: Types.InputMaybe<Types.ItemFilterInput>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type ItemStockOnHandQuery = { __typename: 'Queries', items: { __typename: 'ItemConnector', totalCount: number, nodes: Array<{ __typename: 'ItemNode', availableStockOnHand: number, defaultPackSize: number, id: string, code: string, name: string, unitName?: string | null }> } };

export type ItemsWithStatsFragment = { __typename: 'ItemNode', code: string, id: string, name: string, unitName?: string | null, defaultPackSize: number, availableStockOnHand: number, stats: { __typename: 'ItemStatsNode', averageMonthlyConsumption: number, availableStockOnHand: number, availableMonthsOfStockOnHand?: number | null } };

export type ItemsWithStatsQueryVariables = Types.Exact<{
  storeId: Types.Scalars['String']['input'];
  key?: Types.InputMaybe<Types.ItemSortFieldInput>;
  isDesc?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
  filter?: Types.InputMaybe<Types.ItemFilterInput>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type ItemsWithStatsQuery = { __typename: 'Queries', items: { __typename: 'ItemConnector', totalCount: number, nodes: Array<{ __typename: 'ItemNode', code: string, id: string, name: string, unitName?: string | null, defaultPackSize: number, availableStockOnHand: number, stats: { __typename: 'ItemStatsNode', averageMonthlyConsumption: number, availableStockOnHand: number, availableMonthsOfStockOnHand?: number | null } }> } };

export type ItemByIdQueryVariables = Types.Exact<{
  storeId: Types.Scalars['String']['input'];
  itemId: Types.Scalars['String']['input'];
}>;


export type ItemByIdQuery = { __typename: 'Queries', items: { __typename: 'ItemConnector', totalCount: number, nodes: Array<{ __typename: 'ItemNode', id: string, code: string, name: string, atcCategory: string, ddd: string, defaultPackSize: number, doses: number, isVaccine: boolean, margin: number, msupplyUniversalCode: string, msupplyUniversalName: string, outerPackSize: number, strength: string, type: Types.ItemNodeType, unitName?: string | null, volumePerOuterPack: number, volumePerPack: number, weight: number, availableStockOnHand: number, stats: { __typename: 'ItemStatsNode', averageMonthlyConsumption: number, availableStockOnHand: number, availableMonthsOfStockOnHand?: number | null }, availableBatches: { __typename: 'StockLineConnector', totalCount: number, nodes: Array<{ __typename: 'StockLineNode', availableNumberOfPacks: number, batch?: string | null, costPricePerPack: number, expiryDate?: string | null, id: string, itemId: string, note?: string | null, onHold: boolean, packSize: number, sellPricePerPack: number, storeId: string, totalNumberOfPacks: number, location?: { __typename: 'LocationNode', code: string, id: string, name: string, onHold: boolean } | null, item: { __typename: 'ItemNode', name: string, code: string, unitName?: string | null } }> } }> } };

export type VariantFragment = { __typename: 'VariantNode', id: string, itemId: string, longName: string, packSize: number, shortName: string };

export type PackVariantFragment = { __typename: 'ItemPackVariantNode', itemId: string, mostUsedPackVariantId: string, packVariants: Array<{ __typename: 'VariantNode', id: string, itemId: string, longName: string, packSize: number, shortName: string }> };

export type PackVariantsQueryVariables = Types.Exact<{
  storeId: Types.Scalars['String']['input'];
}>;


export type PackVariantsQuery = { __typename: 'Queries', packVariants: { __typename: 'ItemPackVariantConnector', totalCount: number, nodes: Array<{ __typename: 'ItemPackVariantNode', itemId: string, mostUsedPackVariantId: string, packVariants: Array<{ __typename: 'VariantNode', id: string, itemId: string, longName: string, packSize: number, shortName: string }> }> } };

export type InsertPackVariantMutationVariables = Types.Exact<{
  storeId: Types.Scalars['String']['input'];
  input: Types.InsertPackVariantInput;
}>;


export type InsertPackVariantMutation = { __typename: 'Mutations', centralServer: { __typename: 'CentralServerMutationNode', packVariant: { __typename: 'PackVariantMutations', insertPackVariant: { __typename: 'InsertPackVariantError', error: { __typename: 'CannotAddPackSizeOfZero', description: string } | { __typename: 'CannotAddWithNoAbbreviationAndName', description: string } | { __typename: 'VariantWithPackSizeAlreadyExists', description: string } } | { __typename: 'VariantNode', id: string, itemId: string, longName: string, packSize: number, shortName: string } } } };

export type UpdatePackVariantMutationVariables = Types.Exact<{
  storeId: Types.Scalars['String']['input'];
  input: Types.UpdatePackVariantInput;
}>;


export type UpdatePackVariantMutation = { __typename: 'Mutations', centralServer: { __typename: 'CentralServerMutationNode', packVariant: { __typename: 'PackVariantMutations', updatePackVariant: { __typename: 'UpdatePackVariantError', error: { __typename: 'CannotAddWithNoAbbreviationAndName', description: string } } | { __typename: 'VariantNode', id: string, itemId: string, longName: string, packSize: number, shortName: string } } } };

export type DeletePackVariantMutationVariables = Types.Exact<{
  storeId: Types.Scalars['String']['input'];
  input: Types.DeletePackVariantInput;
}>;


export type DeletePackVariantMutation = { __typename: 'Mutations', centralServer: { __typename: 'CentralServerMutationNode', packVariant: { __typename: 'PackVariantMutations', deletePackVariant: { __typename: 'DeleteResponse', id: string } } } };

export const ServiceItemRowFragmentDoc = gql`
    fragment ServiceItemRow on ItemNode {
  __typename
  id
  code
  name
  unitName
}
    `;
export const ItemRowFragmentDoc = gql`
    fragment ItemRow on ItemNode {
  __typename
  id
  code
  name
  unitName
}
    `;
export const ItemWithPackSizeFragmentDoc = gql`
    fragment ItemWithPackSize on ItemNode {
  ...ItemRow
  defaultPackSize
}
    ${ItemRowFragmentDoc}`;
export const ItemStockOnHandFragmentDoc = gql`
    fragment ItemStockOnHand on ItemNode {
  ...ItemWithPackSize
  availableStockOnHand(storeId: $storeId)
}
    ${ItemWithPackSizeFragmentDoc}`;
export const ItemRowWithStatsFragmentDoc = gql`
    fragment ItemRowWithStats on ItemNode {
  ...ItemStockOnHand
  stats(storeId: $storeId) {
    __typename
    averageMonthlyConsumption
    availableStockOnHand
    availableMonthsOfStockOnHand
  }
}
    ${ItemStockOnHandFragmentDoc}`;
export const StockLineFragmentDoc = gql`
    fragment StockLine on StockLineNode {
  availableNumberOfPacks
  batch
  costPricePerPack
  expiryDate
  id
  itemId
  location {
    code
    id
    name
    onHold
  }
  item {
    name
    code
    unitName
  }
  note
  onHold
  packSize
  sellPricePerPack
  storeId
  totalNumberOfPacks
}
    `;
export const ItemFragmentDoc = gql`
    fragment Item on ItemNode {
  __typename
  id
  code
  name
  atcCategory
  ddd
  defaultPackSize
  doses
  isVaccine
  margin
  msupplyUniversalCode
  msupplyUniversalName
  outerPackSize
  strength
  type
  unitName
  volumePerOuterPack
  volumePerPack
  weight
  availableStockOnHand(storeId: $storeId)
  availableBatches(storeId: $storeId) {
    __typename
    totalCount
    nodes {
      __typename
      ...StockLine
    }
  }
  stats(storeId: $storeId) {
    __typename
    averageMonthlyConsumption
    availableStockOnHand
    availableMonthsOfStockOnHand
  }
}
    ${StockLineFragmentDoc}`;
export const ItemsWithStatsFragmentDoc = gql`
    fragment ItemsWithStats on ItemNode {
  __typename
  code
  id
  name
  unitName
  defaultPackSize
  availableStockOnHand(storeId: $storeId)
  stats(storeId: $storeId) {
    __typename
    averageMonthlyConsumption
    availableStockOnHand
    availableMonthsOfStockOnHand
  }
}
    `;
export const VariantFragmentDoc = gql`
    fragment Variant on VariantNode {
  __typename
  id
  itemId
  longName
  packSize
  shortName
}
    `;
export const PackVariantFragmentDoc = gql`
    fragment PackVariant on ItemPackVariantNode {
  itemId
  mostUsedPackVariantId
  packVariants {
    ...Variant
  }
}
    ${VariantFragmentDoc}`;
export const ItemsWithStockLinesDocument = gql`
    query itemsWithStockLines($first: Int, $offset: Int, $key: ItemSortFieldInput!, $desc: Boolean, $filter: ItemFilterInput, $storeId: String!) {
  items(
    page: {first: $first, offset: $offset}
    sort: {key: $key, desc: $desc}
    filter: $filter
    storeId: $storeId
  ) {
    ... on ItemConnector {
      __typename
      nodes {
        ...Item
      }
      totalCount
    }
  }
}
    ${ItemFragmentDoc}`;
export const ItemsDocument = gql`
    query items($first: Int, $offset: Int, $key: ItemSortFieldInput!, $desc: Boolean, $filter: ItemFilterInput, $storeId: String!) {
  items(
    storeId: $storeId
    page: {first: $first, offset: $offset}
    sort: {key: $key, desc: $desc}
    filter: $filter
  ) {
    ... on ItemConnector {
      __typename
      nodes {
        ...ItemRow
      }
      totalCount
    }
  }
}
    ${ItemRowFragmentDoc}`;
export const ItemStockOnHandDocument = gql`
    query itemStockOnHand($storeId: String!, $key: ItemSortFieldInput, $isDesc: Boolean, $filter: ItemFilterInput, $first: Int, $offset: Int) {
  items(
    storeId: $storeId
    sort: {key: $key, desc: $isDesc}
    filter: $filter
    page: {first: $first, offset: $offset}
  ) {
    ... on ItemConnector {
      __typename
      nodes {
        ...ItemStockOnHand
      }
      totalCount
    }
  }
}
    ${ItemStockOnHandFragmentDoc}`;
export const ItemsWithStatsDocument = gql`
    query itemsWithStats($storeId: String!, $key: ItemSortFieldInput, $isDesc: Boolean, $filter: ItemFilterInput, $first: Int, $offset: Int) {
  items(
    storeId: $storeId
    sort: {key: $key, desc: $isDesc}
    filter: $filter
    page: {first: $first, offset: $offset}
  ) {
    ... on ItemConnector {
      __typename
      nodes {
        ...ItemsWithStats
      }
      totalCount
    }
  }
}
    ${ItemsWithStatsFragmentDoc}`;
export const ItemByIdDocument = gql`
    query itemById($storeId: String!, $itemId: String!) {
  items(storeId: $storeId, filter: {id: {equalTo: $itemId}, isActive: true}) {
    ... on ItemConnector {
      __typename
      nodes {
        __typename
        ...Item
        stats(storeId: $storeId) {
          __typename
          averageMonthlyConsumption
          availableStockOnHand
          availableMonthsOfStockOnHand
        }
        availableBatches(storeId: $storeId) {
          totalCount
          nodes {
            ...StockLine
          }
        }
      }
      totalCount
    }
  }
}
    ${ItemFragmentDoc}
${StockLineFragmentDoc}`;
export const PackVariantsDocument = gql`
    query packVariants($storeId: String!) {
  packVariants(storeId: $storeId) {
    __typename
    nodes {
      ...PackVariant
    }
    totalCount
  }
}
    ${PackVariantFragmentDoc}`;
export const InsertPackVariantDocument = gql`
    mutation insertPackVariant($storeId: String!, $input: InsertPackVariantInput!) {
  centralServer {
    packVariant {
      insertPackVariant(storeId: $storeId, input: $input) {
        __typename
        ... on VariantNode {
          ...Variant
        }
        ... on InsertPackVariantError {
          error {
            __typename
            description
          }
        }
      }
    }
  }
}
    ${VariantFragmentDoc}`;
export const UpdatePackVariantDocument = gql`
    mutation updatePackVariant($storeId: String!, $input: UpdatePackVariantInput!) {
  centralServer {
    packVariant {
      updatePackVariant(storeId: $storeId, input: $input) {
        __typename
        ... on VariantNode {
          ...Variant
        }
        ... on UpdatePackVariantError {
          error {
            __typename
            description
          }
        }
      }
    }
  }
}
    ${VariantFragmentDoc}`;
export const DeletePackVariantDocument = gql`
    mutation deletePackVariant($storeId: String!, $input: DeletePackVariantInput!) {
  centralServer {
    packVariant {
      deletePackVariant(storeId: $storeId, input: $input) {
        ... on DeleteResponse {
          __typename
          id
        }
      }
    }
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    itemsWithStockLines(variables: ItemsWithStockLinesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<ItemsWithStockLinesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ItemsWithStockLinesQuery>(ItemsWithStockLinesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'itemsWithStockLines', 'query');
    },
    items(variables: ItemsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<ItemsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ItemsQuery>(ItemsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'items', 'query');
    },
    itemStockOnHand(variables: ItemStockOnHandQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<ItemStockOnHandQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ItemStockOnHandQuery>(ItemStockOnHandDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'itemStockOnHand', 'query');
    },
    itemsWithStats(variables: ItemsWithStatsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<ItemsWithStatsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ItemsWithStatsQuery>(ItemsWithStatsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'itemsWithStats', 'query');
    },
    itemById(variables: ItemByIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<ItemByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ItemByIdQuery>(ItemByIdDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'itemById', 'query');
    },
    packVariants(variables: PackVariantsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<PackVariantsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<PackVariantsQuery>(PackVariantsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'packVariants', 'query');
    },
    insertPackVariant(variables: InsertPackVariantMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<InsertPackVariantMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<InsertPackVariantMutation>(InsertPackVariantDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'insertPackVariant', 'mutation');
    },
    updatePackVariant(variables: UpdatePackVariantMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UpdatePackVariantMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdatePackVariantMutation>(UpdatePackVariantDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updatePackVariant', 'mutation');
    },
    deletePackVariant(variables: DeletePackVariantMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<DeletePackVariantMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeletePackVariantMutation>(DeletePackVariantDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'deletePackVariant', 'mutation');
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;

/**
 * @param resolver a function that accepts a captured request and may return a mocked response.
 * @see https://mswjs.io/docs/basics/response-resolver
 * @example
 * mockItemsWithStockLinesQuery((req, res, ctx) => {
 *   const { first, offset, key, desc, filter, storeId } = req.variables;
 *   return res(
 *     ctx.data({ items })
 *   )
 * })
 */
export const mockItemsWithStockLinesQuery = (resolver: ResponseResolver<GraphQLRequest<ItemsWithStockLinesQueryVariables>, GraphQLContext<ItemsWithStockLinesQuery>, any>) =>
  graphql.query<ItemsWithStockLinesQuery, ItemsWithStockLinesQueryVariables>(
    'itemsWithStockLines',
    resolver
  )

/**
 * @param resolver a function that accepts a captured request and may return a mocked response.
 * @see https://mswjs.io/docs/basics/response-resolver
 * @example
 * mockItemsQuery((req, res, ctx) => {
 *   const { first, offset, key, desc, filter, storeId } = req.variables;
 *   return res(
 *     ctx.data({ items })
 *   )
 * })
 */
export const mockItemsQuery = (resolver: ResponseResolver<GraphQLRequest<ItemsQueryVariables>, GraphQLContext<ItemsQuery>, any>) =>
  graphql.query<ItemsQuery, ItemsQueryVariables>(
    'items',
    resolver
  )

/**
 * @param resolver a function that accepts a captured request and may return a mocked response.
 * @see https://mswjs.io/docs/basics/response-resolver
 * @example
 * mockItemStockOnHandQuery((req, res, ctx) => {
 *   const { storeId, key, isDesc, filter, first, offset } = req.variables;
 *   return res(
 *     ctx.data({ items })
 *   )
 * })
 */
export const mockItemStockOnHandQuery = (resolver: ResponseResolver<GraphQLRequest<ItemStockOnHandQueryVariables>, GraphQLContext<ItemStockOnHandQuery>, any>) =>
  graphql.query<ItemStockOnHandQuery, ItemStockOnHandQueryVariables>(
    'itemStockOnHand',
    resolver
  )

/**
 * @param resolver a function that accepts a captured request and may return a mocked response.
 * @see https://mswjs.io/docs/basics/response-resolver
 * @example
 * mockItemsWithStatsQuery((req, res, ctx) => {
 *   const { storeId, key, isDesc, filter, first, offset } = req.variables;
 *   return res(
 *     ctx.data({ items })
 *   )
 * })
 */
export const mockItemsWithStatsQuery = (resolver: ResponseResolver<GraphQLRequest<ItemsWithStatsQueryVariables>, GraphQLContext<ItemsWithStatsQuery>, any>) =>
  graphql.query<ItemsWithStatsQuery, ItemsWithStatsQueryVariables>(
    'itemsWithStats',
    resolver
  )

/**
 * @param resolver a function that accepts a captured request and may return a mocked response.
 * @see https://mswjs.io/docs/basics/response-resolver
 * @example
 * mockItemByIdQuery((req, res, ctx) => {
 *   const { storeId, itemId } = req.variables;
 *   return res(
 *     ctx.data({ items })
 *   )
 * })
 */
export const mockItemByIdQuery = (resolver: ResponseResolver<GraphQLRequest<ItemByIdQueryVariables>, GraphQLContext<ItemByIdQuery>, any>) =>
  graphql.query<ItemByIdQuery, ItemByIdQueryVariables>(
    'itemById',
    resolver
  )

/**
 * @param resolver a function that accepts a captured request and may return a mocked response.
 * @see https://mswjs.io/docs/basics/response-resolver
 * @example
 * mockPackVariantsQuery((req, res, ctx) => {
 *   const { storeId } = req.variables;
 *   return res(
 *     ctx.data({ packVariants })
 *   )
 * })
 */
export const mockPackVariantsQuery = (resolver: ResponseResolver<GraphQLRequest<PackVariantsQueryVariables>, GraphQLContext<PackVariantsQuery>, any>) =>
  graphql.query<PackVariantsQuery, PackVariantsQueryVariables>(
    'packVariants',
    resolver
  )

/**
 * @param resolver a function that accepts a captured request and may return a mocked response.
 * @see https://mswjs.io/docs/basics/response-resolver
 * @example
 * mockInsertPackVariantMutation((req, res, ctx) => {
 *   const { storeId, input } = req.variables;
 *   return res(
 *     ctx.data({ centralServer })
 *   )
 * })
 */
export const mockInsertPackVariantMutation = (resolver: ResponseResolver<GraphQLRequest<InsertPackVariantMutationVariables>, GraphQLContext<InsertPackVariantMutation>, any>) =>
  graphql.mutation<InsertPackVariantMutation, InsertPackVariantMutationVariables>(
    'insertPackVariant',
    resolver
  )

/**
 * @param resolver a function that accepts a captured request and may return a mocked response.
 * @see https://mswjs.io/docs/basics/response-resolver
 * @example
 * mockUpdatePackVariantMutation((req, res, ctx) => {
 *   const { storeId, input } = req.variables;
 *   return res(
 *     ctx.data({ centralServer })
 *   )
 * })
 */
export const mockUpdatePackVariantMutation = (resolver: ResponseResolver<GraphQLRequest<UpdatePackVariantMutationVariables>, GraphQLContext<UpdatePackVariantMutation>, any>) =>
  graphql.mutation<UpdatePackVariantMutation, UpdatePackVariantMutationVariables>(
    'updatePackVariant',
    resolver
  )

/**
 * @param resolver a function that accepts a captured request and may return a mocked response.
 * @see https://mswjs.io/docs/basics/response-resolver
 * @example
 * mockDeletePackVariantMutation((req, res, ctx) => {
 *   const { storeId, input } = req.variables;
 *   return res(
 *     ctx.data({ centralServer })
 *   )
 * })
 */
export const mockDeletePackVariantMutation = (resolver: ResponseResolver<GraphQLRequest<DeletePackVariantMutationVariables>, GraphQLContext<DeletePackVariantMutation>, any>) =>
  graphql.mutation<DeletePackVariantMutation, DeletePackVariantMutationVariables>(
    'deletePackVariant',
    resolver
  )
