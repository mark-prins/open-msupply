import { AlertIcon } from '@common/icons';
import { Box, Typography } from '@mui/material';
import React from 'react';
import { InfoTooltipIcon } from '../popover';

export type ErrorWithDetailsProps = {
  error: string;
  details: string;
};

export const ErrorWithDetails: React.FC<ErrorWithDetailsProps> = ({
  error,
  details,
}) => (
  <Box
    display="flex"
    sx={{ color: 'error.main' }}
    gap={1}
    justifyContent="center"
  >
    <Box display="flex" flexWrap="wrap" alignContent="center">
      <AlertIcon />
    </Box>
    <Box sx={{ '& > div': { display: 'inline-block' } }}>
      <Typography sx={{ color: 'inherit' }} component="span">
        {error}
      </Typography>
      <InfoTooltipIcon title={details} />
    </Box>
  </Box>
);
