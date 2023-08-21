import {
  COOKIE_LIFETIME_MINUTES,
  getAuthCookie,
  setAuthCookie,
} from '../../../authentication';
import { useGql } from '../../../api';
import { useGetRefreshToken } from './useGetRefreshToken';
import { DateUtils } from '@common/intl';

export const useRefreshToken = () => {
  const { mutateAsync } = useGetRefreshToken();
  const {
    setHeader,
    client: { getLastRequestTime },
  } = useGql();

  const refreshToken = () => {
    const authCookie = getAuthCookie();
    // authCookie.expires reports as Date but is actually a string
    const expires = DateUtils.getDateOrNull(authCookie?.expires?.toString());

    const expiresIn = expires
      ? DateUtils.differenceInMinutes(expires, Date.now(), {
          roundingMethod: 'ceil',
        })
      : 0;

    const minutesSinceLastRequest = DateUtils.differenceInMinutes(
      Date.now(),
      getLastRequestTime()
    );

    const expiresSoon = expiresIn === 1 || expiresIn === 2;

    if (expiresSoon && minutesSinceLastRequest < COOKIE_LIFETIME_MINUTES) {
      mutateAsync().then(data => {
        const token = data?.token ?? '';
        const newCookie = { ...authCookie, token };
        setAuthCookie(newCookie);
        setHeader('Authorization', `Bearer ${token}`);
      });
    }
  };
  return { refreshToken };
};
