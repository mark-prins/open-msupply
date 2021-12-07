import React, { FC } from 'react';
import { CircularProgress, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { useTranslation } from '@common/intl';
const Container = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
});

const StyledText = styled(Typography)(({ theme }) => ({
  text: {
    marginTop: theme.spacing(3),
  },
}));

export const BasicSpinner: FC = () => {
  const t = useTranslation('app');
  return (
    <Container>
      <CircularProgress />
      <StyledText>{t('loading')}</StyledText>
    </Container>
  );
};
