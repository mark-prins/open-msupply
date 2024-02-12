import React, { useCallback } from 'react';
import {
  TableProvider,
  createTableStore,
  useEditModal,
  DetailViewSkeleton,
  AlertModal,
  RouteBuilder,
  useNavigate,
  useTranslation,
  DetailTabs,
  useRowHighlight,
} from '@openmsupply-client/common';
import { ItemRowFragment, ActivityLogList } from '@openmsupply-client/system';
import { Toolbar } from './Toolbar';
import { Footer } from './Footer';
import { AppBarButtons } from './AppBarButtons';
import { SidePanel } from './SidePanel';
import { StocktakeSummaryItem } from '../../types';
import { StocktakeLineEdit } from './modal/StocktakeLineEdit';
import { ContentArea } from './ContentArea';
import { AppRoute } from '@openmsupply-client/config';
import { StocktakeFragment, StocktakeLineFragment, useStocktake } from '../api';
import { StocktakeLineErrorProvider } from '../context';

const StocktakeTabs = ({
  id,
  onOpen,
}: {
  id: string | undefined;
  onOpen: (item?: ItemRowFragment | null | undefined) => void;
}) => {
  const isDisabled = useStocktake.utils.isDisabled();

  const onRowClick = useCallback(
    (item: StocktakeLineFragment | StocktakeSummaryItem) => {
      if (item.item) onOpen(item.item);
    },
    [onOpen]
  );

  const tabs = [
    {
      Component: (
        <ContentArea
          onRowClick={!isDisabled ? onRowClick : null}
          onAddItem={() => onOpen()}
        />
      ),
      value: 'Details',
    },
    {
      Component: <ActivityLogList recordId={id ?? ''} />,
      value: 'Log',
    },
  ];
  return <DetailTabs tabs={tabs} />;
};

const DetailViewComponent = ({
  stocktake,
  onOpen,
}: {
  stocktake: StocktakeFragment;
  onOpen: () => void;
}) => {
  const { HighlightStyles } = useRowHighlight();

  return (
    <>
      <HighlightStyles />
      <AppBarButtons onAddItem={() => onOpen()} />

      <Footer />
      <SidePanel />

      <Toolbar />

      <StocktakeTabs id={stocktake?.id} onOpen={onOpen} />
    </>
  );
};

export const DetailView = () => {
  const { data: stocktake, isLoading } = useStocktake.document.get();
  const t = useTranslation('inventory');
  const navigate = useNavigate();
  const { isOpen, entity, onOpen, onClose, mode } =
    useEditModal<ItemRowFragment>();

  if (isLoading) return <DetailViewSkeleton hasGroupBy={true} hasHold={true} />;

  if (!stocktake?.lines || !stocktake)
    return (
      <AlertModal
        open={true}
        onOk={() =>
          navigate(
            RouteBuilder.create(AppRoute.Inventory)
              .addPart(AppRoute.Stocktakes)
              .build()
          )
        }
        title={t('error.stocktake-not-found')}
        message={t('messages.click-to-return')}
      />
    );

  return (
    <StocktakeLineErrorProvider>
      <TableProvider createStore={createTableStore}>
        <DetailViewComponent stocktake={stocktake} onOpen={onOpen} />;
        {isOpen && (
          <StocktakeLineEdit
            isOpen={isOpen}
            onClose={onClose}
            mode={mode}
            item={entity}
          />
        )}
      </TableProvider>
    </StocktakeLineErrorProvider>
  );
};
