use async_graphql::*;
use graphql_core::{
    simple_generic_errors::{
        CannotEditRequisition, ForeignKey, ForeignKeyError, RecordDoesNotExist,
    },
    standard_graphql_error::{validate_auth, StandardGraphqlError},
    ContextExt,
};
use graphql_types::types::RequisitionLineNode;
use service::{
    permission_validation::{Resource, ResourceAccessRequest},
    requisition_line::response_requisition_line::{
        UpdateResponseRequisitionLine as ServiceInput,
        UpdateResponseRequisitionLineError as ServiceError,
    },
};

#[derive(InputObject)]
#[graphql(name = "UpdateResponseRequisitionLineInput")]
pub struct UpdateInput {
    pub id: String,
    pub supply_quantity: Option<u32>,
}

#[derive(Interface)]
#[graphql(name = "UpdateResponseRequisitionLineErrorInterface")]
#[graphql(field(name = "description", type = "String"))]
pub enum UpdateErrorInterface {
    RecordDoesNotExist(RecordDoesNotExist),
    RequisitionDoesNotExist(ForeignKeyError),
    CannotEditRequisition(CannotEditRequisition),
}

#[derive(SimpleObject)]
#[graphql(name = "UpdateResponseRequisitionLineError")]
pub struct UpdateError {
    pub error: UpdateErrorInterface,
}

#[derive(Union)]
#[graphql(name = "UpdateResponseRequisitionLineResponse")]
pub enum UpdateResponse {
    Error(UpdateError),
    Response(RequisitionLineNode),
}
pub fn update(ctx: &Context<'_>, store_id: &str, input: UpdateInput) -> Result<UpdateResponse> {
    validate_auth(
        ctx,
        &ResourceAccessRequest {
            resource: Resource::EditRequisition,
            store_id: Some(store_id.to_string()),
        },
    )?;

    let service_provider = ctx.service_provider();
    let service_context = service_provider.context()?;

    let response = match service_provider
        .requisition_line_service
        .update_response_requisition_line(&service_context, store_id, input.to_domain())
    {
        Ok(requisition_line) => {
            UpdateResponse::Response(RequisitionLineNode::from_domain(requisition_line))
        }
        Err(error) => UpdateResponse::Error(UpdateError {
            error: map_error(error)?,
        }),
    };

    Ok(response)
}

impl UpdateInput {
    fn to_domain(self) -> ServiceInput {
        let UpdateInput {
            id,
            supply_quantity,
        } = self;

        ServiceInput {
            id,
            supply_quantity,
        }
    }
}

fn map_error(error: ServiceError) -> Result<UpdateErrorInterface> {
    use StandardGraphqlError::*;
    let formatted_error = format!("{:#?}", error);

    let graphql_error = match error {
        // Structured Errors
        ServiceError::RequisitionLineDoesNotExist => {
            return Ok(UpdateErrorInterface::RecordDoesNotExist(
                RecordDoesNotExist {},
            ))
        }
        ServiceError::RequisitionDoesNotExist => {
            return Ok(UpdateErrorInterface::RequisitionDoesNotExist(
                ForeignKeyError(ForeignKey::RequisitionId),
            ))
        }
        ServiceError::CannotEditRequisition => {
            return Ok(UpdateErrorInterface::CannotEditRequisition(
                CannotEditRequisition {},
            ))
        }
        // Standard Graphql Errors
        ServiceError::NotThisStoreRequisition => BadUserInput(formatted_error),
        ServiceError::NotAResponseRequisition => BadUserInput(formatted_error),
        ServiceError::UpdatedRequisitionLineDoesNotExist => InternalError(formatted_error),
        ServiceError::DatabaseError(_) => InternalError(formatted_error),
    };

    Err(graphql_error.extend())
}
