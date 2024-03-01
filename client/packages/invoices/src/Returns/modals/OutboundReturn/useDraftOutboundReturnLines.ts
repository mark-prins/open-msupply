import React, { useEffect } from 'react';
import {
  FnUtils,
  OutboundReturnLineNode,
  OutboundReturnLineInput,
  RecordPatch,
} from '@openmsupply-client/common';
import { useReturns } from '../../api';

export const useDraftOutboundReturnLines = ({
  stockLineIds,
  supplierId,
  itemId,
  returnId,
}: {
  stockLineIds: string[];
  supplierId: string;
  itemId?: string;
  returnId?: string;
}) => {
  const [draftLines, setDraftLines] = React.useState<OutboundReturnLineNode[]>(
    []
  );

  const data = useReturns.lines.outboundReturnLines(stockLineIds, itemId);
  const lines = data?.nodes;

  const { mutateAsync: insert } = useReturns.document.insertOutboundReturn();
  const { mutateAsync: updateLines } = useReturns.lines.updateOutboundLines();

  useEffect(() => {
    const newDraftLines = (lines ?? []).map(seed => ({ ...seed }));

    setDraftLines(newDraftLines);
  }, [lines]);

  const update = (patch: RecordPatch<OutboundReturnLineNode>) => {
    setDraftLines(currLines => {
      const newLines = currLines.map(line => {
        if (line.id !== patch.id) {
          return line;
        }
        return { ...line, ...patch };
      });
      return newLines;
    });
  };

  const save = async () => {
    const outboundReturnLines: OutboundReturnLineInput[] = draftLines.map(
      line => {
        const { id, reasonId, numberOfPacksToReturn, stockLineId, note } = line;
        return { id, stockLineId, reasonId, note, numberOfPacksToReturn };
      }
    );

    if (!returnId) {
      await insert({
        id: FnUtils.generateUUID(),
        supplierId,
        outboundReturnLines,
      });
    } else {
      await updateLines({
        outboundReturnId: returnId,
        outboundReturnLines,
      });
    }

    // TODO: error handling here
    // also need to consider what we do if the error was on the first page of the wizard
  };

  return { lines: draftLines, update, save };
};
