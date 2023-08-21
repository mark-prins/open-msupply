import { useEffect, useRef } from 'react';
import { UserPermission } from '../../types/schema';
import {  useAuthContext } from '../AuthContext';
import { useLocalStorage } from '@openmsupply-client/common';
import { useNavigate } from 'react-router-dom';
import { RouteBuilder } from '@common/utils';
import { AuthError } from '@common/types';

export const usePermissionCheck = (permission: UserPermission) => {
  const { userHasPermission } = useAuthContext();
  const navigate = useNavigate();
  const [error, setError] = useLocalStorage('/auth/error');
  const previous = useRef(error);

  useEffect(() => {
    if (!userHasPermission(permission)) {
      setError(AuthError.PermissionDenied);
    }
  }, []);

  useEffect(() => {
    previous.current = error;
  }, [error]);

  if (previous.current === AuthError.PermissionDenied && !error) {
    navigate(RouteBuilder.create('/').build());
  }
};
