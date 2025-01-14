use repository::{
    asset::{Asset, AssetFilter, AssetRepository},
    asset_internal_location::{AssetInternalLocationFilter, AssetInternalLocationRepository},
    asset_internal_location_row::AssetInternalLocationRow,
    asset_log_row::{AssetLogReason, AssetLogStatus},
    assets::{
        asset_log_row::{AssetLogRow, AssetLogRowRepository},
        asset_row::{AssetRow, AssetRowRepository},
    },
    EqualFilter, RepositoryError, StorageConnection, StringFilter,
};

pub fn check_asset_exists(
    id: &str,
    connection: &StorageConnection,
) -> Result<Option<AssetRow>, RepositoryError> {
    AssetRowRepository::new(connection).find_one_by_id(id)
}

pub fn check_asset_number_exists(
    asset_number: &str,
    connection: &StorageConnection,
) -> Result<Vec<Asset>, RepositoryError> {
    AssetRepository::new(connection)
        .query_by_filter(AssetFilter::new().asset_number(StringFilter::equal_to(asset_number)))
}

pub fn check_asset_log_exists(
    id: &str,
    connection: &StorageConnection,
) -> Result<Option<AssetLogRow>, RepositoryError> {
    AssetLogRowRepository::new(connection).find_one_by_id(id)
}

pub fn check_reason_matches_status(
    status: &Option<AssetLogStatus>,
    reason: &Option<AssetLogReason>,
) -> bool {
    let status = match status {
        Some(status) => status,
        None => return true,
    };

    let reason = match reason {
        Some(reason) => reason.to_owned(),
        None => return true,
    };

    match status {
        AssetLogStatus::NotInUse => {
            reason == AssetLogReason::AwaitingDecommissioning
                || reason == AssetLogReason::Stored
                || reason == AssetLogReason::OffsiteForRepairs
                || reason == AssetLogReason::AwaitingDecommissioning
        }
        AssetLogStatus::FunctioningButNeedsAttention => {
            reason == AssetLogReason::NeedsServicing
                || reason == AssetLogReason::MultipleTemperatureBreaches
        }
        AssetLogStatus::NotFunctioning => {
            reason == AssetLogReason::Unknown
                || reason == AssetLogReason::NeedsSpareParts
                || reason == AssetLogReason::LackOfPower
        }
        // If a reason exists, it won't match the reamining statuses which require a None reason.
        _ => false,
    }
}

pub fn check_locations_are_assigned(
    location_ids: Vec<String>,
    asset_id: &str,
    connection: &StorageConnection,
) -> Result<Vec<AssetInternalLocationRow>, RepositoryError> {
    AssetInternalLocationRepository::new(connection).query_by_filter(
        AssetInternalLocationFilter::new()
            .location_id(EqualFilter::equal_any(location_ids))
            .asset_id(EqualFilter::not_equal_to(asset_id)),
    )
}
