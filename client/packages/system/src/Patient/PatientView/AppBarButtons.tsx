import {
  AppBarButtonsPortal,
  Grid,
  LoadingButton,
  PrinterIcon,
  useTranslation,
} from '@openmsupply-client/common';
import { ReportContext, UserStoreNodeFragment } from '@openmsupply-client/api';
import React, { FC } from 'react';
import { AddButton } from './AddButton';
import { ReportRowFragment, ReportSelector, useReport } from '../../Report';
import { usePatient } from '../api';
import { JsonData, useProgramEnrolments } from '@openmsupply-client/programs';

export const AppBarButtons: FC<{
  disabled: boolean;
  store?: UserStoreNodeFragment;
}> = ({ disabled, store }) => {
  const t = useTranslation('common');
  const { print, isPrinting } = useReport.utils.print();
  const patientId = usePatient.utils.id();
  const printReport = (
    report: ReportRowFragment,
    args: JsonData | undefined
  ) => {
    print({ reportId: report.id, dataId: patientId, args });
  };
  const { data: enrolmentData } = useProgramEnrolments.document.list({
    filterBy: {
      patientId: { equalTo: patientId },
    },
  });
  const disableEncounterButton = enrolmentData?.nodes?.length === 0;
  if (!store?.preferences.omProgramModule) return null;

  return (
    <AppBarButtonsPortal>
      <Grid container gap={1}>
        {store?.preferences.omProgramModule && (
          <AddButton
            disabled={disabled}
            disableEncounterButton={disableEncounterButton}
          />
        )}
        <ReportSelector context={ReportContext.Patient} onPrint={printReport}>
          <LoadingButton
            disabled={disabled}
            variant="outlined"
            startIcon={<PrinterIcon />}
            isLoading={isPrinting}
          >
            {t('button.print')}
          </LoadingButton>
        </ReportSelector>
      </Grid>
    </AppBarButtonsPortal>
  );
};
