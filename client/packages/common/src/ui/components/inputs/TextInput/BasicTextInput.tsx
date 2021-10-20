import React, { FC } from 'react';
import { StandardTextFieldProps, TextField } from '@mui/material';

/**
 * Very basic TextInput component with some simple styling applied where you can
 * build your input on top.
 */

export const BasicTextInput: FC<StandardTextFieldProps> = React.forwardRef(
  ({ sx, InputProps, ...props }, ref) => (
    <TextField
      ref={ref}
      sx={{
        '& .MuiInput-underline:before': { borderBottomWidth: 0 },
        '& .MuiInput-input': { color: theme => theme.palette.darkGrey.main },
        ...sx,
      }}
      variant="standard"
      size="small"
      InputProps={{
        disableUnderline: true,
        sx: {
          backgroundColor: theme => theme.palette.background.menu,
          borderRadius: '8px',
          padding: '4px 8px',
        },
        ...InputProps,
      }}
      {...props}
    />
  )
);