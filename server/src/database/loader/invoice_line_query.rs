use crate::database::repository::{InvoiceLineQueryRepository, StorageConnectionManager};
use crate::domain::invoice_line::InvoiceLine;
use crate::service::ListError;

use async_graphql::dataloader::*;
use async_graphql::*;
use std::collections::HashMap;

pub struct InvoiceLineQueryLoader {
    pub connection_manager: StorageConnectionManager,
}

#[async_trait::async_trait]
impl Loader<String> for InvoiceLineQueryLoader {
    type Value = Vec<InvoiceLine>;
    type Error = ListError;

    async fn load(
        &self,
        invoice_ids: &[String],
    ) -> Result<HashMap<String, Self::Value>, Self::Error> {
        let connection = self.connection_manager.connection()?;
        let repo = InvoiceLineQueryRepository::new(&connection);

        let all_invoice_lines = repo.find_many_by_invoice_ids(invoice_ids)?;

        // Put lines into a map grouped by invoice id:
        // invoice_id -> list of invoice_line for the invoice id
        let mut map: HashMap<String, Vec<InvoiceLine>> = HashMap::new();
        for line in all_invoice_lines {
            let list = map
                .entry(line.invoice_id.clone())
                .or_insert_with(|| Vec::<InvoiceLine>::new());
            list.push(line);
        }
        Ok(map)
    }
}
