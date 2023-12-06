import * as Types from '@openmsupply-client/common';

import { GraphQLClient } from 'graphql-request';
import { GraphQLClientRequestHeaders } from 'graphql-request/build/cjs/types';
import gql from 'graphql-tag';
import { graphql, ResponseResolver, GraphQLRequest, GraphQLContext } from 'msw'
export type DisplaySettingsQueryVariables = Types.Exact<{
  input: Types.DisplaySettingsHash;
}>;


export type DisplaySettingsQuery = { __typename: 'Queries', displaySettings: { __typename: 'DisplaySettingsNode', customTheme?: { __typename: 'DisplaySettingNode', value: string, hash: string } | null, customLogo?: { __typename: 'DisplaySettingNode', value: string, hash: string } | null } };

export type PluginsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type PluginsQuery = { __typename: 'Queries', plugins: Array<{ __typename: 'PluginNode', config: string, name: string, path: string }> };

export type UpdateDisplaySettingsMutationVariables = Types.Exact<{
  displaySettings: Types.DisplaySettingsInput;
}>;


export type UpdateDisplaySettingsMutation = { __typename: 'Mutations', updateDisplaySettings: { __typename: 'UpdateDisplaySettingsError', error: string } | { __typename: 'UpdateResult', theme?: string | null, logo?: string | null } };


export const DisplaySettingsDocument = gql`
    query displaySettings($input: DisplaySettingsHash!) {
  displaySettings(input: $input) {
    customTheme {
      value
      hash
    }
    customLogo {
      value
      hash
    }
  }
}
    `;
export const PluginsDocument = gql`
    query plugins {
  plugins {
    config
    name
    path
  }
}
    `;
export const UpdateDisplaySettingsDocument = gql`
    mutation updateDisplaySettings($displaySettings: DisplaySettingsInput!) {
  updateDisplaySettings(input: $displaySettings) {
    __typename
    ... on UpdateResult {
      __typename
      theme
      logo
    }
    ... on UpdateDisplaySettingsError {
      __typename
      error
    }
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    displaySettings(variables: DisplaySettingsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<DisplaySettingsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<DisplaySettingsQuery>(DisplaySettingsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'displaySettings', 'query');
    },
    plugins(variables?: PluginsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<PluginsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<PluginsQuery>(PluginsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'plugins', 'query');
    },
    updateDisplaySettings(variables: UpdateDisplaySettingsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UpdateDisplaySettingsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateDisplaySettingsMutation>(UpdateDisplaySettingsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateDisplaySettings', 'mutation');
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;

/**
 * @param resolver a function that accepts a captured request and may return a mocked response.
 * @see https://mswjs.io/docs/basics/response-resolver
 * @example
 * mockDisplaySettingsQuery((req, res, ctx) => {
 *   const { input } = req.variables;
 *   return res(
 *     ctx.data({ displaySettings })
 *   )
 * })
 */
export const mockDisplaySettingsQuery = (resolver: ResponseResolver<GraphQLRequest<DisplaySettingsQueryVariables>, GraphQLContext<DisplaySettingsQuery>, any>) =>
  graphql.query<DisplaySettingsQuery, DisplaySettingsQueryVariables>(
    'displaySettings',
    resolver
  )

/**
 * @param resolver a function that accepts a captured request and may return a mocked response.
 * @see https://mswjs.io/docs/basics/response-resolver
 * @example
 * mockPluginsQuery((req, res, ctx) => {
 *   return res(
 *     ctx.data({ plugins })
 *   )
 * })
 */
export const mockPluginsQuery = (resolver: ResponseResolver<GraphQLRequest<PluginsQueryVariables>, GraphQLContext<PluginsQuery>, any>) =>
  graphql.query<PluginsQuery, PluginsQueryVariables>(
    'plugins',
    resolver
  )

/**
 * @param resolver a function that accepts a captured request and may return a mocked response.
 * @see https://mswjs.io/docs/basics/response-resolver
 * @example
 * mockUpdateDisplaySettingsMutation((req, res, ctx) => {
 *   const { displaySettings } = req.variables;
 *   return res(
 *     ctx.data({ updateDisplaySettings })
 *   )
 * })
 */
export const mockUpdateDisplaySettingsMutation = (resolver: ResponseResolver<GraphQLRequest<UpdateDisplaySettingsMutationVariables>, GraphQLContext<UpdateDisplaySettingsMutation>, any>) =>
  graphql.mutation<UpdateDisplaySettingsMutation, UpdateDisplaySettingsMutationVariables>(
    'updateDisplaySettings',
    resolver
  )
