use super::{program_row::program, StorageConnection};

use crate::repository_error::RepositoryError;

use chrono::NaiveDateTime;
use diesel::prelude::*;
use diesel_derive_enum::DbEnum;

#[derive(DbEnum, Debug, Clone, PartialEq, Eq)]
#[DbValueStyle = "SCREAMING_SNAKE_CASE"]
pub enum ContactTraceStatus {
    Pending,
    Done,
}

table! {
    contact_trace (id) {
      id -> Text,
      program_id -> Text,
      datetime -> Timestamp,
      contact_trace_id -> Nullable<Text>,
      status -> crate::db_diesel::contact_trace_row::ContactTraceStatusMapping,
      patient_id -> Nullable<Text>,
      first_name -> Nullable<Text>,
      last_name -> Nullable<Text>,
    }
}

joinable!(contact_trace -> program (program_id));
allow_tables_to_appear_in_same_query!(contact_trace, program);

#[derive(Clone, Insertable, Queryable, Debug, PartialEq, AsChangeset, Eq)]
#[changeset_options(treat_none_as_null = "true")]
#[table_name = "contact_trace"]
pub struct ContactTraceRow {
    pub id: String,
    pub program_id: String,
    pub datetime: NaiveDateTime,
    pub contact_trace_id: Option<String>,
    pub status: ContactTraceStatus,
    pub patient_id: Option<String>,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
}

pub struct ContactTraceRowRepository<'a> {
    connection: &'a StorageConnection,
}

impl<'a> ContactTraceRowRepository<'a> {
    pub fn new(connection: &'a StorageConnection) -> Self {
        ContactTraceRowRepository { connection }
    }

    #[cfg(feature = "postgres")]
    pub fn upsert_one(&self, row: &ContactTraceRow) -> Result<(), RepositoryError> {
        diesel::insert_into(contact_trace::dsl::contact_trace)
            .values(row)
            .on_conflict(contact_trace::dsl::id)
            .do_update()
            .set(row)
            .execute(&self.connection.connection)?;
        Ok(())
    }

    #[cfg(not(feature = "postgres"))]
    pub fn upsert_one(&self, row: &ContactTraceRow) -> Result<(), RepositoryError> {
        diesel::replace_into(contact_trace::dsl::contact_trace)
            .values(row)
            .execute(&self.connection.connection)?;
        Ok(())
    }

    pub async fn insert_one(&self, row: &ContactTraceRow) -> Result<(), RepositoryError> {
        diesel::insert_into(contact_trace::dsl::contact_trace)
            .values(row)
            .execute(&self.connection.connection)?;
        Ok(())
    }

    pub async fn find_all(&self) -> Result<Vec<ContactTraceRow>, RepositoryError> {
        let result = contact_trace::dsl::contact_trace.load(&self.connection.connection);
        Ok(result?)
    }

    pub fn find_one_by_id(&self, row_id: &str) -> Result<Option<ContactTraceRow>, RepositoryError> {
        let result = contact_trace::dsl::contact_trace
            .filter(contact_trace::dsl::id.eq(row_id))
            .first(&self.connection.connection)
            .optional()?;
        Ok(result)
    }
}
