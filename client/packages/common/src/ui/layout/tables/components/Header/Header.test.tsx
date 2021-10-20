import React, { FC } from 'react';
import { render } from '@testing-library/react';
import { HeaderCell, HeaderRow } from './Header';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import { useColumns } from '../..';
import { Item, TestingProvider } from '../../../../..';

describe('HeaderRow', () => {
  const Example: FC<{
    onChangeSortBy: () => void;
    sortBy: { key: keyof Item; direction: 'asc' | 'desc' };
  }> = ({ onChangeSortBy, sortBy }) => {
    const [column1, column2] = useColumns(
      ['name', ['packSize', { sortable: false }]],
      { onChangeSortBy, sortBy },
      [sortBy]
    );

    if (!column1 || !column2) return null;

    return (
      <table>
        <thead>
          <HeaderRow>
            <HeaderCell column={column1} />
            <HeaderCell column={column2} />
          </HeaderRow>
        </thead>
      </table>
    );
  };

  it('renders the cells passed', () => {
    const onSortBy = jest.fn();
    const sortBy = { key: 'packSize', direction: 'asc' as 'asc' | 'desc' };

    const { getByRole } = render(
      <TestingProvider>
        <Example onChangeSortBy={onSortBy} sortBy={sortBy} />
      </TestingProvider>
    );

    const nameHeader = getByRole('columnheader', { name: /name/i });
    const packSizeHeader = getByRole('columnheader', { name: /packSize/i });

    expect(nameHeader).toBeInTheDocument();
    expect(packSizeHeader).toBeInTheDocument();
  });

  it('renders a button when the header is sortable, and no button otherwise', () => {
    const onSortBy = jest.fn();
    const sortBy = { key: 'packSize', direction: 'asc' as 'asc' | 'desc' };

    const { getByRole, queryByRole } = render(
      <TestingProvider>
        <Example onChangeSortBy={onSortBy} sortBy={sortBy} />
      </TestingProvider>
    );

    const nameHeader = getByRole('button', { name: /name/i });
    const packSizeHeader = queryByRole('button', { name: /pack size/i });

    expect(nameHeader).toBeInTheDocument();
    expect(packSizeHeader).not.toBeInTheDocument();
  });

  it('calls the provided sortBy function when the sort button is pressed', () => {
    const onSortBy = jest.fn();
    const sortBy = { key: 'packSize', direction: 'asc' as 'asc' | 'desc' };

    const { getByRole } = render(
      <TestingProvider>
        <Example onChangeSortBy={onSortBy} sortBy={sortBy} />
      </TestingProvider>
    );

    const nameHeader = getByRole('button', { name: /name/i });

    act(() => userEvent.click(nameHeader));

    expect(onSortBy).toBeCalledTimes(1);
  });

  it('calls the provided sortBy function with the values of the column', () => {
    const onSortBy = jest.fn();
    const sortBy = { key: 'packSize', direction: 'asc' as 'asc' | 'desc' };

    const { getByRole } = render(
      <TestingProvider>
        <Example onChangeSortBy={onSortBy} sortBy={sortBy} />
      </TestingProvider>
    );

    const idHeader = getByRole('button', { name: /name/i });

    act(() => userEvent.click(idHeader));

    expect(onSortBy).toBeCalledWith(expect.objectContaining({ key: 'name' }));
  });
});