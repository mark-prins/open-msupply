use crate::ContextRow;

pub fn context_program_a() -> ContextRow {
    ContextRow {
        id: "program_a".to_string(),
        name: "Context for program_a".to_string(),
    }
}

pub fn mock_contexts() -> Vec<ContextRow> {
    vec![context_program_a()]
}
