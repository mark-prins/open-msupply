use chrono::NaiveDate;
use repository::{
    DateFilter, EqualFilter, Gender, PatientSort, PatientSortField, RepositoryError, StringFilter,
};

use crate::{
    service_provider::{ServiceContext, ServiceProvider},
    ListResult,
};

use super::{Patient, PatientFilter};

pub struct PatientSearch {
    pub code: Option<String>,
    pub code_2: Option<String>,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub date_of_birth: Option<NaiveDate>,
    pub gender: Option<Gender>,
    pub name_or_code: Option<String>,
}

pub struct PatientSearchResult {
    pub patient: Patient,
    /// Indicates how good the match was
    pub score: f64,
}

pub fn patient_search(
    ctx: &ServiceContext,
    service_provider: &ServiceProvider,
    input: PatientSearch,
    allowed_ctx: Option<&[String]>,
) -> Result<ListResult<PatientSearchResult>, RepositoryError> {
    let mut filter = PatientFilter::new();
    let PatientSearch {
        code,
        code_2,
        first_name,
        last_name,
        date_of_birth,
        gender,
        name_or_code,
    } = input;

    if let Some(code) = code {
        filter = filter.code(StringFilter::equal_to(&code));
    }
    if let Some(code_2) = code_2 {
        filter = filter.code_2(StringFilter::equal_to(&code_2));
    }
    if let Some(first_name) = first_name {
        filter = filter.first_name(StringFilter::like(&first_name));
    }
    if let Some(last_name) = last_name {
        filter = filter.last_name(StringFilter::like(&last_name));
    }
    if let Some(date_of_birth) = date_of_birth {
        filter = filter.date_of_birth(DateFilter::equal_to(date_of_birth));
    }
    if let Some(gender) = gender {
        filter = filter.gender(EqualFilter {
            equal_to: Some(gender),
            not_equal_to: None,
            equal_any: None,
            not_equal_all: None,
            equal_any_or_null: None,
            is_null: None,
        });
    }
    if let Some(name_or_code) = name_or_code {
        filter = filter.name_or_code(StringFilter::like(&name_or_code));
    }

    let results = service_provider.patient_service.get_patients(
        ctx,
        None,
        Some(filter),
        Some(PatientSort {
            key: PatientSortField::Code,
            desc: Some(false),
        }),
        allowed_ctx,
    )?;

    let results = ListResult {
        rows: results
            .rows
            .into_iter()
            .map(|patient| PatientSearchResult {
                patient,
                score: 1.0,
            })
            .collect(),
        count: results.count,
    };
    Ok(results)
}
