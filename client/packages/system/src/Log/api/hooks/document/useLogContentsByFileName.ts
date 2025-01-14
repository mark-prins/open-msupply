import { useMutation } from 'react-query';
import { useLogApi } from '../utils/useLogApi';

export const useLogContentsByFileName = () => {
  const api = useLogApi();

  return useMutation(async (fileName: string) => {
    return await api.get.logContentsByFileName({ fileName });
  });
};
