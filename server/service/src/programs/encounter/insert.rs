use chrono::{DateTime, Utc};
use repository::{
    ClinicianRow, Document, DocumentFilter, DocumentRepository, DocumentStatus, Pagination,
    RepositoryError, StringFilter, TransactionError,
};

use crate::{
    document::{document_service::DocumentInsertError, is_latest_doc, raw_document::RawDocument},
    programs::{
        patient::{patient_doc_name, patient_doc_name_with_id},
        update_program_document::{update_program_events, UpdateProgramDocumentError},
    },
    service_provider::{ServiceContext, ServiceProvider},
};

use super::{
    encounter_updated::update_encounter_row,
    validate_misc::{
        validate_clinician_exists, validate_encounter_schema, ValidatedSchemaEncounter,
    },
};

#[derive(PartialEq, Debug)]
pub enum InsertEncounterError {
    NotAllowedToMutateDocument,
    InvalidPatientOrProgram,
    InvalidDataSchema(Vec<String>),
    DataSchemaDoesNotExist,
    InternalError(String),
    DatabaseError(RepositoryError),
    InvalidClinicianId,
}

pub struct InsertEncounter {
    pub patient_id: String,
    /// The program type
    pub program: String,
    pub r#type: String,
    pub data: serde_json::Value,
    pub schema_id: String,
    pub event_datetime: DateTime<Utc>,
}

pub fn insert_encounter(
    ctx: &ServiceContext,
    service_provider: &ServiceProvider,
    user_id: &str,
    input: InsertEncounter,
    allowed_docs: Vec<String>,
) -> Result<Document, InsertEncounterError> {
    let patient = ctx
        .connection
        .transaction_sync(|_| {
            let (encounter, clinician) = validate(ctx, &input)?;
            let patient_id = input.patient_id.clone();
            let program = input.program.clone();
            let event_datetime = input.event_datetime;
            let doc = generate(user_id, input, event_datetime)?;
            let encounter_start_datetime = encounter.start_datetime;

            let document = service_provider
                .document_service
                .update_document(ctx, doc, &allowed_docs)
                .map_err(|err| match err {
                    DocumentInsertError::NotAllowedToMutateDocument => {
                        InsertEncounterError::NotAllowedToMutateDocument
                    }
                    DocumentInsertError::InvalidDataSchema(err) => {
                        InsertEncounterError::InvalidDataSchema(err)
                    }
                    DocumentInsertError::DatabaseError(err) => {
                        InsertEncounterError::DatabaseError(err)
                    }
                    DocumentInsertError::InternalError(err) => {
                        InsertEncounterError::InternalError(err)
                    }
                    DocumentInsertError::DataSchemaDoesNotExist => {
                        InsertEncounterError::DataSchemaDoesNotExist
                    }
                    DocumentInsertError::InvalidParent(err) => {
                        InsertEncounterError::InternalError(err)
                    }
                })?;

            if is_latest_doc(ctx, service_provider, &document)
                .map_err(InsertEncounterError::DatabaseError)?
            {
                update_encounter_row(
                    &ctx.connection,
                    &patient_id,
                    &program,
                    &document,
                    encounter,
                    clinician.map(|c| c.id),
                )?;

                update_program_events(
                    ctx,
                    service_provider,
                    &patient_id,
                    encounter_start_datetime,
                    None,
                    &document,
                    &allowed_docs,
                )
                .map_err(|err| match err {
                    UpdateProgramDocumentError::DatabaseError(err) => {
                        InsertEncounterError::DatabaseError(err)
                    }
                    UpdateProgramDocumentError::InternalError(err) => {
                        InsertEncounterError::InternalError(err)
                    }
                })?;
            }

            Ok(document)
        })
        .map_err(|err: TransactionError<InsertEncounterError>| err.to_inner_error())?;
    Ok(patient)
}

impl From<RepositoryError> for InsertEncounterError {
    fn from(err: RepositoryError) -> Self {
        InsertEncounterError::DatabaseError(err)
    }
}

fn generate(
    user_id: &str,
    input: InsertEncounter,
    event_datetime: DateTime<Utc>,
) -> Result<RawDocument, RepositoryError> {
    let encounter_name = Utc::now().to_rfc3339();
    Ok(RawDocument {
        name: patient_doc_name_with_id(&input.patient_id, &input.r#type, &encounter_name),
        parents: vec![],
        author: user_id.to_string(),
        datetime: event_datetime,
        r#type: input.r#type.clone(),
        data: input.data,
        form_schema_id: Some(input.schema_id),
        status: DocumentStatus::Active,
        comment: None,
        owner_name_id: Some(input.patient_id),
        context: Some(input.program),
    })
}

fn validate_patient_program_exists(
    ctx: &ServiceContext,
    patient_id: &str,
    program: &str,
) -> Result<bool, RepositoryError> {
    let doc_name = patient_doc_name(patient_id, program);
    let document = DocumentRepository::new(&ctx.connection)
        .query(
            Pagination::one(),
            Some(DocumentFilter::new().name(StringFilter::equal_to(&doc_name))),
            None,
        )?
        .pop();
    Ok(document.is_some())
}

fn validate(
    ctx: &ServiceContext,
    input: &InsertEncounter,
) -> Result<(ValidatedSchemaEncounter, Option<ClinicianRow>), InsertEncounterError> {
    if !validate_patient_program_exists(ctx, &input.patient_id, &input.program)? {
        return Err(InsertEncounterError::InvalidPatientOrProgram);
    }

    let encounter = validate_encounter_schema(&input.data).map_err(|err| {
        InsertEncounterError::InvalidDataSchema(vec![format!("Invalid program data: {}", err)])
    })?;

    let clinician_row = if let Some(clinician_id) = encounter
        .encounter
        .clinician
        .as_ref()
        .map(|c| c.id.clone())
        .flatten()
    {
        let clinician_row = validate_clinician_exists(&ctx.connection, &clinician_id)?;
        if clinician_row.is_none() {
            return Err(InsertEncounterError::InvalidClinicianId);
        }
        clinician_row
    } else {
        None
    };

    Ok((encounter, clinician_row))
}

#[cfg(test)]
mod test {
    use chrono::Utc;
    use repository::{
        mock::{mock_form_schema_empty, MockDataInserts},
        test_db::setup_all,
        EncounterFilter, EncounterRepository, EqualFilter, FormSchemaRowRepository,
    };
    use serde_json::json;
    use util::inline_init;

    use crate::{
        programs::{
            encounter::{
                encounter_schema::{EncounterStatus, SchemaEncounter},
                InsertEncounter,
            },
            patient::{test::mock_patient_1, UpdatePatient},
            program_enrolment::{program_schema::SchemaProgramEnrolment, UpsertProgramEnrolment},
        },
        service_provider::ServiceProvider,
    };

    use super::InsertEncounterError;

    #[actix_rt::test]
    async fn test_encounter_insert() {
        let (_, _, connection_manager, _) = setup_all(
            "test_encounter_insert",
            MockDataInserts::none()
                .names()
                .stores()
                .form_schemas()
                .name_store_joins(),
        )
        .await;

        let service_provider = ServiceProvider::new(connection_manager, "");
        let ctx = service_provider.basic_context().unwrap();

        // dummy schema
        let schema = mock_form_schema_empty();
        FormSchemaRowRepository::new(&ctx.connection)
            .upsert_one(&schema)
            .unwrap();

        // insert patient and program
        let patient = mock_patient_1();
        service_provider
            .patient_service
            .update_patient(
                &ctx,
                &service_provider,
                "store_a",
                &patient.id,
                UpdatePatient {
                    data: serde_json::to_value(&patient).unwrap(),
                    schema_id: schema.id.clone(),
                    parent: None,
                },
            )
            .unwrap();
        let program = inline_init(|v: &mut SchemaProgramEnrolment| {
            v.enrolment_datetime = Utc::now().to_rfc3339();
        });
        let program_type = "ProgramType".to_string();
        service_provider
            .program_enrolment_service
            .upsert_program_enrolment(
                &ctx,
                &service_provider,
                "user",
                UpsertProgramEnrolment {
                    data: serde_json::to_value(program.clone()).unwrap(),
                    schema_id: schema.id.clone(),
                    parent: None,
                    patient_id: patient.id.clone(),
                    r#type: program_type.clone(),
                },
                vec![program_type.clone()],
            )
            .unwrap();

        // start actual test:
        let service = &service_provider.encounter_service;

        // NotAllowedToMutateDocument
        let err = service
            .insert_encounter(
                &ctx,
                &service_provider,
                "user",
                InsertEncounter {
                    data: json!({"encounter_datetime": true}),
                    schema_id: schema.id.clone(),
                    patient_id: patient.id.clone(),
                    r#type: "SomeType".to_string(),
                    program: program_type.clone(),
                    event_datetime: Utc::now(),
                },
                vec!["WrongType".to_string()],
            )
            .err()
            .unwrap();
        matches!(err, InsertEncounterError::NotAllowedToMutateDocument);

        // InvalidPatientOrProgram,
        let err = service
            .insert_encounter(
                &ctx,
                &service_provider,
                "user",
                InsertEncounter {
                    data: json!({"enrolment_datetime":true}),
                    schema_id: schema.id.clone(),
                    patient_id: "some_id".to_string(),
                    r#type: "SomeType".to_string(),
                    program: program_type.clone(),
                    event_datetime: Utc::now(),
                },
                vec!["SomeType".to_string()],
            )
            .err()
            .unwrap();
        matches!(err, InsertEncounterError::InvalidPatientOrProgram);
        let err = service
            .insert_encounter(
                &ctx,
                &service_provider,
                "user",
                InsertEncounter {
                    data: json!({"enrolment_datetime":true}),
                    schema_id: schema.id.clone(),
                    patient_id: patient.id.clone(),
                    r#type: "SomeType".to_string(),
                    program: "invalid".to_string(),
                    event_datetime: Utc::now(),
                },
                vec!["SomeType".to_string()],
            )
            .err()
            .unwrap();
        matches!(err, InsertEncounterError::InvalidPatientOrProgram);

        // InvalidDataSchema
        let err = service
            .insert_encounter(
                &ctx,
                &service_provider,
                "user",
                InsertEncounter {
                    data: json!({"encounter_datetime": true}),
                    schema_id: schema.id.clone(),
                    patient_id: patient.id.clone(),
                    r#type: "SomeType".to_string(),
                    program: program_type.clone(),
                    event_datetime: Utc::now(),
                },
                vec!["SomeType".to_string()],
            )
            .err()
            .unwrap();
        matches!(err, InsertEncounterError::InvalidDataSchema(_));

        // success insert
        let encounter = inline_init(|e: &mut SchemaEncounter| {
            e.created_datetime = Utc::now().to_rfc3339();
            e.start_datetime = Utc::now().to_rfc3339();
            e.status = Some(EncounterStatus::Scheduled);
        });
        let program_type = "ProgramType".to_string();
        let result = service
            .insert_encounter(
                &ctx,
                &service_provider,
                "user",
                InsertEncounter {
                    data: serde_json::to_value(encounter.clone()).unwrap(),
                    schema_id: schema.id.clone(),
                    patient_id: patient.id.clone(),
                    r#type: "SomeType".to_string(),
                    program: program_type.clone(),
                    event_datetime: Utc::now(),
                },
                vec!["SomeType".to_string()],
            )
            .unwrap();
        let found = service_provider
            .document_service
            .document(&ctx, &result.name, None)
            .unwrap()
            .unwrap();
        assert!(found.parent_ids.is_empty());
        assert_eq!(found.data, serde_json::to_value(encounter.clone()).unwrap());
        // check that encounter table has been updated
        let row = EncounterRepository::new(&ctx.connection)
            .query_by_filter(
                EncounterFilter::new().document_name(EqualFilter::equal_to(&found.name)),
            )
            .unwrap()
            .pop();
        assert!(row.is_some());
    }
}
