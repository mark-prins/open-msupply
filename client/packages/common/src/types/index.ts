export * from './exceptions';
export * from './utility';

export enum AppRouteCommon {
  Initialise = 'initialise',
  Discovery = 'discovery',
}

export enum AuthError {
  NoStoreAssigned = 'NoStoreAssigned',
  PermissionDenied = 'Forbidden',
  ServerError = 'ServerError',
  Unauthenticated = 'Unauthenticated',
  Timeout = 'Timeout',
}