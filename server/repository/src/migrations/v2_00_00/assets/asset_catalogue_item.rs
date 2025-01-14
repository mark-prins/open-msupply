use crate::{migrations::sql, StorageConnection};

pub(crate) fn migrate(connection: &StorageConnection) -> anyhow::Result<()> {
    sql!(
        connection,
        r#"
        CREATE TABLE asset_catalogue_item (
            id TEXT NOT NULL PRIMARY KEY,
            code TEXT NOT NULL,
            asset_class_id TEXT NOT NULL REFERENCES asset_class(id),
            asset_category_id TEXT NOT NULL REFERENCES asset_category(id),
            asset_type_id TEXT NOT NULL REFERENCES asset_type(id),
            manufacturer TEXT,
            model TEXT NOT NULL,
            UNIQUE (code)
        );
        "#,
    )?;

    Ok(())
}
