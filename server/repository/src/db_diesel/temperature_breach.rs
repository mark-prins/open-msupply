use super::{
    location_row::{location, location::dsl as location_dsl},
    sensor_row::{sensor, sensor::dsl as sensor_dsl},
    temperature_breach_row::{
        temperature_breach, temperature_breach::dsl as temperature_breach_dsl,
    },
    DBType, StorageConnection, TemperatureBreachRow, TemperatureBreachRowType,
};
use diesel::{
    helper_types::{InnerJoin, IntoBoxed, LeftJoin},
    prelude::*,
};
use util::inline_init;

use crate::{
    diesel_macros::{apply_date_time_filter, apply_equal_filter, apply_sort, apply_sort_no_case},
    repository_error::RepositoryError,
    LocationRow, SensorRow,
};

use crate::{DatetimeFilter, EqualFilter, Pagination, Sort};

#[derive(PartialEq, Debug, Clone)]
pub struct TemperatureBreach {
    pub temperature_breach_row: TemperatureBreachRow,
    pub sensor_row: SensorRow,
    pub location_row: Option<LocationRow>,
}

pub type TemperatureBreachJoin = (TemperatureBreachRow, SensorRow, Option<LocationRow>);

#[derive(Clone, PartialEq, Debug)]
pub struct TemperatureBreachFilter {
    pub id: Option<EqualFilter<String>>,
    pub r#type: Option<EqualFilter<TemperatureBreachRowType>>,
    pub sensor_id: Option<EqualFilter<String>>,
    pub location_id: Option<EqualFilter<String>>,
    pub store_id: Option<EqualFilter<String>>,
    pub start_timestamp: Option<DatetimeFilter>,
    pub end_timestamp: Option<DatetimeFilter>,
    pub acknowledged: Option<bool>,
    pub sensor_name: Option<EqualFilter<String>>,
    pub location_name: Option<EqualFilter<String>>,
}

#[derive(PartialEq, Debug)]
pub enum TemperatureBreachSortField {
    Id,
    StartTimestamp,
    EndTimestamp,
}

pub type TemperatureBreachSort = Sort<TemperatureBreachSortField>;

pub struct TemperatureBreachRepository<'a> {
    connection: &'a StorageConnection,
}

impl<'a> TemperatureBreachRepository<'a> {
    pub fn new(connection: &'a StorageConnection) -> Self {
        TemperatureBreachRepository { connection }
    }

    pub fn count(&self, filter: Option<TemperatureBreachFilter>) -> Result<i64, RepositoryError> {
        let query = create_filtered_query(filter)?;
        Ok(query.count().get_result(&self.connection.connection)?)
    }

    pub fn query_by_filter(
        &self,
        filter: TemperatureBreachFilter,
    ) -> Result<Vec<TemperatureBreach>, RepositoryError> {
        self.query(Pagination::all(), Some(filter), None)
    }

    pub fn query(
        &self,
        pagination: Pagination,
        filter: Option<TemperatureBreachFilter>,
        sort: Option<TemperatureBreachSort>,
    ) -> Result<Vec<TemperatureBreach>, RepositoryError> {
        let mut query = create_filtered_query(filter)?;
        if let Some(sort) = sort {
            match sort.key {
                TemperatureBreachSortField::Id => {
                    apply_sort_no_case!(query, sort, temperature_breach_dsl::id)
                }
                TemperatureBreachSortField::StartTimestamp => {
                    apply_sort!(query, sort, temperature_breach_dsl::start_timestamp)
                }
                TemperatureBreachSortField::EndTimestamp => {
                    apply_sort!(query, sort, temperature_breach_dsl::end_timestamp)
                }
            }
        } else {
            query = query.order(temperature_breach_dsl::start_timestamp.asc())
        }

        let result = query
            .offset(pagination.offset as i64)
            .limit(pagination.limit as i64)
            .load::<TemperatureBreachJoin>(&self.connection.connection)?;

        Ok(result.into_iter().map(to_domain).collect())
    }
}

type BoxedTemperatureBreachQuery = IntoBoxed<
    'static,
    LeftJoin<InnerJoin<temperature_breach::table, sensor::table>, location::table>,
    DBType,
>;

fn create_filtered_query(
    filter: Option<TemperatureBreachFilter>,
) -> Result<BoxedTemperatureBreachQuery, RepositoryError> {
    let mut query = temperature_breach_dsl::temperature_breach
        .inner_join(sensor_dsl::sensor)
        .left_join(location_dsl::location)
        .into_boxed();

    if let Some(filter) = filter {
        apply_equal_filter!(query, filter.id, temperature_breach_dsl::id);
        apply_equal_filter!(query, filter.sensor_id, temperature_breach_dsl::sensor_id);
        apply_equal_filter!(
            query,
            filter.location_id,
            temperature_breach_dsl::location_id
        );
        apply_equal_filter!(query, filter.store_id, temperature_breach_dsl::store_id);
        apply_equal_filter!(query, filter.r#type, temperature_breach_dsl::type_);
        apply_date_time_filter!(
            query,
            filter.start_timestamp,
            temperature_breach_dsl::start_timestamp
        );
        apply_date_time_filter!(
            query,
            filter.end_timestamp,
            temperature_breach_dsl::end_timestamp
        );
        apply_equal_filter!(query, filter.sensor_name, sensor_dsl::name);
        apply_equal_filter!(query, filter.location_name, location_dsl::name);
    }

    Ok(query)
}

impl TemperatureBreachRowType {
    pub fn equal_to(&self) -> EqualFilter<Self> {
        inline_init(|r: &mut EqualFilter<Self>| r.equal_to = Some(self.clone()))
    }

    pub fn not_equal_to(&self) -> EqualFilter<Self> {
        inline_init(|r: &mut EqualFilter<Self>| r.not_equal_to = Some(self.clone()))
    }

    pub fn equal_any(value: Vec<Self>) -> EqualFilter<Self> {
        inline_init(|r: &mut EqualFilter<Self>| r.equal_any = Some(value))
    }
}

pub fn to_domain(
    (temperature_breach_row, sensor_row, location_row): TemperatureBreachJoin,
) -> TemperatureBreach {
    TemperatureBreach {
        temperature_breach_row,
        sensor_row,
        location_row,
    }
}

impl TemperatureBreachFilter {
    pub fn new() -> TemperatureBreachFilter {
        TemperatureBreachFilter {
            id: None,
            sensor_id: None,
            store_id: None,
            acknowledged: None,
            start_timestamp: None,
            end_timestamp: None,
            r#type: None,
            sensor_name: None,
            location_name: None,
            location_id: None,
        }
    }

    pub fn id(mut self, filter: EqualFilter<String>) -> Self {
        self.id = Some(filter);
        self
    }

    pub fn sensor_id(mut self, filter: EqualFilter<String>) -> Self {
        self.sensor_id = Some(filter);
        self
    }

    pub fn location_id(mut self, filter: EqualFilter<String>) -> Self {
        self.location_id = Some(filter);
        self
    }

    pub fn store_id(mut self, filter: EqualFilter<String>) -> Self {
        self.store_id = Some(filter);
        self
    }

    pub fn acknowledged(mut self, filter: bool) -> Self {
        self.acknowledged = Some(filter);
        self
    }

    pub fn start_timestamp(mut self, filter: DatetimeFilter) -> Self {
        self.start_timestamp = Some(filter);
        self
    }

    pub fn end_timestamp(mut self, filter: DatetimeFilter) -> Self {
        self.end_timestamp = Some(filter);
        self
    }

    pub fn r#type(mut self, filter: EqualFilter<TemperatureBreachRowType>) -> Self {
        self.r#type = Some(filter);
        self
    }

    pub fn sensor_name(mut self, filter: EqualFilter<String>) -> Self {
        self.sensor_name = Some(filter);
        self
    }

    pub fn location_name(mut self, filter: EqualFilter<String>) -> Self {
        self.location_name = Some(filter);
        self
    }
}
