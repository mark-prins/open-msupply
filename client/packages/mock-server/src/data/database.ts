import { Item, StockLine, Invoice, InvoiceLine, Name } from './types';
import {
  InvoiceData,
  InvoiceLineData,
  ItemData,
  StockLineData,
  NameData,
  removeElement,
} from './data';

// Importing this from utils causes a circular deps loop and you will not have fun :)
export const getFilter =
  <T>(matchVal: unknown, key: keyof T) =>
  (obj: T): boolean =>
    obj[key] === matchVal;

export const invoice = {
  get: {
    byInvoiceNumber: (invoiceNumber: number): Invoice =>
      ({
        ...InvoiceData.find(getFilter(invoiceNumber, 'invoiceNumber')),
      } as Invoice),
  },
};

export const get = {
  id: {
    item: (id: string): number => ItemData.findIndex(getFilter(id, 'id')),
    stockLine: (id: string): number =>
      StockLineData.findIndex(getFilter(id, 'id')),
    invoice: (id: string): number => InvoiceData.findIndex(getFilter(id, 'id')),
    invoiceLine: (id: string): number =>
      InvoiceLineData.findIndex(getFilter(id, 'id')),
  },

  byId: {
    item: (id: string): Item =>
      ({
        ...ItemData.find(getFilter(id, 'id')),
      } as Item),
    stockLine: (id: string): StockLine =>
      ({
        ...StockLineData.find(getFilter(id, 'id')),
      } as StockLine),
    invoice: (id: string): Invoice =>
      ({
        ...InvoiceData.find(getFilter(id, 'id')),
      } as Invoice),
    invoiceLine: (id: string): InvoiceLine =>
      ({
        ...InvoiceLineData.find(getFilter(id, 'id')),
      } as InvoiceLine),
    name: (id: string): Name =>
      ({
        ...NameData.find(getFilter(id, 'id')),
      } as Name),
  },

  all: {
    item: (): Item[] => ItemData.slice(),
    stockLine: (): StockLine[] => StockLineData.slice(),
    invoice: (): Invoice[] => InvoiceData.slice(),
    invoiceLine: (): InvoiceLine[] => InvoiceLineData.slice(),
    name: (): Name[] => NameData.slice(),
  },

  stockLines: {
    byItemId: (itemId: string): StockLine[] =>
      StockLineData.filter(getFilter(itemId, 'itemId')),
  },

  invoiceLines: {
    byInvoiceId: (invoiceId: string): InvoiceLine[] =>
      InvoiceLineData.filter(getFilter(invoiceId, 'invoiceId')),
  },
};

export const update = {
  invoice: (invoice: Invoice): Invoice => {
    const idx = InvoiceData.findIndex(getFilter(invoice.id, 'id'));
    if (idx < 0) throw new Error('Invalid invoice id');
    const newInvoice = { ...InvoiceData[idx], ...invoice };
    InvoiceData[idx] = newInvoice;
    return newInvoice;
  },
  invoiceLine: (invoiceLine: InvoiceLine): InvoiceLine => {
    const idx = InvoiceLineData.findIndex(getFilter(invoiceLine.id, 'id'));
    if (idx < 0) throw new Error('Invalid invoice line id');
    const newLine: InvoiceLine = { ...InvoiceLineData[idx], ...invoiceLine };
    InvoiceLineData[idx] = newLine;
    return newLine;
  },
  stockLine: (stockLine: StockLine): StockLine => {
    const idx = StockLineData.findIndex(getFilter(stockLine.id, 'id'));
    if (idx < 0) throw new Error('Invalid stock line id');
    const newLine: StockLine = { ...StockLineData[idx], ...stockLine };
    StockLineData[idx] = newLine;
    return newLine;
  },
};

export const insert = {
  invoice: (invoice: Invoice): Invoice => {
    InvoiceData.push(invoice);

    return invoice;
  },
  invoiceLine: (invoiceLine: InvoiceLine): InvoiceLine => {
    InvoiceLineData.push(invoiceLine);
    return invoiceLine;
  },
};

export const remove = {
  invoice: (invoiceId: string): string => {
    const idx = get.id.invoice(invoiceId);

    if (idx < 0) {
      throw new Error(`Cannot find invoice to delete with id: ${invoiceId}`);
    }

    removeElement(InvoiceData, idx);

    return invoiceId;
  },
  invoiceLine: (invoiceLineId: string): string => {
    const idx = get.id.invoiceLine(invoiceLineId);

    if (idx < 0) {
      throw new Error(
        `Cannot find invoice line to delete with id: ${invoiceLineId}`
      );
    }

    removeElement(InvoiceLineData, idx);

    return invoiceLineId;
  },
};

export const db = {
  invoice,
  get,
  update,
  insert,
  remove,
};