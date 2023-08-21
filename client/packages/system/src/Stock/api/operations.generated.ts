import * as Types from '@openmsupply-client/api';

import { GraphQLClient } from 'graphql-request';
import { GraphQLClientRequestHeaders } from 'graphql-request/build/cjs/types';
import gql from 'graphql-tag';
import { LocationRowFragmentDoc } from '../../../../../../packages/system/src/Location/api/operations.generated';
import { graphql, ResponseResolver, GraphQLRequest, GraphQLContext } from 'msw'
export type StockLineRowFragment = { __typename: 'StockLineNode', availableNumberOfPacks: number, batch?: string | null, costPricePerPack: number, expiryDate?: string | null, id: string, itemId: string, locationId?: string | null, locationName?: string | null, onHold: boolean, packSize: number, sellPricePerPack: number, storeId: string, totalNumberOfPacks: number, supplierName?: string | null, barcode?: string | null, location?: { __typename: 'LocationNode', id: string, name: string, onHold: boolean, code: string } | null, item: { __typename: 'ItemNode', code: string, name: string, unitName?: string | null } };

export type RepackStockLineFragment = { __typename: 'RepackStockLineNode', packSize: number, numberOfPacks: number, location?: { __typename: 'LocationNode', id: string, name: string, onHold: boolean, code: string } | null };

export type RepackFragment = { __typename: 'RepackNode', id: string, datetime: string, repackId: string, from: { __typename: 'RepackStockLineNode', packSize: number, numberOfPacks: number, location?: { __typename: 'LocationNode', id: string, name: string, onHold: boolean, code: string } | null }, to: { __typename: 'RepackStockLineNode', packSize: number, numberOfPacks: number, location?: { __typename: 'LocationNode', id: string, name: string, onHold: boolean, code: string } | null } };

export type InvoiceRowFragment = { __typename: 'InvoiceNode', id: string };

export type StockLinesQueryVariables = Types.Exact<{
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  key: Types.StockLineSortFieldInput;
  desc?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
  filter?: Types.InputMaybe<Types.StockLineFilterInput>;
  storeId: Types.Scalars['String']['input'];
}>;


export type StockLinesQuery = { __typename: 'Queries', stockLines: { __typename: 'StockLineConnector', totalCount: number, nodes: Array<{ __typename: 'StockLineNode', availableNumberOfPacks: number, batch?: string | null, costPricePerPack: number, expiryDate?: string | null, id: string, itemId: string, locationId?: string | null, locationName?: string | null, onHold: boolean, packSize: number, sellPricePerPack: number, storeId: string, totalNumberOfPacks: number, supplierName?: string | null, barcode?: string | null, location?: { __typename: 'LocationNode', id: string, name: string, onHold: boolean, code: string } | null, item: { __typename: 'ItemNode', code: string, name: string, unitName?: string | null } }> } };

export type StockLineQueryVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
  storeId: Types.Scalars['String']['input'];
}>;


export type StockLineQuery = { __typename: 'Queries', stockLines: { __typename: 'StockLineConnector', totalCount: number, nodes: Array<{ __typename: 'StockLineNode', availableNumberOfPacks: number, batch?: string | null, costPricePerPack: number, expiryDate?: string | null, id: string, itemId: string, locationId?: string | null, locationName?: string | null, onHold: boolean, packSize: number, sellPricePerPack: number, storeId: string, totalNumberOfPacks: number, supplierName?: string | null, barcode?: string | null, location?: { __typename: 'LocationNode', id: string, name: string, onHold: boolean, code: string } | null, item: { __typename: 'ItemNode', code: string, name: string, unitName?: string | null } }> } };

export type UpdateStockLineMutationVariables = Types.Exact<{
  input: Types.UpdateStockLineInput;
  storeId: Types.Scalars['String']['input'];
}>;


export type UpdateStockLineMutation = { __typename: 'Mutations', updateStockLine: { __typename: 'StockLineNode', availableNumberOfPacks: number, batch?: string | null, costPricePerPack: number, expiryDate?: string | null, id: string, itemId: string, locationId?: string | null, locationName?: string | null, onHold: boolean, packSize: number, sellPricePerPack: number, storeId: string, totalNumberOfPacks: number, supplierName?: string | null, barcode?: string | null, location?: { __typename: 'LocationNode', id: string, name: string, onHold: boolean, code: string } | null, item: { __typename: 'ItemNode', code: string, name: string, unitName?: string | null } } | { __typename: 'UpdateStockLineError' } };

export type RepackQueryVariables = Types.Exact<{
  invoiceId: Types.Scalars['String']['input'];
  storeId: Types.Scalars['String']['input'];
}>;


export type RepackQuery = { __typename: 'Queries', repack: { __typename: 'NodeError' } | { __typename: 'RepackNode', id: string, datetime: string, repackId: string, from: { __typename: 'RepackStockLineNode', packSize: number, numberOfPacks: number, location?: { __typename: 'LocationNode', id: string, name: string, onHold: boolean, code: string } | null }, to: { __typename: 'RepackStockLineNode', packSize: number, numberOfPacks: number, location?: { __typename: 'LocationNode', id: string, name: string, onHold: boolean, code: string } | null } } };

export type RepacksByStockLineQueryVariables = Types.Exact<{
  stockLineId: Types.Scalars['String']['input'];
  storeId: Types.Scalars['String']['input'];
}>;


export type RepacksByStockLineQuery = { __typename: 'Queries', repacksByStockLine: { __typename: 'RepackConnector', totalCount: number, nodes: Array<{ __typename: 'RepackNode', id: string, datetime: string, repackId: string, from: { __typename: 'RepackStockLineNode', packSize: number, numberOfPacks: number, location?: { __typename: 'LocationNode', id: string, name: string, onHold: boolean, code: string } | null }, to: { __typename: 'RepackStockLineNode', packSize: number, numberOfPacks: number, location?: { __typename: 'LocationNode', id: string, name: string, onHold: boolean, code: string } | null } }> } };

export type InsertRepackMutationVariables = Types.Exact<{
  input: Types.InsertRepackInput;
  storeId: Types.Scalars['String']['input'];
}>;


export type InsertRepackMutation = { __typename: 'Mutations', insertRepack: { __typename: 'InsertRepackError', error: { __typename: 'CannotHaveFractionalPack', description: string } | { __typename: 'StockLineReducedBelowZero', description: string } } | { __typename: 'InvoiceNode', id: string } };

export const StockLineRowFragmentDoc = gql`
    fragment StockLineRow on StockLineNode {
  availableNumberOfPacks
  batch
  costPricePerPack
  expiryDate
  id
  itemId
  locationId
  locationName
  onHold
  packSize
  sellPricePerPack
  storeId
  totalNumberOfPacks
  supplierName
  location {
    ...LocationRow
  }
  item {
    code
    name
    unitName
  }
  barcode
}
    ${LocationRowFragmentDoc}`;
export const RepackStockLineFragmentDoc = gql`
    fragment RepackStockLine on RepackStockLineNode {
  location {
    ...LocationRow
  }
  packSize
  numberOfPacks
}
    ${LocationRowFragmentDoc}`;
export const RepackFragmentDoc = gql`
    fragment Repack on RepackNode {
  id
  datetime
  repackId
  from {
    ...RepackStockLine
  }
  to {
    ...RepackStockLine
  }
}
    ${RepackStockLineFragmentDoc}`;
export const InvoiceRowFragmentDoc = gql`
    fragment InvoiceRow on InvoiceNode {
  id
}
    `;
export const StockLinesDocument = gql`
    query stockLines($first: Int, $offset: Int, $key: StockLineSortFieldInput!, $desc: Boolean, $filter: StockLineFilterInput, $storeId: String!) {
  stockLines(
    storeId: $storeId
    filter: $filter
    page: {first: $first, offset: $offset}
    sort: {key: $key, desc: $desc}
  ) {
    ... on StockLineConnector {
      __typename
      nodes {
        __typename
        ...StockLineRow
      }
      totalCount
    }
  }
}
    ${StockLineRowFragmentDoc}`;
export const StockLineDocument = gql`
    query stockLine($id: String!, $storeId: String!) {
  stockLines(storeId: $storeId, filter: {id: {equalTo: $id}}) {
    ... on StockLineConnector {
      __typename
      nodes {
        __typename
        ...StockLineRow
      }
      totalCount
    }
  }
}
    ${StockLineRowFragmentDoc}`;
export const UpdateStockLineDocument = gql`
    mutation updateStockLine($input: UpdateStockLineInput!, $storeId: String!) {
  updateStockLine(input: $input, storeId: $storeId) {
    ... on StockLineNode {
      __typename
      ...StockLineRow
    }
  }
}
    ${StockLineRowFragmentDoc}`;
export const RepackDocument = gql`
    query repack($invoiceId: String!, $storeId: String!) {
  repack(invoiceId: $invoiceId, storeId: $storeId) {
    ... on RepackNode {
      __typename
      ...Repack
    }
  }
}
    ${RepackFragmentDoc}`;
export const RepacksByStockLineDocument = gql`
    query repacksByStockLine($stockLineId: String!, $storeId: String!) {
  repacksByStockLine(stockLineId: $stockLineId, storeId: $storeId) {
    ... on RepackConnector {
      nodes {
        ...Repack
      }
      totalCount
    }
  }
}
    ${RepackFragmentDoc}`;
export const InsertRepackDocument = gql`
    mutation insertRepack($input: InsertRepackInput!, $storeId: String!) {
  insertRepack(input: $input, storeId: $storeId) {
    ... on InvoiceNode {
      __typename
      ...InvoiceRow
    }
    ... on InsertRepackError {
      __typename
      error {
        description
        ... on StockLineReducedBelowZero {
          __typename
          description
        }
        ... on CannotHaveFractionalPack {
          __typename
          description
        }
      }
    }
  }
}
    ${InvoiceRowFragmentDoc}`;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    stockLines(variables: StockLinesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<StockLinesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<StockLinesQuery>(StockLinesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'stockLines', 'query');
    },
    stockLine(variables: StockLineQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<StockLineQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<StockLineQuery>(StockLineDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'stockLine', 'query');
    },
    updateStockLine(variables: UpdateStockLineMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UpdateStockLineMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateStockLineMutation>(UpdateStockLineDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateStockLine', 'mutation');
    },
    repack(variables: RepackQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<RepackQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<RepackQuery>(RepackDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'repack', 'query');
    },
    repacksByStockLine(variables: RepacksByStockLineQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<RepacksByStockLineQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<RepacksByStockLineQuery>(RepacksByStockLineDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'repacksByStockLine', 'query');
    },
    insertRepack(variables: InsertRepackMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<InsertRepackMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<InsertRepackMutation>(InsertRepackDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'insertRepack', 'mutation');
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;

/**
 * @param resolver a function that accepts a captured request and may return a mocked response.
 * @see https://mswjs.io/docs/basics/response-resolver
 * @example
 * mockStockLinesQuery((req, res, ctx) => {
 *   const { first, offset, key, desc, filter, storeId } = req.variables;
 *   return res(
 *     ctx.data({ stockLines })
 *   )
 * })
 */
export const mockStockLinesQuery = (resolver: ResponseResolver<GraphQLRequest<StockLinesQueryVariables>, GraphQLContext<StockLinesQuery>, any>) =>
  graphql.query<StockLinesQuery, StockLinesQueryVariables>(
    'stockLines',
    resolver
  )

/**
 * @param resolver a function that accepts a captured request and may return a mocked response.
 * @see https://mswjs.io/docs/basics/response-resolver
 * @example
 * mockStockLineQuery((req, res, ctx) => {
 *   const { id, storeId } = req.variables;
 *   return res(
 *     ctx.data({ stockLines })
 *   )
 * })
 */
export const mockStockLineQuery = (resolver: ResponseResolver<GraphQLRequest<StockLineQueryVariables>, GraphQLContext<StockLineQuery>, any>) =>
  graphql.query<StockLineQuery, StockLineQueryVariables>(
    'stockLine',
    resolver
  )

/**
 * @param resolver a function that accepts a captured request and may return a mocked response.
 * @see https://mswjs.io/docs/basics/response-resolver
 * @example
 * mockUpdateStockLineMutation((req, res, ctx) => {
 *   const { input, storeId } = req.variables;
 *   return res(
 *     ctx.data({ updateStockLine })
 *   )
 * })
 */
export const mockUpdateStockLineMutation = (resolver: ResponseResolver<GraphQLRequest<UpdateStockLineMutationVariables>, GraphQLContext<UpdateStockLineMutation>, any>) =>
  graphql.mutation<UpdateStockLineMutation, UpdateStockLineMutationVariables>(
    'updateStockLine',
    resolver
  )

/**
 * @param resolver a function that accepts a captured request and may return a mocked response.
 * @see https://mswjs.io/docs/basics/response-resolver
 * @example
 * mockRepackQuery((req, res, ctx) => {
 *   const { invoiceId, storeId } = req.variables;
 *   return res(
 *     ctx.data({ repack })
 *   )
 * })
 */
export const mockRepackQuery = (resolver: ResponseResolver<GraphQLRequest<RepackQueryVariables>, GraphQLContext<RepackQuery>, any>) =>
  graphql.query<RepackQuery, RepackQueryVariables>(
    'repack',
    resolver
  )

/**
 * @param resolver a function that accepts a captured request and may return a mocked response.
 * @see https://mswjs.io/docs/basics/response-resolver
 * @example
 * mockRepacksByStockLineQuery((req, res, ctx) => {
 *   const { stockLineId, storeId } = req.variables;
 *   return res(
 *     ctx.data({ repacksByStockLine })
 *   )
 * })
 */
export const mockRepacksByStockLineQuery = (resolver: ResponseResolver<GraphQLRequest<RepacksByStockLineQueryVariables>, GraphQLContext<RepacksByStockLineQuery>, any>) =>
  graphql.query<RepacksByStockLineQuery, RepacksByStockLineQueryVariables>(
    'repacksByStockLine',
    resolver
  )

/**
 * @param resolver a function that accepts a captured request and may return a mocked response.
 * @see https://mswjs.io/docs/basics/response-resolver
 * @example
 * mockInsertRepackMutation((req, res, ctx) => {
 *   const { input, storeId } = req.variables;
 *   return res(
 *     ctx.data({ insertRepack })
 *   )
 * })
 */
export const mockInsertRepackMutation = (resolver: ResponseResolver<GraphQLRequest<InsertRepackMutationVariables>, GraphQLContext<InsertRepackMutation>, any>) =>
  graphql.mutation<InsertRepackMutation, InsertRepackMutationVariables>(
    'insertRepack',
    resolver
  )
