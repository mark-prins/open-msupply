import React, { FC, ReactNode } from 'react';
import { TestingProvider } from '../../utils/testing';
import { useTheme } from '../../styles';
import { renderHook } from '@testing-library/react-hooks';
import { useQueryParams } from './useQueryParams';
import { act } from 'react-dom/test-utils';

type TestSortBy = {
  id: string;
  quantity: number;
};

type ThemeChangererProps = {
  paginationRowHeight: number;
  dataRowHeight: number;
  headerRowHeight: number;
  footerHeight: number;
  saveButtonRowHeight: number;
};

describe('useQueryParams', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  const ThemeChangerer: FC<ThemeChangererProps> = ({
    children,
    paginationRowHeight,
    dataRowHeight,
    headerRowHeight,
    footerHeight,
    saveButtonRowHeight,
  }) => {
    const theme = useTheme();
    theme.mixins.table.dataRow = { height: dataRowHeight };
    theme.mixins.table.paginationRow = { height: paginationRowHeight };
    theme.mixins.table.headerRow = { height: headerRowHeight };
    theme.mixins.footer = { height: footerHeight };
    theme.mixins.saveButtonRow = { height: saveButtonRowHeight };

    return <>{children}</>;
  };

  const getWrapper =
    (
      dataRowHeight = 10,
      headerRowHeight = 0,
      paginationRowHeight = 0,
      footerHeight = 0,
      saveButtonRowHeight = 0
    ) =>
    ({ children }: { children: ReactNode[] }) => {
      return (
        <TestingProvider>
          <ThemeChangerer
            paginationRowHeight={paginationRowHeight}
            dataRowHeight={dataRowHeight}
            headerRowHeight={headerRowHeight}
            footerHeight={footerHeight}
            saveButtonRowHeight={saveButtonRowHeight}
          >
            {children}
          </ThemeChangerer>
        </TestingProvider>
      );
    };

  it('Returns the correct initial state', () => {
    window.resizeTo(1000, 1000);

    const { result } = renderHook(
      () => useQueryParams<TestSortBy>({ key: 'id' }),
      {
        wrapper: getWrapper(),
      }
    );

    expect(result.current).toEqual(
      expect.objectContaining({
        sortBy: { key: 'id', isDesc: false, direction: 'asc' },
        pagination: expect.objectContaining({ page: 0, offset: 0, first: 100 }),
        page: 0,
        offset: 0,
        first: 100,
      })
    );
  });

  it('when the number of rows changes to be more than the amount of data cached, the pagination first value changes', () => {
    window.resizeTo(1000, 1000);

    const { result } = renderHook(
      () => useQueryParams<TestSortBy>({ key: 'id' }),
      {
        wrapper: getWrapper(),
      }
    );

    act(() => {
      window.resizeTo(2000, 2000);
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current).toEqual(
      expect.objectContaining({
        sortBy: { key: 'id', isDesc: false, direction: 'asc' },
        pagination: expect.objectContaining({ page: 0, offset: 0, first: 200 }),
        page: 0,
        offset: 0,
        first: 200,
      })
    );
  });

  it('when the number of rows changes to be less than the amount of data cached, the pagination first value does not change', () => {
    window.resizeTo(1000, 1000);

    const { result } = renderHook(
      () => useQueryParams<TestSortBy>({ key: 'id' }),
      {
        wrapper: getWrapper(),
      }
    );

    act(() => {
      window.resizeTo(500, 500);
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current).toEqual(
      expect.objectContaining({
        sortBy: { key: 'id', isDesc: false, direction: 'asc' },
        pagination: expect.objectContaining({ page: 0, offset: 0, first: 100 }),
        page: 0,
        offset: 0,
        first: 100,
      })
    );
  });
});