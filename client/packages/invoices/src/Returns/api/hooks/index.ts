import { Document } from './document';
import { Lines } from './line';
import { Utils } from './utils';

export const useReturns = {
  document: {
    listInbound: Document.useInbounds,
    listAllInbound: Document.useInboundsAll,
    listOutbound: Document.useOutbounds,
    listAllOutbound: Document.useOutboundsAll,
    outboundReturn: Document.useOutboundReturn,
    inboundReturn: Document.useInboundReturn,

    insertOutboundReturn: Document.useInsertOutboundReturn,
    updateOutboundReturn: Document.useUpdateOutboundReturn,
    deleteOutboundRows: Document.useOutboundDeleteRows,

    insertInboundReturn: Document.useInsertInboundReturn,
    deleteInbound: Document.useInboundReturnDelete,
    deleteInboundRows: Document.useInboundDeleteRows,
  },
  lines: {
    outboundReturnLines: Lines.useOutboundReturnLines,
    updateOutboundLines: Lines.useUpdateOutboundReturnLines,

    generateInboundReturnLines: Lines.useGenerateInboundReturnLines,
    inboundReturnRows: Lines.useInboundReturnRows,
    deleteSelectedInboundLines: Lines.useDeleteSelectedInboundReturnLines,
  },
  utils: {
    api: Utils.useReturnsApi,
    inboundIsDisabled: Utils.useInboundReturnIsDisabled,
  },
};
