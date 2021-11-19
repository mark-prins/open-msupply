import {
  InvoiceNodeStatus,
  UpdateOutboundShipmentInput,
  InvoicesQuery,
  SortBy,
  ListApi,
  InvoiceSortFieldInput,
  InvoicesQueryVariables,
  InvoiceRow,
  InvoicePriceResponse,
  OmSupplyApi,
} from '@openmsupply-client/common';
import { Invoice } from '../../types';

const invoiceToInput = (
  patch: Partial<Invoice> & { id: string }
): UpdateOutboundShipmentInput => {
  return {
    id: patch.id,
    color: patch.color,
    comment: patch.comment,
    status: patch.status as InvoiceNodeStatus,
    onHold: patch.onHold,
    otherPartyId: patch.otherParty?.id,
    theirReference: patch.theirReference,
  };
};

const getSortKey = (sortBy: SortBy<InvoiceRow>): InvoiceSortFieldInput => {
  switch (sortBy.key) {
    case 'allocatedDatetime': {
      return InvoiceSortFieldInput.ConfirmDatetime;
    }
    case 'entryDatetime': {
      return InvoiceSortFieldInput.EntryDatetime;
    }
    case 'finalisedDateTime': {
      return InvoiceSortFieldInput.FinalisedDateTime;
    }
    case 'comment': {
      return InvoiceSortFieldInput.Comment;
    }
    case 'invoiceNumber': {
      return InvoiceSortFieldInput.InvoiceNumber;
    }
    case 'otherPartyName': {
      return InvoiceSortFieldInput.OtherPartyName;
    }
    case 'totalAfterTax': {
      return InvoiceSortFieldInput.TotalAfterTax;
    }
    case 'status':
    default: {
      return InvoiceSortFieldInput.Status;
    }
  }
};

const getSortDesc = (sortBy: SortBy<InvoiceRow>): boolean => {
  return !!sortBy.isDesc;
};

const pricingGuard = (pricing: InvoicePriceResponse) => {
  if (pricing.__typename === 'InvoicePricingNode') {
    return pricing;
  } else if (pricing.__typename === 'NodeError') {
    throw new Error(pricing.error.description);
  } else {
    throw new Error('Unknown');
  }
};

const invoicesGuard = (invoicesQuery: InvoicesQuery) => {
  if (invoicesQuery.invoices.__typename === 'InvoiceConnector') {
    return invoicesQuery.invoices;
  }

  throw new Error(invoicesQuery.invoices.error.description);
};

export const getInboundShipmentListViewApi = (
  api: OmSupplyApi
): ListApi<InvoiceRow> => ({
  onRead: ({ first, offset, sortBy, filterBy }) => {
    const queryParams: InvoicesQueryVariables = {
      first,
      offset,
      key: getSortKey(sortBy),
      desc: getSortDesc(sortBy),
      filter: filterBy,
    };
    return async (): Promise<{ nodes: InvoiceRow[]; totalCount: number }> => {
      const result = await api.invoices(queryParams);

      const invoices = invoicesGuard(result);

      const nodes = invoices.nodes.map(invoice => ({
        ...invoice,
        pricing: pricingGuard(invoice.pricing),
      }));

      return { nodes, totalCount: invoices.totalCount };
    };
  },
  onDelete: async (invoices: InvoiceRow[]): Promise<string[]> => {
    const result = await api.deleteInboundShipments({
      ids: invoices.map(invoice => ({ id: invoice.id })),
    });

    const { batchInboundShipment } = result;

    if (batchInboundShipment.deleteInboundShipments) {
      return batchInboundShipment.deleteInboundShipments.map(({ id }) => id);
    }

    throw new Error('Unknown');
  },
  onUpdate: async (
    patch: Partial<Invoice> & { id: string }
  ): Promise<string> => {
    const result = await api.updateInboundShipment({
      input: invoiceToInput(patch),
    });

    const { updateInboundShipment } = result;

    if (updateInboundShipment.__typename === 'InvoiceNode') {
      return updateInboundShipment.id;
    }

    throw new Error(updateInboundShipment.error.description);
  },
  onCreate: async (invoice: Partial<Invoice>): Promise<string> => {
    const result = await api.insertInboundShipment({
      id: invoice.id ?? '',
      otherPartyId: String(invoice['nameId']) ?? '',
    });

    const { insertInboundShipment } = result;

    if (insertInboundShipment.__typename === 'InvoiceNode') {
      return insertInboundShipment.id;
    }

    throw new Error(insertInboundShipment.error.description);
  },
});
