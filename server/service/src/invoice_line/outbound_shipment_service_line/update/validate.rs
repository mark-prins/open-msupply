use domain::invoice::InvoiceType;
use repository::{
    schema::{InvoiceLineRow, InvoiceRow, ItemRow, ItemType},
    StorageConnection,
};

use crate::{
    invoice::{
        check_invoice_exists, check_invoice_is_not_finalised, check_invoice_type,
        InvoiceDoesNotExist, InvoiceIsFinalised, WrongInvoiceType,
    },
    invoice_line::validate::{
        check_item, check_line_belongs_to_invoice, check_line_exists, ItemNotFound,
        LineDoesNotExist, NotInvoiceLine,
    },
};

use super::{UpdateOutboundShipmentServiceLine, UpdateOutboundShipmentServiceLineError};

pub fn validate(
    input: &UpdateOutboundShipmentServiceLine,
    connection: &StorageConnection,
) -> Result<(InvoiceLineRow, InvoiceRow, ItemRow), UpdateOutboundShipmentServiceLineError> {
    let line = check_line_exists(&input.id, connection)?;
    let invoice = check_invoice_exists(&input.invoice_id, connection)?;

    let item = if let Some(item_id) = &input.item_id {
        check_item(item_id, connection)?
    } else {
        check_item(&line.item_id, connection)?
    };
    if item.r#type != ItemType::Service {
        return Err(UpdateOutboundShipmentServiceLineError::NotAServiceItem);
    }

    // check_store(invoice, connection)?; InvoiceDoesNotBelongToCurrentStore

    check_line_belongs_to_invoice(&line, &invoice)?;
    check_invoice_type(&invoice, InvoiceType::OutboundShipment)?;
    check_invoice_is_not_finalised(&invoice)?;

    Ok((line, invoice, item))
}

impl From<LineDoesNotExist> for UpdateOutboundShipmentServiceLineError {
    fn from(_: LineDoesNotExist) -> Self {
        UpdateOutboundShipmentServiceLineError::LineDoesNotExist
    }
}

impl From<InvoiceDoesNotExist> for UpdateOutboundShipmentServiceLineError {
    fn from(_: InvoiceDoesNotExist) -> Self {
        UpdateOutboundShipmentServiceLineError::InvoiceDoesNotExist
    }
}

impl From<NotInvoiceLine> for UpdateOutboundShipmentServiceLineError {
    fn from(error: NotInvoiceLine) -> Self {
        UpdateOutboundShipmentServiceLineError::NotThisInvoiceLine(error.0)
    }
}

impl From<WrongInvoiceType> for UpdateOutboundShipmentServiceLineError {
    fn from(_: WrongInvoiceType) -> Self {
        UpdateOutboundShipmentServiceLineError::NotAnOutboundShipment
    }
}

impl From<InvoiceIsFinalised> for UpdateOutboundShipmentServiceLineError {
    fn from(_: InvoiceIsFinalised) -> Self {
        UpdateOutboundShipmentServiceLineError::CannotEditFinalised
    }
}

impl From<ItemNotFound> for UpdateOutboundShipmentServiceLineError {
    fn from(_: ItemNotFound) -> Self {
        UpdateOutboundShipmentServiceLineError::ItemNotFound
    }
}
