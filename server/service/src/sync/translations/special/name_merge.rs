use repository::{NameLinkRow, NameLinkRowRepository, StorageConnection, SyncBufferRow};

use serde::Deserialize;

use crate::sync::translations::{
    IntegrationRecords, LegacyTableName, PullDependency, PullUpsertRecord, SyncTranslation,
};

#[derive(Deserialize)]
pub struct NameMergeMessage {
    #[serde(rename = "mergeIdToKeep")]
    pub merge_id_to_keep: String,
    #[serde(rename = "mergeIdToDelete")]
    pub merge_id_to_delete: String,
}

pub(crate) struct NameMergeTranslation {}
impl SyncTranslation for NameMergeTranslation {
    fn pull_dependencies(&self) -> PullDependency {
        PullDependency {
            table: LegacyTableName::NAME,
            dependencies: vec![],
        }
    }

    fn try_translate_pull_merge(
        &self,
        connection: &StorageConnection,
        sync_record: &SyncBufferRow,
    ) -> Result<Option<IntegrationRecords>, anyhow::Error> {
        if sync_record.table_name != LegacyTableName::NAME {
            return Ok(None);
        }

        let data = serde_json::from_str::<NameMergeMessage>(&sync_record.data)?;

        let name_link_repo = NameLinkRowRepository::new(connection);
        let name_links = name_link_repo.find_many_by_name_id(&data.merge_id_to_delete)?;
        if name_links.len() == 0 {
            return Ok(None);
        }
        let indirect_link = name_link_repo
            .find_one_by_id(&data.merge_id_to_keep)?
            .ok_or(anyhow::anyhow!(
                "Could not find name link with id {}",
                data.merge_id_to_keep
            ))?;

        let upsert_records: Vec<PullUpsertRecord> = name_links
            .into_iter()
            .map(|NameLinkRow { id, .. }| {
                PullUpsertRecord::NameLink(NameLinkRow {
                    id,
                    name_id: indirect_link.name_id.clone(),
                })
            })
            .collect();

        Ok(Some(IntegrationRecords::from_upserts(upsert_records)))
    }
}

#[cfg(test)]
mod tests {
    use crate::sync::{
        sync_status::logger::SyncLogger, synchroniser::integrate_and_translate_sync_buffer,
    };

    use super::*;
    use repository::{
        mock::MockDataInserts, test_db::setup_all, NameLinkRowRepository, SyncBufferAction,
        SyncBufferRow, SyncBufferRowRepository,
    };

    #[actix_rt::test]
    async fn test_name_merge() {
        let mut sync_records = vec![
            SyncBufferRow {
                record_id: "name_b_merge".to_string(),
                table_name: LegacyTableName::NAME.to_string(),
                action: SyncBufferAction::Merge,
                data: r#"{
                        "mergeIdToKeep": "name_b",
                        "mergeIdToDelete": "name_a"
                    }"#
                .to_string(),
                ..SyncBufferRow::default()
            },
            SyncBufferRow {
                record_id: "name_c_merge".to_string(),
                table_name: LegacyTableName::NAME.to_string(),
                action: SyncBufferAction::Merge,
                data: r#"{
                      "mergeIdToKeep": "name_c",
                      "mergeIdToDelete": "name_b"
                    }"#
                .to_string(),
                ..SyncBufferRow::default()
            },
        ];

        let expected_name_links = vec![
            NameLinkRow {
                id: "name_a".to_string(),
                name_id: "name_c".to_string(),
            },
            NameLinkRow {
                id: "name_b".to_string(),
                name_id: "name_c".to_string(),
            },
            NameLinkRow {
                id: "name_c".to_string(),
                name_id: "name_c".to_string(),
            },
        ];

        let (_, connection, _, _) = setup_all(
            "test_name_merge_message_translation_in_order",
            MockDataInserts::none().units().names(),
        )
        .await;

        let mut logger = SyncLogger::start(&connection).unwrap();

        SyncBufferRowRepository::new(&connection)
            .upsert_many(&sync_records)
            .unwrap();
        integrate_and_translate_sync_buffer(&connection, true, &mut logger)
            .await
            .unwrap();

        let name_link_repo = NameLinkRowRepository::new(&connection);
        let mut name_links = name_link_repo
            .find_many_by_name_id(&"name_c".to_string())
            .unwrap();

        name_links.sort_by_key(|i| i.id.to_owned());
        assert_eq!(name_links, expected_name_links);

        let (_, connection, _, _) = setup_all(
            "test_name_merge_message_translation_in_reverse_order",
            MockDataInserts::none().units().names(),
        )
        .await;

        sync_records.reverse();
        SyncBufferRowRepository::new(&connection)
            .upsert_many(&sync_records)
            .unwrap();

        integrate_and_translate_sync_buffer(&connection, true, &mut logger)
            .await
            .unwrap();

        let name_link_repo = NameLinkRowRepository::new(&connection);
        let mut name_links = name_link_repo
            .find_many_by_name_id(&"name_c".to_string())
            .unwrap();

        name_links.sort_by_key(|i| i.id.to_owned());
        assert_eq!(name_links, expected_name_links);
    }
}