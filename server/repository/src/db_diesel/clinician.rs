use super::{
    clinician_row::{clinician, clinician::dsl as clinician_dsl},
    clinician_store_join_row::clinician_store_join::dsl as clinician_store_join_dsl,
    DBType, StorageConnection,
};

use crate::{
    diesel_macros::{apply_equal_filter, apply_simple_string_filter, apply_sort_no_case},
    repository_error::RepositoryError,
    ClinicianRow, EqualFilter, Pagination, SimpleStringFilter, Sort,
};

use diesel::{dsl::IntoBoxed, prelude::*};

#[derive(Clone, Default)]
pub struct ClinicianFilter {
    pub id: Option<EqualFilter<String>>,
    pub code: Option<SimpleStringFilter>,
    pub first_name: Option<SimpleStringFilter>,
    pub last_name: Option<SimpleStringFilter>,
    pub initials: Option<SimpleStringFilter>,
    pub registration_code: Option<SimpleStringFilter>,
    pub category: Option<SimpleStringFilter>,
    pub address1: Option<SimpleStringFilter>,
    pub address2: Option<SimpleStringFilter>,
    pub phone: Option<SimpleStringFilter>,
    pub mobile: Option<SimpleStringFilter>,
    pub email: Option<SimpleStringFilter>,
    pub female: Option<bool>,
}

#[derive(PartialEq, Debug)]
pub enum ClinicianSortField {
    Code,
    FirstName,
    LastName,
    Initials,
    RegistrationCode,
    Category,
    Address1,
    Address2,
    Phone,
    Mobile,
    Email,
    Female,
}

pub type ClinicianSort = Sort<ClinicianSortField>;

type Clinician = ClinicianRow;

pub struct ClinicianRepository<'a> {
    connection: &'a StorageConnection,
}

impl<'a> ClinicianRepository<'a> {
    pub fn new(connection: &'a StorageConnection) -> Self {
        ClinicianRepository { connection }
    }

    pub fn count(
        &self,
        store_id: &str,
        filter: Option<ClinicianFilter>,
    ) -> Result<i64, RepositoryError> {
        let query = create_filtered_query(store_id.to_string(), filter);
        Ok(query.count().get_result(&self.connection.connection)?)
    }

    pub fn query_by_filter(
        &self,
        store_id: &str,
        filter: ClinicianFilter,
    ) -> Result<Vec<Clinician>, RepositoryError> {
        self.query(store_id, Pagination::new(), Some(filter), None)
    }

    pub fn query_one(
        &self,
        store_id: &str,
        filter: ClinicianFilter,
    ) -> Result<Option<Clinician>, RepositoryError> {
        Ok(self.query_by_filter(store_id, filter)?.pop())
    }

    pub fn query(
        &self,
        store_id: &str,
        pagination: Pagination,
        filter: Option<ClinicianFilter>,
        sort: Option<ClinicianSort>,
    ) -> Result<Vec<Clinician>, RepositoryError> {
        let mut query = create_filtered_query(store_id.to_string(), filter);

        if let Some(sort) = sort {
            match sort.key {
                ClinicianSortField::Code => apply_sort_no_case!(query, sort, clinician_dsl::code),
                ClinicianSortField::FirstName => {
                    apply_sort_no_case!(query, sort, clinician_dsl::first_name)
                }
                ClinicianSortField::LastName => {
                    apply_sort_no_case!(query, sort, clinician_dsl::last_name)
                }
                ClinicianSortField::Initials => {
                    apply_sort_no_case!(query, sort, clinician_dsl::initials)
                }
                ClinicianSortField::RegistrationCode => {
                    apply_sort_no_case!(query, sort, clinician_dsl::registration_code)
                }
                ClinicianSortField::Category => {
                    apply_sort_no_case!(query, sort, clinician_dsl::category)
                }
                ClinicianSortField::Address1 => {
                    apply_sort_no_case!(query, sort, clinician_dsl::address1)
                }
                ClinicianSortField::Address2 => {
                    apply_sort_no_case!(query, sort, clinician_dsl::address2)
                }
                ClinicianSortField::Phone => apply_sort_no_case!(query, sort, clinician_dsl::phone),
                ClinicianSortField::Mobile => {
                    apply_sort_no_case!(query, sort, clinician_dsl::mobile)
                }
                ClinicianSortField::Email => apply_sort_no_case!(query, sort, clinician_dsl::email),
                ClinicianSortField::Female => {
                    apply_sort_no_case!(query, sort, clinician_dsl::is_female)
                }
            }
        } else {
            query = query.order(clinician_dsl::id.asc())
        }

        let final_query = query
            .offset(pagination.offset as i64)
            .limit(pagination.limit as i64);

        // Debug diesel query
        // println!(
        //     "{}",
        //     diesel::debug_query::<DBType, _>(&final_query).to_string()
        // );

        let result = final_query.load::<Clinician>(&self.connection.connection)?;

        Ok(result)
    }
}

type BoxedClinicianQuery = IntoBoxed<'static, clinician::table, DBType>;

fn create_filtered_query(store_id: String, filter: Option<ClinicianFilter>) -> BoxedClinicianQuery {
    let mut query = clinician_dsl::clinician.into_boxed();

    if let Some(f) = filter {
        let ClinicianFilter {
            id,
            code,
            first_name,
            last_name,
            initials,
            registration_code,
            category,
            address1,
            address2,
            phone,
            mobile,
            email,
            female,
        } = f;

        apply_equal_filter!(query, id, clinician_dsl::id);
        apply_simple_string_filter!(query, code, clinician_dsl::code);
        apply_simple_string_filter!(query, first_name, clinician_dsl::first_name);
        apply_simple_string_filter!(query, last_name, clinician_dsl::last_name);
        apply_simple_string_filter!(query, initials, clinician_dsl::initials);
        apply_simple_string_filter!(query, registration_code, clinician_dsl::registration_code);
        apply_simple_string_filter!(query, category, clinician_dsl::category);
        apply_simple_string_filter!(query, address1, clinician_dsl::address1);
        apply_simple_string_filter!(query, address2, clinician_dsl::address2);
        apply_simple_string_filter!(query, phone, clinician_dsl::phone);
        apply_simple_string_filter!(query, mobile, clinician_dsl::mobile);
        apply_simple_string_filter!(query, email, clinician_dsl::email);
        if let Some(female) = female {
            query = query.filter(clinician_dsl::is_female.eq(female));
        }
    };

    // Restrict results to clinicians belonging to the store as specified in the
    // clinician_store_join.
    // Note, add AND filter last, after all potential future OR filters.
    let sub_query = clinician_store_join_dsl::clinician_store_join
        .select(clinician_store_join_dsl::clinician_id)
        .filter(clinician_store_join_dsl::store_id.eq(store_id.clone()));
    query = query.filter(clinician_dsl::id.eq_any(sub_query));

    query
}

impl ClinicianFilter {
    pub fn new() -> ClinicianFilter {
        ClinicianFilter::default()
    }

    pub fn id(mut self, filter: EqualFilter<String>) -> Self {
        self.id = Some(filter);
        self
    }

    pub fn code(mut self, filter: SimpleStringFilter) -> Self {
        self.code = Some(filter);
        self
    }

    pub fn first_name(mut self, filter: SimpleStringFilter) -> Self {
        self.first_name = Some(filter);
        self
    }

    pub fn last_name(mut self, filter: SimpleStringFilter) -> Self {
        self.last_name = Some(filter);
        self
    }

    pub fn initials(mut self, value: SimpleStringFilter) -> Self {
        self.initials = Some(value);
        self
    }

    pub fn registration_code(mut self, value: SimpleStringFilter) -> Self {
        self.registration_code = Some(value);
        self
    }

    pub fn category(mut self, value: SimpleStringFilter) -> Self {
        self.category = Some(value);
        self
    }

    pub fn address1(mut self, value: SimpleStringFilter) -> Self {
        self.address1 = Some(value);
        self
    }

    pub fn address2(mut self, value: SimpleStringFilter) -> Self {
        self.address2 = Some(value);
        self
    }

    pub fn phone(mut self, value: SimpleStringFilter) -> Self {
        self.phone = Some(value);
        self
    }

    pub fn mobile(mut self, value: SimpleStringFilter) -> Self {
        self.mobile = Some(value);
        self
    }

    pub fn email(mut self, filter: SimpleStringFilter) -> Self {
        self.email = Some(filter);
        self
    }

    pub fn female(mut self, value: bool) -> Self {
        self.female = Some(value);
        self
    }
}

#[cfg(test)]
mod tests {
    use crate::{
        mock::{mock_store_a, mock_store_b, MockDataInserts},
        test_db, ClinicianFilter, ClinicianRepository, ClinicianRow, ClinicianRowRepository,
        ClinicianStoreJoinRow, ClinicianStoreJoinRowRepository, SimpleStringFilter,
    };
    use util::inline_init;

    #[actix_rt::test]
    async fn test_clinician_repository() {
        // Prepare
        let (_, storage_connection, _, _) = test_db::setup_all(
            "test_clinician_repository",
            MockDataInserts::none().names().stores(),
        )
        .await;
        let repository = ClinicianRepository::new(&storage_connection);

        ClinicianRowRepository::new(&storage_connection)
            .upsert_one(&inline_init(|r: &mut ClinicianRow| {
                r.id = "clinician_store_a".to_string();
                r.store_id = mock_store_a().id;
                r.first_name = Some("First".to_string());
            }))
            .unwrap();
        ClinicianRowRepository::new(&storage_connection)
            .upsert_one(&inline_init(|r: &mut ClinicianRow| {
                r.id = "clinician_store_b".to_string();
                r.store_id = mock_store_b().id;
                r.first_name = Some("First".to_string());
            }))
            .unwrap();

        // no store join no results:
        let result = repository
            .query_by_filter(
                &mock_store_a().id,
                ClinicianFilter::new().first_name(SimpleStringFilter::equal_to("First")),
            )
            .unwrap();
        assert!(result.is_empty());

        // add clinician store join to get query results:
        ClinicianStoreJoinRowRepository::new(&storage_connection)
            .upsert_one(&ClinicianStoreJoinRow {
                id: "JoinId1".to_string(),
                store_id: mock_store_a().id,
                clinician_id: "clinician_store_a".to_string(),
            })
            .unwrap();

        let result = repository
            .query_by_filter(
                &mock_store_a().id,
                ClinicianFilter::new().first_name(SimpleStringFilter::equal_to("First")),
            )
            .unwrap();
        assert_eq!(result[0].id, "clinician_store_a");
    }
}
