import React, { FC, useState } from 'react';
import { CloseIcon, SearchIcon } from '@common/icons';
import { useUrlQuery } from '@common/hooks';
import { InlineSpinner } from '../../loading';
import { Box } from '@mui/material';
import {
  IconButton,
  InputAdornment,
  DropdownMenu,
  DropdownMenuItem,
} from '@common/components';
import { useTranslation } from '@common/intl';
import { TextFilter, TextFilterDefinition } from './TextFilter';
import { EnumFilter, EnumFilterDefinition } from './EnumFilter';

// type FilterType = 'text' | 'enum' | 'date' | 'dateTime' | 'number';

export interface FilterDefinitionCommon {
  name: string;
  urlParameter: string;
  placeholder: string;
}

type FilterDefinition = TextFilterDefinition | EnumFilterDefinition;

interface FilterDefinitions {
  filters: FilterDefinition[];
}

const RESET_KEYWORD = 'RESET';

export const FilterRoot: FC<FilterDefinitions> = ({ filters }) => {
  const { urlQuery, updateQuery } = useUrlQuery();
  const [activeFilters, setActiveFilters] = useState<FilterDefinition[]>(
    filters.filter(fil => Object.keys(urlQuery).includes(fil.urlParameter))
  );

  const filterOptions = getFilterOptions(filters, activeFilters);

  const handleSelect = (selected: string) => {
    if (selected === RESET_KEYWORD) {
      const queryPatch = Object.fromEntries(
        activeFilters.map(({ urlParameter }) => [urlParameter, ''])
      );
      updateQuery(queryPatch);
      setActiveFilters([]);
      return;
    }
    const selectedFilter = filters.find(fil => fil.urlParameter === selected);
    if (selectedFilter)
      setActiveFilters(current => [...current, selectedFilter]);
  };

  const removeFilter = (filterDefinition: FilterDefinition) => {
    const newActiveFilters = activeFilters.filter(
      fil => fil.urlParameter !== filterDefinition.urlParameter
    );
    updateQuery({ [filterDefinition.urlParameter]: '' });
    setActiveFilters(newActiveFilters);
  };

  return (
    <Box display="flex" gap={2} sx={{ alignItems: 'flex-end', minHeight: 50 }}>
      <DropdownMenu label="Filters">
        {filterOptions.map(option => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleSelect(option.value)}
            sx={{ fontSize: 14 }}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenu>
      {activeFilters.map(filter => getFilterComponent(filter, removeFilter))}
    </Box>
  );
};

const getFilterOptions = (
  filters: FilterDefinition[],
  activeFilters: FilterDefinition[]
) => {
  const activeFilterCodes = activeFilters.map(fil => fil.urlParameter);

  const filterOptions = filters
    .filter(fil => !activeFilterCodes.includes(fil.urlParameter))
    .map(fil => ({ label: fil.name, value: fil.urlParameter }));

  if (activeFilterCodes.length > 0)
    filterOptions.push({ label: 'Clear all filters', value: RESET_KEYWORD });
  return filterOptions;
};

const getFilterComponent = (
  filter: FilterDefinition,
  removeFilter: (filter: FilterDefinition) => void
) => {
  switch (filter.type) {
    case 'text':
      return (
        <TextFilter
          filterDefinition={filter}
          remove={() => removeFilter(filter)}
        />
      );
    case 'enum':
      return (
        <EnumFilter
          filterDefinition={filter}
          remove={() => removeFilter(filter)}
        />
      );
    default:
      return null;
  }
};

export const EndAdornment: FC<{
  isLoading: boolean;
  hasValue: boolean;
  onClear: () => void;
}> = ({ hasValue, isLoading, onClear }) => {
  const t = useTranslation();
  if (isLoading) return <InlineSpinner />;

  return (
    <InputAdornment position="end">
      <IconButton
        sx={{ color: 'gray.main' }}
        label={t('label.clear-filter')}
        onClick={onClear}
        icon={hasValue ? <CloseIcon /> : <SearchIcon fontSize="small" />}
      />
    </InputAdornment>
  );
};
