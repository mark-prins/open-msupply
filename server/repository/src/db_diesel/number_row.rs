use super::StorageConnection;

use crate::{
    repository_error::RepositoryError,
    schema::{diesel_schema::number::dsl as number_dsl, NumberRow, NumberRowType},
};

use diesel::prelude::*;

pub struct NumberRowRepository<'a> {
    connection: &'a StorageConnection,
}

impl<'a> NumberRowRepository<'a> {
    pub fn new(connection: &'a StorageConnection) -> Self {
        NumberRowRepository { connection }
    }

    pub fn find_one_by_type_and_store(
        &self,
        r#type: &NumberRowType,
        store_id: &str,
    ) -> Result<Option<NumberRow>, RepositoryError> {
        match number_dsl::number
            .filter(number_dsl::store_id.eq(store_id))
            .filter(number_dsl::type_.eq(r#type))
            .first(&self.connection.connection)
        {
            Ok(row) => Ok(Some(row)),
            Err(diesel::result::Error::NotFound) => Ok(None),
            Err(error) => Err(RepositoryError::from(error)),
        }
    }

    #[cfg(feature = "postgres")]
    pub fn upsert_one(&self, number_row: &NumberRow) -> Result<(), RepositoryError> {
        diesel::insert_into(number_dsl::number)
            .values(number_row)
            .on_conflict(number_dsl::id)
            .do_update()
            .set(number_row)
            .execute(&self.connection.connection)?;
        Ok(())
    }

    #[cfg(not(feature = "postgres"))]
    pub fn upsert_one(&self, number_row: &NumberRow) -> Result<(), RepositoryError> {
        diesel::replace_into(number_dsl::number)
            .values(number_row)
            .execute(&self.connection.connection)?;
        Ok(())
    }
}
