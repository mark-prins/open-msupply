use crate::invoice_queries::{get_invoice, InvoiceResponse};
use graphql_core::{
    simple_generic_errors::{
        CannotEditInvoice, CannotReverseInvoiceStatus, DatabaseError, ForeignKey, ForeignKeyError,
        InvoiceDoesNotBelongToCurrentStore, NodeError, NodeErrorInterface, NotAnOutboundShipment,
        RecordAlreadyExist, RecordNotFound,
    },
    ContextExt,
};
use graphql_types::{
    generic_errors::CannotDeleteInvoiceWithLines,
    types::{
        GenericDeleteResponse, InvoiceLineConnector, InvoiceNode, InvoiceNodeStatus,
        InvoiceNodeType, NameNode,
    },
};
use repository::StorageConnectionManager;
use service::invoice::{delete_outbound_shipment, DeleteOutboundShipmentError};

use async_graphql::*;

#[derive(SimpleObject)]
#[graphql(name = "DeleteOutboundShipmentError")]
pub struct DeleteError {
    pub error: DeleteErrorInterface,
}

#[derive(Union)]
pub enum DeleteOutboundShipmentResponse {
    Error(DeleteError),
    Response(GenericDeleteResponse),
}

pub fn get_delete_outbound_shipment_response(
    connection_manager: &StorageConnectionManager,
    input: String,
) -> DeleteOutboundShipmentResponse {
    use DeleteOutboundShipmentResponse::*;
    match delete_outbound_shipment(connection_manager, input.into()) {
        Ok(id) => Response(GenericDeleteResponse(id)),
        Err(error) => error.into(),
    }
}

#[derive(Interface)]
#[graphql(field(name = "description", type = "&str"))]
pub enum DeleteErrorInterface {
    RecordNotFound(RecordNotFound),
    CannotEditInvoice(CannotEditInvoice),
    NotAnOutboundShipment(NotAnOutboundShipment),
    InvoiceDoesNotBelongToCurrentStore(InvoiceDoesNotBelongToCurrentStore),
    CannotDeleteInvoiceWithLines(CannotDeleteInvoiceWithLines),
    DatabaseError(DatabaseError),
}

impl From<DeleteOutboundShipmentError> for DeleteOutboundShipmentResponse {
    fn from(error: DeleteOutboundShipmentError) -> Self {
        use DeleteErrorInterface as OutError;
        let error = match error {
            DeleteOutboundShipmentError::InvoiceDoesNotExist => {
                OutError::RecordNotFound(RecordNotFound {})
            }
            DeleteOutboundShipmentError::CannotEditFinalised => {
                OutError::CannotEditInvoice(CannotEditInvoice {})
            }
            DeleteOutboundShipmentError::NotThisStoreInvoice => {
                OutError::InvoiceDoesNotBelongToCurrentStore(InvoiceDoesNotBelongToCurrentStore {})
            }
            DeleteOutboundShipmentError::InvoiceLinesExists(lines) => {
                OutError::CannotDeleteInvoiceWithLines(CannotDeleteInvoiceWithLines(
                    InvoiceLineConnector::from_vec(lines),
                ))
            }
            DeleteOutboundShipmentError::DatabaseError(error) => {
                OutError::DatabaseError(DatabaseError(error))
            }
            DeleteOutboundShipmentError::NotAnOutboundShipment => {
                OutError::NotAnOutboundShipment(NotAnOutboundShipment {})
            }
        };

        DeleteOutboundShipmentResponse::Error(DeleteError { error })
    }
}
