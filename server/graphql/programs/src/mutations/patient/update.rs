use async_graphql::*;
use graphql_core::{
    standard_graphql_error::{validate_auth, StandardGraphqlError},
    ContextExt,
};
use graphql_types::types::patient::PatientNode;
use service::{
    auth::{Resource, ResourceAccessRequest},
    programs::patient::{UpdatePatient, UpdatePatientError},
};

#[derive(InputObject)]
pub struct UpdatePatientInput {
    /// Patient document data
    pub data: serde_json::Value,
    /// The schema id used for the patient data
    pub schema_id: String,
    pub parent: String,
}

#[derive(Union)]
pub enum UpdatePatientResponse {
    Response(PatientNode),
}

pub fn update_patient(
    ctx: &Context<'_>,
    store_id: String,
    input: UpdatePatientInput,
) -> Result<UpdatePatientResponse> {
    let user = validate_auth(
        ctx,
        &ResourceAccessRequest {
            resource: Resource::MutatePatient,
            store_id: Some(store_id.clone()),
        },
    )?;
    let allowed_ctx = user.capabilities();

    let service_provider = ctx.service_provider();
    let service_context = service_provider.basic_context()?;

    match service_provider.patient_service.upsert_patient(
        &service_context,
        service_provider,
        &store_id,
        &user.user_id,
        UpdatePatient {
            data: input.data,
            schema_id: input.schema_id,
            parent: Some(input.parent),
        },
    ) {
        Ok(patient) => Ok(UpdatePatientResponse::Response(PatientNode {
            store_id,
            patient,
            allowed_ctx: allowed_ctx.clone(),
        })),
        Err(error) => {
            let formatted_error = format!("{:#?}", error);
            let std_err = match error {
                UpdatePatientError::InvalidDataSchema(_) => {
                    StandardGraphqlError::BadUserInput(formatted_error)
                }
                UpdatePatientError::DataSchemaDoesNotExist => {
                    StandardGraphqlError::BadUserInput(formatted_error)
                }
                UpdatePatientError::InternalError(_) => {
                    StandardGraphqlError::InternalError(formatted_error)
                }
                UpdatePatientError::DatabaseError(_) => {
                    StandardGraphqlError::InternalError(formatted_error)
                }
                UpdatePatientError::InvalidPatientId => {
                    StandardGraphqlError::BadUserInput(formatted_error)
                }
                UpdatePatientError::PatientExists => {
                    StandardGraphqlError::BadUserInput(formatted_error)
                }
                UpdatePatientError::InvalidParentId => {
                    StandardGraphqlError::BadUserInput(formatted_error)
                }
                UpdatePatientError::PatientDocumentRegistryDoesNotExit => {
                    StandardGraphqlError::BadUserInput(formatted_error)
                }
            };
            Err(std_err.extend())
        }
    }
}