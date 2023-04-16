import React, { FC, ReactNode, useEffect, useState } from 'react';
import {
  AppBarContentPortal,
  Box,
  InputWithLabelRow,
  Grid,
  useTranslation,
  BasicTextInput,
  DatePickerInput,
  DateUtils,
  TimePickerInput,
  UserIcon,
  useFormatDateTime,
  ClinicianNode,
  EncounterNodeStatus,
  LocaleKey,
  TypedTFunction,
  Option,
} from '@openmsupply-client/common';
import {
  EncounterFragment,
  useDocumentRegistry,
} from '@openmsupply-client/programs';
import {
  ClinicianAutocompleteOption,
  ClinicianSearchInput,
  getClinicianName,
} from '../../Clinician';
import { Clinician } from '../../Clinician/utils';
import { Select } from '@common/components';

const encounterStatusTranslation = (
  status: EncounterNodeStatus,
  t: TypedTFunction<LocaleKey>
): string => {
  switch (status) {
    case EncounterNodeStatus.Missed:
      return t('label.encounter-status-missed');
    case EncounterNodeStatus.Cancelled:
      return t('label.encounter-status-cancelled');
    case EncounterNodeStatus.Completed:
      return t('label.encounter-status-completed');
    case EncounterNodeStatus.Scheduled:
      return t('label.encounter-status-scheduled');
    default:
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return ((_: never) => '')(status);
  }
};

const encounterStatusOption = (
  status: EncounterNodeStatus,
  t: TypedTFunction<LocaleKey>
): Option => {
  return {
    label: encounterStatusTranslation(status, t),
    value: status,
  };
};

const Row = ({ label, Input }: { label: string; Input: ReactNode }) => (
  <InputWithLabelRow labelWidth="90px" label={label} Input={Input} />
);
interface ToolbarProps {
  onChange: (patch: Partial<EncounterFragment>) => void;
  encounter: EncounterFragment;
}
export const Toolbar: FC<ToolbarProps> = ({ encounter, onChange }) => {
  const [status, setStatus] = useState<EncounterNodeStatus | undefined>();
  const [startDatetime, setStartDatetime] = useState<string | undefined>();
  const [endDatetime, setEndDatetime] = useState<string | undefined | null>();
  const t = useTranslation('patients');
  const { localisedDate } = useFormatDateTime();
  const [clinician, setClinician] =
    useState<ClinicianAutocompleteOption | null>();
  const { data: programDocument } =
    useDocumentRegistry.get.documentRegistryByType(encounter?.program);

  useEffect(() => {
    if (!encounter) return;

    setStatus(encounter.status ?? undefined);
    setStartDatetime(encounter.startDatetime);
    setEndDatetime(encounter.endDatetime);
    setClinician({
      label: getClinicianName(encounter.clinician as Clinician),
      value: encounter.clinician as Clinician,
    });
  }, [encounter]);

  if (!encounter) return null;
  const { patient } = encounter;

  return (
    <AppBarContentPortal sx={{ display: 'flex', flex: 1, marginBottom: 1 }}>
      <Grid
        container
        flexDirection="row"
        display="flex"
        flex={1}
        alignItems="center"
      >
        <Grid
          item
          sx={{
            alignItems: 'center',
            backgroundColor: 'background.menu',
            borderRadius: '50%',
            display: 'flex',
            height: '100px',
            justifyContent: 'center',
            marginRight: 2,
            width: '100px',
          }}
        >
          <Box>
            <UserIcon fontSize="large" style={{ flex: 1 }} />
          </Box>
        </Grid>
        <Grid item display="flex" flex={1}>
          <Box display="flex" flex={1} flexDirection="column" gap={0.5}>
            <Box display="flex" gap={1.5}>
              <Row
                label={t('label.patient')}
                Input={
                  <BasicTextInput disabled value={encounter?.patient.name} />
                }
              />
              <Row
                label={t('label.date-of-birth')}
                Input={
                  <BasicTextInput
                    disabled
                    value={localisedDate(patient.dateOfBirth ?? '')}
                  />
                }
              />
            </Box>
            <Box display="flex" gap={1.5}>
              <Row
                label={t('label.program')}
                Input={
                  <BasicTextInput
                    disabled
                    value={programDocument?.[0]?.name ?? ''}
                  />
                }
              />
              <Row
                label={t('label.clinician')}
                Input={
                  <ClinicianSearchInput
                    onChange={clinician => {
                      setClinician(clinician);
                      onChange({
                        clinician: clinician?.value as ClinicianNode,
                      });
                    }}
                    clinicianLabel={clinician?.label || ''}
                    clinicianValue={clinician?.value}
                  />
                }
              />
              <Row
                label={t('label.encounter-status')}
                Input={
                  <Select
                    fullWidth
                    onChange={event => {
                      const newStatus = event.target
                        .value as EncounterNodeStatus;
                      setStatus(newStatus);
                      onChange({
                        status: newStatus,
                      });
                    }}
                    options={[
                      encounterStatusOption(EncounterNodeStatus.Missed, t),
                      encounterStatusOption(EncounterNodeStatus.Scheduled, t),
                      encounterStatusOption(EncounterNodeStatus.Completed, t),
                      encounterStatusOption(EncounterNodeStatus.Cancelled, t),
                    ]}
                    value={status}
                  />
                }
              />
            </Box>
            <Box display="flex" gap={1}>
              <Row
                label={t('label.visit-date')}
                Input={
                  <DatePickerInput
                    value={DateUtils.getDateOrNull(startDatetime ?? null)}
                    onChange={date => {
                      const startDatetime = DateUtils.formatRFC3339(date);
                      setStartDatetime(startDatetime);
                      onChange({
                        startDatetime,
                        endDatetime: endDatetime ?? undefined,
                      });
                    }}
                  />
                }
              />
              <InputWithLabelRow
                label={t('label.visit-start')}
                labelWidth="60px"
                Input={
                  <TimePickerInput
                    value={DateUtils.getDateOrNull(startDatetime ?? null)}
                    onChange={date => {
                      const startDatetime = date
                        ? DateUtils.formatRFC3339(date)
                        : undefined;
                      if (startDatetime) {
                        setStartDatetime(startDatetime);
                        onChange({
                          startDatetime,
                          endDatetime: endDatetime ?? undefined,
                        });
                      }
                    }}
                  />
                }
              />
              <InputWithLabelRow
                label={t('label.visit-end')}
                labelWidth="60px"
                Input={
                  <TimePickerInput
                    value={DateUtils.getDateOrNull(endDatetime ?? null)}
                    onChange={date => {
                      const endDatetime = date
                        ? DateUtils.formatRFC3339(date)
                        : undefined;
                      if (endDatetime) {
                        setEndDatetime(endDatetime);
                        onChange({ endDatetime });
                      }
                    }}
                  />
                }
              />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </AppBarContentPortal>
  );
};
