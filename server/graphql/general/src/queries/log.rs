use async_graphql::{Context, *};
use graphql_core::{standard_graphql_error::validate_auth, ContextExt};
use service::auth::{Resource, ResourceAccessRequest};

#[derive(SimpleObject)]
pub struct LogNode {
    pub file_names: Option<Vec<String>>,
    pub file_content: Option<Vec<String>>,
}

impl LogNode {
    fn from_domain(file_names: Option<Vec<String>>, file_content: Option<Vec<String>>) -> LogNode {
        LogNode {
            file_names,
            file_content,
        }
    }
}

pub fn log_file_names(ctx: &Context<'_>) -> Result<LogNode> {
    validate_auth(
        ctx,
        &ResourceAccessRequest {
            resource: Resource::QueryLog,
            store_id: None,
        },
    )?;

    let service_provider = ctx.service_provider();
    let log_service = &service_provider.log_service;
    let file_names = log_service.get_log_file_names()?;

    Ok(LogNode::from_domain(Some(file_names), None))
}

pub fn log_content(ctx: &Context<'_>, file_name: Option<String>) -> Result<LogNode> {
    validate_auth(
        ctx,
        &ResourceAccessRequest {
            resource: Resource::QueryLog,
            store_id: None,
        },
    )?;

    let service_provider = ctx.service_provider();
    let log_service = &service_provider.log_service;
    let content = log_service.get_log_content(file_name)?;

    Ok(LogNode::from_domain(Some(vec![content.0]), Some(content.1)))
}
