use super::{
    name_row::{name, name::dsl as name_dsl},
    name_store_join::{name_store_join, name_store_join::dsl as name_store_join_dsl},
    program_enrolment_row::program_enrolment::dsl as program_enrolment_dsl,
    store_row::{store, store::dsl as store_dsl},
    DBType, NameRow, NameStoreJoinRow, StorageConnection, StoreRow,
};

use crate::{
    diesel_macros::{
        apply_date_filter, apply_equal_filter, apply_simple_string_filter,
        apply_simple_string_or_filter, apply_sort_no_case,
    },
    repository_error::RepositoryError,
    DateFilter, EqualFilter, Gender, NameType, Pagination, SimpleStringFilter, Sort,
};

use diesel::{
    dsl::{And, Eq, IntoBoxed, LeftJoin},
    prelude::*,
    query_source::joins::OnClauseWrapper,
};

#[derive(PartialEq, Debug, Clone, Default)]
pub struct Patient {
    pub name_row: NameRow,
    pub name_store_join_row: Option<NameStoreJoinRow>,
    pub store_row: Option<StoreRow>,
}

#[derive(Clone, Default, PartialEq, Debug)]
pub struct PatientFilter {
    pub id: Option<EqualFilter<String>>,
    pub name: Option<SimpleStringFilter>,
    pub code: Option<SimpleStringFilter>,
    pub code_2: Option<SimpleStringFilter>,
    pub first_name: Option<SimpleStringFilter>,
    pub last_name: Option<SimpleStringFilter>,
    pub gender: Option<EqualFilter<Gender>>,
    pub date_of_birth: Option<DateFilter>,
    pub phone: Option<SimpleStringFilter>,
    pub address1: Option<SimpleStringFilter>,
    pub address2: Option<SimpleStringFilter>,
    pub country: Option<SimpleStringFilter>,
    pub email: Option<SimpleStringFilter>,

    pub is_visible: Option<bool>,

    /// Filter for any identifier associated with a name entry.
    /// Currently:
    /// - name::code
    /// - name::national_health_number
    /// - program_enrolment::program_enrolment_id
    pub identifier: Option<SimpleStringFilter>,
}

#[derive(PartialEq, Debug)]
pub enum PatientSortField {
    Name,
    Code,
    Code2,
    FirstName,
    LastName,
    Gender,
    DateOfBirth,
    Phone,
    Address1,
    Address2,
    Country,
    Email,
}

pub type PatientSort = Sort<PatientSortField>;

type NameAndNameStoreJoin = (NameRow, Option<NameStoreJoinRow>, Option<StoreRow>);

pub struct PatientRepository<'a> {
    connection: &'a StorageConnection,
}

impl<'a> PatientRepository<'a> {
    pub fn new(connection: &'a StorageConnection) -> Self {
        PatientRepository { connection }
    }

    pub fn count(
        &self,
        store_id: &str,
        filter: Option<PatientFilter>,
        allowed_ctx: Option<&[String]>,
    ) -> Result<i64, RepositoryError> {
        let query = Self::create_filtered_query(store_id.to_string(), filter, allowed_ctx);

        Ok(query.count().get_result(&self.connection.connection)?)
    }

    pub fn query_by_filter(
        &self,
        store_id: &str,
        filter: PatientFilter,
        allowed_ctx: Option<&[String]>,
    ) -> Result<Vec<Patient>, RepositoryError> {
        self.query(store_id, Pagination::new(), Some(filter), None, allowed_ctx)
    }

    pub fn query_one(
        &self,
        store_id: &str,
        filter: PatientFilter,
        allowed_ctx: Option<&[String]>,
    ) -> Result<Option<Patient>, RepositoryError> {
        Ok(self.query_by_filter(store_id, filter, allowed_ctx)?.pop())
    }

    pub fn query(
        &self,
        store_id: &str,
        pagination: Pagination,
        filter: Option<PatientFilter>,
        sort: Option<PatientSort>,
        allowed_ctx: Option<&[String]>,
    ) -> Result<Vec<Patient>, RepositoryError> {
        let mut query = Self::create_filtered_query(store_id.to_string(), filter, allowed_ctx);

        if let Some(sort) = sort {
            match sort.key {
                PatientSortField::Name => {
                    apply_sort_no_case!(query, sort, name_dsl::name_);
                }
                PatientSortField::Code => {
                    apply_sort_no_case!(query, sort, name_dsl::code);
                }
                PatientSortField::FirstName => {
                    apply_sort_no_case!(query, sort, name_dsl::first_name)
                }
                PatientSortField::LastName => apply_sort_no_case!(query, sort, name_dsl::last_name),
                PatientSortField::Gender => apply_sort_no_case!(query, sort, name_dsl::gender),
                PatientSortField::DateOfBirth => {
                    apply_sort_no_case!(query, sort, name_dsl::date_of_birth)
                }
                PatientSortField::Phone => apply_sort_no_case!(query, sort, name_dsl::phone),
                PatientSortField::Address1 => apply_sort_no_case!(query, sort, name_dsl::address1),
                PatientSortField::Address2 => apply_sort_no_case!(query, sort, name_dsl::address2),
                PatientSortField::Country => apply_sort_no_case!(query, sort, name_dsl::country),
                PatientSortField::Email => apply_sort_no_case!(query, sort, name_dsl::email),
                PatientSortField::Code2 => {
                    apply_sort_no_case!(query, sort, name_dsl::national_health_number)
                }
            }
        } else {
            query = query.order(name_dsl::id.asc())
        }

        let final_query = query
            .offset(pagination.offset as i64)
            .limit(pagination.limit as i64);

        // Debug diesel query
        // println!(
        //     "{}",
        //     diesel::debug_query::<DBType, _>(&final_query).to_string()
        // );

        let result = final_query.load::<NameAndNameStoreJoin>(&self.connection.connection)?;

        Ok(result.into_iter().map(Patient::from_join).collect())
    }

    /// Returns a list of names left joined to name_store_join (for name_store_joins matching store_id parameter)
    /// Names will still be present in result even if name_store_join doesn't match store_id in parameters
    /// but it's considered invisible in subseqent filters.
    pub fn create_filtered_query(
        store_id: String,
        filter: Option<PatientFilter>,
        allowed_ctx: Option<&[String]>,
    ) -> BoxedNameQuery {
        let mut query = name_dsl::name
            .left_join(
                name_store_join_dsl::name_store_join.on(name_store_join_dsl::name_id
                    .eq(name_dsl::id)
                    .and(name_store_join_dsl::store_id.eq(store_id.clone()))), // if the name is visible to the `store_id` passed into this function, attach its `name store_join` information
            )
            .left_join(store_dsl::store.on(store_dsl::name_id.eq(name_dsl::id)))
            .into_boxed();

        if let Some(f) = filter {
            let PatientFilter {
                id,
                name,
                code,
                code_2: national_health_number,
                first_name,
                last_name,
                gender,
                date_of_birth,
                phone,
                address1,
                address2,
                country,
                email,
                is_visible,
                identifier,
            } = f;

            // or filters need to be applied first
            if identifier.is_some() {
                apply_simple_string_filter!(query, identifier.clone(), name_dsl::code);
                apply_simple_string_or_filter!(
                    query,
                    identifier.clone(),
                    name_dsl::national_health_number
                );

                let mut sub_query = program_enrolment_dsl::program_enrolment
                    .select(program_enrolment_dsl::patient_id)
                    .into_boxed();
                apply_simple_string_filter!(
                    sub_query,
                    identifier,
                    program_enrolment_dsl::program_enrolment_id
                );
                if let Some(allowed_ctx) = allowed_ctx {
                    apply_equal_filter!(
                        sub_query,
                        Some(EqualFilter::default().restrict_results(allowed_ctx)),
                        program_enrolment_dsl::context
                    );
                }
                query = query.or_filter(name_dsl::id.eq_any(sub_query))
            }

            apply_equal_filter!(query, id, name_dsl::id);
            apply_simple_string_filter!(query, code, name_dsl::code);
            apply_simple_string_filter!(
                query,
                national_health_number,
                name_dsl::national_health_number
            );
            apply_simple_string_filter!(query, name, name_dsl::name_);

            apply_simple_string_filter!(query, first_name, name_dsl::first_name);
            apply_simple_string_filter!(query, last_name, name_dsl::last_name);
            apply_equal_filter!(query, gender, name_dsl::gender);
            apply_date_filter!(query, date_of_birth, name_dsl::date_of_birth);
            apply_simple_string_filter!(query, phone, name_dsl::phone);
            apply_simple_string_filter!(query, address1, name_dsl::address1);
            apply_simple_string_filter!(query, address2, name_dsl::address2);
            apply_simple_string_filter!(query, country, name_dsl::country);
            apply_simple_string_filter!(query, email, name_dsl::email);

            // patients are always customers in the name_store_join
            query = query.filter(name_store_join_dsl::name_is_customer.eq(true));

            query = match is_visible {
                Some(true) => query.filter(name_store_join_dsl::id.is_not_null()),
                Some(false) => query.filter(name_store_join_dsl::id.is_null()),
                None => query,
            };
        };

        apply_equal_filter!(
            query,
            Some(NameType::equal_to(&NameType::Patient)),
            name_dsl::type_
        );
        query
    }
}

impl Patient {
    pub fn from_join((name_row, name_store_join_row, store_row): NameAndNameStoreJoin) -> Patient {
        Patient {
            name_row,
            name_store_join_row,
            store_row,
        }
    }

    pub fn is_visible(&self) -> bool {
        self.name_store_join_row.is_some()
    }
}

// name_store_join_dsl::name_id.eq(name_dsl::id)
type NameIdEqualToId = Eq<name_store_join_dsl::name_id, name_dsl::id>;
// name_store_join_dsl::store_id.eq(store_id)
type StoreIdEqualToStr = Eq<name_store_join_dsl::store_id, String>;
// name_store_join_dsl::name_id.eq(name_dsl::id).and(name_store_join_dsl::store_id.eq(store_id))
type OnNameStoreJoinToNameJoin =
    OnClauseWrapper<name_store_join::table, And<NameIdEqualToId, StoreIdEqualToStr>>;

// store_dsl::id.eq(store_id))
type StoreNameIdEqualToId = Eq<store_dsl::name_id, name_dsl::id>;
// store.on(id.eq(store_id))
type OnStoreJoinToNameStoreJoin = OnClauseWrapper<store::table, StoreNameIdEqualToId>;

type BoxedNameQuery = IntoBoxed<
    'static,
    LeftJoin<LeftJoin<name::table, OnNameStoreJoinToNameJoin>, OnStoreJoinToNameStoreJoin>,
    DBType,
>;

impl PatientFilter {
    pub fn new() -> PatientFilter {
        PatientFilter::default()
    }

    pub fn id(mut self, filter: EqualFilter<String>) -> Self {
        self.id = Some(filter);
        self
    }

    pub fn name(mut self, filter: SimpleStringFilter) -> Self {
        self.name = Some(filter);
        self
    }

    pub fn code(mut self, filter: SimpleStringFilter) -> Self {
        self.code = Some(filter);
        self
    }

    pub fn code_2(mut self, filter: SimpleStringFilter) -> Self {
        self.code_2 = Some(filter);
        self
    }

    pub fn identifier(mut self, filter: SimpleStringFilter) -> Self {
        self.identifier = Some(filter);
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

    pub fn gender(mut self, filter: EqualFilter<Gender>) -> Self {
        self.gender = Some(filter);
        self
    }

    pub fn date_of_birth(mut self, filter: DateFilter) -> Self {
        self.date_of_birth = Some(filter);
        self
    }

    pub fn phone(mut self, filter: SimpleStringFilter) -> Self {
        self.phone = Some(filter);
        self
    }

    pub fn address1(mut self, filter: SimpleStringFilter) -> Self {
        self.address1 = Some(filter);
        self
    }
    pub fn address2(mut self, filter: SimpleStringFilter) -> Self {
        self.address2 = Some(filter);
        self
    }
    pub fn country(mut self, filter: SimpleStringFilter) -> Self {
        self.country = Some(filter);
        self
    }

    pub fn email(mut self, filter: SimpleStringFilter) -> Self {
        self.email = Some(filter);
        self
    }

    pub fn is_visible(mut self, value: bool) -> Self {
        self.is_visible = Some(value);
        self
    }
}

#[cfg(test)]
mod tests {
    use chrono::Utc;
    use util::inline_init;

    use crate::{
        mock::{mock_test_name_query_store_1, MockDataInserts},
        test_db, EqualFilter, NameRow, NameRowRepository, NameStoreJoinRepository,
        NameStoreJoinRow, NameType, PatientFilter, PatientRepository, ProgramEnrolmentRow,
        ProgramEnrolmentRowRepository, ProgramEnrolmentStatus, SimpleStringFilter,
    };

    #[actix_rt::test]
    async fn test_patient_query() {
        let (_, connection, _, _) = test_db::setup_all(
            "patient_query",
            MockDataInserts::none().names().stores().name_store_joins(),
        )
        .await;
        let repo = PatientRepository::new(&connection);
        let store_id = &mock_test_name_query_store_1().id;

        // Make sure we don't return names that are not patients
        let result = repo
            .query_by_filter(
                &store_id,
                PatientFilter::new().identifier(SimpleStringFilter::equal_to("code2")),
                None,
            )
            .unwrap();
        assert_eq!(result.get(0), None);

        let name_row_repo = NameRowRepository::new(&connection);
        let patient_row = inline_init(|row: &mut NameRow| {
            row.id = "patient_1".to_string();
            row.r#type = NameType::Patient;
            row.code = "codePatient".to_string();
            row.national_health_number = Some("nhnPatient".to_string());
        });
        name_row_repo.upsert_one(&patient_row).unwrap();
        // Not able to query patient without name store join
        let result = repo
            .query_by_filter(
                &store_id,
                PatientFilter::new().id(EqualFilter::equal_to("patient_1")),
                None,
            )
            .unwrap();
        assert_eq!(result.get(0), None);

        // Not able to query patient when name store join is not a customer
        NameStoreJoinRepository::new(&connection)
            .upsert_one(&NameStoreJoinRow {
                id: "name_store_join_patient_id".to_string(),
                name_id: patient_row.id.clone(),
                store_id: store_id.clone(),
                name_is_customer: false,
                name_is_supplier: false,
                is_sync_update: false,
            })
            .unwrap();
        let result = repo
            .query_by_filter(
                &store_id,
                PatientFilter::new().id(EqualFilter::equal_to("patient_1")),
                None,
            )
            .unwrap();
        assert_eq!(result.get(0), None);

        NameStoreJoinRepository::new(&connection)
            .upsert_one(&NameStoreJoinRow {
                id: "name_store_join_patient_id".to_string(),
                name_id: patient_row.id.clone(),
                store_id: store_id.clone(),
                name_is_customer: true,
                name_is_supplier: false,
                is_sync_update: false,
            })
            .unwrap();
        let result = repo
            .query_by_filter(
                &store_id,
                PatientFilter::new().id(EqualFilter::equal_to("patient_1")),
                None,
            )
            .unwrap();
        result.get(0).unwrap();
    }

    #[actix_rt::test]
    async fn test_patient_identifier_query() {
        let (_, connection, _, _) = test_db::setup_all(
            "patient_identifier_query",
            MockDataInserts::none().names().stores().name_store_joins(),
        )
        .await;
        let repo = PatientRepository::new(&connection);
        let store_id = &mock_test_name_query_store_1().id;

        // add name and name_store_join
        let name_row_repo = NameRowRepository::new(&connection);
        let patient_row = inline_init(|row: &mut NameRow| {
            row.id = "patient_1".to_string();
            row.r#type = NameType::Patient;
            row.code = "codePatient".to_string();
            row.national_health_number = Some("nhnPatient".to_string());
        });
        name_row_repo.upsert_one(&patient_row).unwrap();
        NameStoreJoinRepository::new(&connection)
            .upsert_one(&NameStoreJoinRow {
                id: "name_store_join_patient_id".to_string(),
                name_id: patient_row.id.clone(),
                store_id: store_id.clone(),
                name_is_customer: true,
                name_is_supplier: false,
                is_sync_update: false,
            })
            .unwrap();

        // Test identifier search
        ProgramEnrolmentRowRepository::new(&connection)
            .upsert_one(&ProgramEnrolmentRow {
                id: util::uuid::uuid(),
                document_name: "doc_name".to_string(),
                patient_id: patient_row.id.clone(),
                document_type: "ProgramType".to_string(),
                context: "ProgramType".to_string(),
                enrolment_datetime: Utc::now().naive_utc(),
                program_enrolment_id: Some("program_enrolment_id".to_string()),
                status: ProgramEnrolmentStatus::Active,
            })
            .unwrap();
        let result = repo
            .query_by_filter(
                &store_id,
                PatientFilter::new().identifier(SimpleStringFilter::equal_to("codePatient")),
                None,
            )
            .unwrap();
        assert_eq!(result.get(0).unwrap().name_row.id, patient_row.id);
        let result = repo
            .query_by_filter(
                &store_id,
                PatientFilter::new().identifier(SimpleStringFilter::equal_to("nhnPatient")),
                None,
            )
            .unwrap();
        assert_eq!(result.get(0).unwrap().name_row.id, patient_row.id);
        let result = repo
            .query_by_filter(
                &store_id,
                PatientFilter::new()
                    .identifier(SimpleStringFilter::equal_to("program_enrolment_id")),
                None,
            )
            .unwrap();
        assert_eq!(result.get(0).unwrap().name_row.id, patient_row.id);
        let result = repo
            .query_by_filter(
                &store_id,
                PatientFilter::new()
                    .code(SimpleStringFilter::equal_to("codePatient"))
                    .identifier(SimpleStringFilter::equal_to("program_enrolment_id")),
                None,
            )
            .unwrap();
        assert_eq!(result.get(0).unwrap().name_row.id, patient_row.id);
        // no result when having an `AND code is "does not exist"` clause
        let result = repo
            .query_by_filter(
                &store_id,
                PatientFilter::new()
                    .code(SimpleStringFilter::equal_to("code does not exist"))
                    .identifier(SimpleStringFilter::equal_to("program_enrolment_id")),
                None,
            )
            .unwrap();
        assert_eq!(result.len(), 0);
        let result = repo
            .query_by_filter(
                &store_id,
                PatientFilter::new()
                    .identifier(SimpleStringFilter::equal_to("identifier does not exist")),
                None,
            )
            .unwrap();
        assert_eq!(result.len(), 0);
    }

    #[actix_rt::test]
    async fn test_patient_program_enrolment_id_allowed_ctx() {
        let (_, connection, _, _) = test_db::setup_all(
            "test_patient_program_enrolment_id_allowed_ctx",
            MockDataInserts::none().names().stores().name_store_joins(),
        )
        .await;
        let repo = PatientRepository::new(&connection);
        let store_id = &mock_test_name_query_store_1().id;

        // add name and name_store_join
        let name_row_repo = NameRowRepository::new(&connection);
        let patient_row = inline_init(|row: &mut NameRow| {
            row.id = "patient_1".to_string();
            row.r#type = NameType::Patient;
            row.code = "codePatient".to_string();
            row.national_health_number = Some("nhnPatient".to_string());
        });
        name_row_repo.upsert_one(&patient_row).unwrap();
        NameStoreJoinRepository::new(&connection)
            .upsert_one(&NameStoreJoinRow {
                id: "name_store_join_patient_id".to_string(),
                name_id: patient_row.id.clone(),
                store_id: store_id.clone(),
                name_is_customer: true,
                name_is_supplier: false,
                is_sync_update: false,
            })
            .unwrap();

        // Searching by program enrolment id requires correct context access
        ProgramEnrolmentRowRepository::new(&connection)
            .upsert_one(&ProgramEnrolmentRow {
                id: util::uuid::uuid(),
                document_name: "doc_name".to_string(),
                patient_id: patient_row.id.clone(),
                document_type: "ProgramType".to_string(),
                context: "ProgramType".to_string(),
                enrolment_datetime: Utc::now().naive_utc(),
                program_enrolment_id: Some("program_enrolment_id".to_string()),
                status: ProgramEnrolmentStatus::Active,
            })
            .unwrap();
        let result = repo
            .query_by_filter(
                &store_id,
                PatientFilter::new()
                    .identifier(SimpleStringFilter::equal_to("program_enrolment_id")),
                Some(&["WrongContext".to_string()]),
            )
            .unwrap();
        assert!(result.is_empty());
        let result = repo
            .query_by_filter(
                &store_id,
                PatientFilter::new()
                    .identifier(SimpleStringFilter::equal_to("program_enrolment_id")),
                Some(&["ProgramType".to_string()]),
            )
            .unwrap();
        assert!(!result.is_empty());
    }
}
