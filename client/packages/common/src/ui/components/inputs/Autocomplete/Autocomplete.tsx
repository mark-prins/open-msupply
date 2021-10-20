import React, { PropsWithChildren } from 'react';
import {
  Autocomplete as MuiAutocomplete,
  AutocompleteRenderInputParams,
  createFilterOptions,
  CreateFilterOptionsConfig,
} from '@mui/material';
import {
  AutocompleteOption,
  AutocompleteOnChange,
  AutocompleteOptionRenderer,
} from './types';
import { BasicTextInput } from '../TextInput';
export interface AutocompleteProps<T> {
  defaultValue?: T;
  getOptionDisabled?: (option: T) => boolean;
  filterOptionConfig?: CreateFilterOptionsConfig<T>;
  loading?: boolean;
  loadingText?: React.ReactNode;
  noOptionsText?: React.ReactNode;
  onChange?: AutocompleteOnChange<T>;
  options: readonly T[];
  width?: number;
  renderInput?: (params: AutocompleteRenderInputParams) => React.ReactNode;
  renderOption?: AutocompleteOptionRenderer<T>;
  value?: AutocompleteOption<T>;
  clearable?: boolean;
  isOptionEqualToValue?: (option: T, value: T) => boolean;
}

export function Autocomplete<T>({
  defaultValue,
  filterOptionConfig,
  getOptionDisabled,
  loading,
  loadingText,
  noOptionsText,
  onChange,
  options,
  renderInput,
  renderOption,
  width,
  value,
  isOptionEqualToValue,
  clearable = true,
}: PropsWithChildren<AutocompleteProps<T>>): JSX.Element {
  const filterOptions = createFilterOptions(filterOptionConfig);

  const defaultRenderInput = (props: AutocompleteRenderInputParams) => (
    <BasicTextInput
      {...props}
      InputProps={{ disableUnderline: false, ...props.InputProps }}
      sx={{ width: width ? `${width}px` : 'auto' }}
    />
  );

  return (
    <MuiAutocomplete
      isOptionEqualToValue={isOptionEqualToValue}
      defaultValue={defaultValue}
      disableClearable={!clearable}
      value={value}
      getOptionDisabled={getOptionDisabled}
      filterOptions={filterOptions}
      loading={loading}
      loadingText={loadingText}
      noOptionsText={noOptionsText}
      options={options}
      size="small"
      renderInput={renderInput || defaultRenderInput}
      renderOption={renderOption}
      onChange={onChange}
    />
  );
}