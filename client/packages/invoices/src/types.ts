import {
  Column,
  StockLine,
  InvoiceNode,
  InvoiceNodeStatus,
  DomainObject,
  InvoicePricingNode,
  Name,
  InvoiceLineNode,
} from '@openmsupply-client/common';

/**
 * Invoice, InvoiceRow and InvoiceLine extend the GQL types, mostly. GQL types for related entities
 * are not included as they are unions of errors or other types which make them difficult to use
 * in the UI. Additionally, to ensure types can be required when needed (i.e. different queries for different fields)
 * we use the GQL types as the base for our types and transform them in the API layer to easier to use types.
 * In the UI we transform these generic Invoice types to the more
 * specialised types such as OutboundShipment or InboundShipment.
 * TODO: Maybe we can get away with just using `Shipment` for both.
 */

export type OutboundShipmentStatus =
  | InvoiceNodeStatus.Draft
  | InvoiceNodeStatus.Allocated
  | InvoiceNodeStatus.Picked
  | InvoiceNodeStatus.Shipped
  | InvoiceNodeStatus.Delivered;

export type InboundShipmentStatus =
  | InvoiceNodeStatus.Picked
  | 'NEW'
  | InvoiceNodeStatus.Shipped
  | InvoiceNodeStatus.Delivered
  | 'VERIFIED';

export interface InvoiceLine extends InvoiceLineNode, DomainObject {
  stockLine?: StockLine;
  stockLineId: string;
  invoiceId: string;
}

export interface InvoiceRow
  extends Pick<
      InvoiceNode,
      | 'comment'
      | 'entryDatetime'
      | 'id'
      | 'invoiceNumber'
      | 'otherPartyId'
      | 'otherPartyName'
      | 'status'
      | 'color'
      | 'theirReference'
      | 'type'
    >,
    DomainObject {
  pricing: InvoicePricingNode;
}

export interface Invoice
  extends Omit<InvoiceNode, 'lines' | 'status' | 'otherParty'>,
    DomainObject {
  status: InvoiceNodeStatus | 'NEW' | 'VERIFIED';
  otherParty?: Name;
  lines: InvoiceLine[];
  pricing: InvoicePricingNode;
}

export interface BatchRow extends StockLine {
  numberOfPacks: number;
}

export interface InvoiceStatusLog {
  draft?: string;
  allocated?: string;
  picked?: string;
  shipped?: string;
  finalised?: string;
}

export enum ActionType {
  UpdateNumberOfPacks = 'OutboundShipment/updateNumberOfPacks',
  UpdateInvoice = 'OutboundShipment/updateInvoice',
  SortBy = 'OutboundShipment/sortBy',
  UpsertLine = 'OutboundShipment/upsertLine',
  DeleteLine = 'OutboundShipment/deleteLine',
}

export type OutboundShipmentAction =
  | {
      type: ActionType.UpdateNumberOfPacks;
      payload: { rowKey: string; numberOfPacks: number };
    }
  | {
      type: ActionType.SortBy;
      payload: { column: Column<OutboundShipmentSummaryItem> };
    }
  | {
      type: ActionType.UpdateInvoice;
      payload: { key: keyof Invoice; value: Invoice[keyof Invoice] };
    }
  | {
      type: ActionType.UpsertLine;
      payload: { line: OutboundShipmentRow };
    }
  | {
      type: ActionType.DeleteLine;
      payload: { line: OutboundShipmentRow };
    };

export interface OutboundShipmentRow extends InvoiceLine {
  updateNumberOfPacks?: (quantity: number) => void;
  stockLineId: string;
  invoiceId: string;
  itemId: string;
  isUpdated?: boolean;
  isDeleted?: boolean;
  isCreated?: boolean;
}

export type OutboundShipmentSummaryItem = {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  unitQuantity: number;
  numberOfPacks: number;
  locationDescription?: string | null;
  itemUnit?: string;
  batch?: string | null;
  batches: Record<string, OutboundShipmentRow>;
  sellPrice?: number | undefined;
  packSize?: number | undefined;
  note?: string | null;
  isDeleted?: boolean;
};

export interface OutboundShipment extends Invoice {
  items: OutboundShipmentSummaryItem[];
  status: OutboundShipmentStatus;
  update?: <K extends keyof Invoice>(key: K, value: Invoice[K]) => void;
  upsertLine?: (line: OutboundShipmentRow) => void;
  deleteLine?: (line: OutboundShipmentRow) => void;
}
export interface InboundShipmentRow extends InvoiceLine {
  updateNumberOfPacks?: (quantity: number) => void;
  stockLineId: string;
  invoiceId: string;
  itemId: string;
  isUpdated?: boolean;
  isDeleted?: boolean;
  isCreated?: boolean;
}

export type InboundShipmentItem = {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  unitQuantity: number;
  numberOfPacks: number;
  locationDescription?: string | null;
  itemUnit?: string;
  batch?: string | null;
  batches: Record<string, OutboundShipmentRow>;
  sellPrice?: number | undefined;
  packSize?: number | undefined;
  note?: string | null;
  isDeleted?: boolean;
};

export interface InboundShipment extends Invoice {
  items: InboundShipmentItem[];
  status: InboundShipmentStatus;
  update?: <K extends keyof Invoice>(key: K, value: Invoice[K]) => void;
  upsertLine?: (line: InboundShipmentRow) => void;
  deleteLine?: (line: InboundShipmentRow) => void;
}