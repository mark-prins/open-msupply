import { useEffect, useRef } from 'react';
import { AppRoute } from '@openmsupply-client/config';
import { UserPermission } from '../../types/schema';
import { AuthError, useAuthContext } from '../AuthContext';
import { useLocalStorage } from '../../localStorage';
import { useNavigate } from 'react-router-dom';
import { RouteBuilder } from '../../utils/navigation';

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
    navigate(RouteBuilder.create(AppRoute.Dashboard).build());
  }
};
