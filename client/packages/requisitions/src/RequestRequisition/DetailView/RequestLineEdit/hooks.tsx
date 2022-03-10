import { useState, useEffect } from 'react';
import { generateUUID, suggestedQuantity } from '@openmsupply-client/common';
import {
  useSaveRequestLines,
  useRequest,
  useRequestLines,
  RequestLineFragment,
  ItemWithStatsFragment,
  RequestFragment,
} from '../../api';

export type DraftRequestLine = Omit<
  RequestLineFragment,
  '__typename' | 'item'
> & {
  isCreated: boolean;
  requisitionId: string;
};

const createDraftFromItem = (
  item: ItemWithStatsFragment,
  request: RequestFragment
): DraftRequestLine => {
  const { stats } = item;
  const { averageMonthlyConsumption, availableStockOnHand } = stats;
  const suggested = suggestedQuantity(
    averageMonthlyConsumption,
    availableStockOnHand,
    request.maxMonthsOfStock
  );

  return {
    id: generateUUID(),
    requisitionId: request.id,
    itemId: item.id,
    requestedQuantity: suggested,
    suggestedQuantity: suggested,
    isCreated: true,
    itemStats: item.stats,
  };
};

const createDraftFromRequestLine = (
  line: RequestLineFragment,
  request: RequestFragment
): DraftRequestLine => ({
  ...line,
  requisitionId: request.id,
  itemId: line.item.id,
  requestedQuantity: line.requestedQuantity ?? line.suggestedQuantity,
  suggestedQuantity: line.suggestedQuantity,
  isCreated: false,
  itemStats: line.itemStats,
});

export const useDraftRequisitionLine = (item: ItemWithStatsFragment | null) => {
  const { lines } = useRequestLines();
  const { data } = useRequest();
  const { mutate: save, isLoading } = useSaveRequestLines();

  const [draft, setDraft] = useState<DraftRequestLine | null>(null);

  useEffect(() => {
    if (lines && item && data) {
      const existingLine = lines.find(
        ({ item: reqItem }) => reqItem.id === item.id
      );
      if (existingLine) {
        setDraft(createDraftFromRequestLine(existingLine, data));
      } else {
        setDraft(createDraftFromItem(item, data));
      }
    } else {
      setDraft(null);
    }
  }, [lines, item, data]);

  const update = (patch: Partial<DraftRequestLine>) => {
    if (draft) {
      setDraft({ ...draft, ...patch });
    }
  };

  return { draft, isLoading, save: () => draft && save(draft), update };
};

export const useNextRequestLine = (
  currentItem: ItemWithStatsFragment | null
) => {
  const { lines } = useRequestLines();

  const nextState: {
    hasNext: boolean;
    next: null | ItemWithStatsFragment;
  } = { hasNext: true, next: null };
  const idx = lines.findIndex(l => l.item.id === currentItem?.id);
  const next = lines[idx + 1];
  if (!next) {
    nextState.hasNext = false;
    return nextState;
  }

  nextState.next = next.item;

  return nextState;
};
