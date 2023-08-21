import { useMemo } from 'react';
import {
  DateUtils,
  LocaleKey,
  TypedTFunction,
  useTranslation,
} from '@common/intl';
import { EncounterNodeStatus } from '@openmsupply-client/api';
import { EncounterRowFragment } from '@openmsupply-client/programs';
import { noOtherVariants } from '@openmsupply-client/common';

export const encounterStatusTranslation = (
  status: EncounterNodeStatus,
  t: TypedTFunction<LocaleKey>
): string => {
  switch (status) {
    case EncounterNodeStatus.Pending:
      return t('label.encounter-status-pending');
    case EncounterNodeStatus.Cancelled:
      return t('label.encounter-status-cancelled');
    case EncounterNodeStatus.Visited:
      return t('label.encounter-status-visited');
    default:
      return noOtherVariants(status);
  }
};

export type EncounterFragmentWithStatus = {
  effectiveStatus: string;
} & EncounterRowFragment;

export const useEncounterFragmentWithStatus = (
  nodes?: EncounterRowFragment[]
): EncounterFragmentWithStatus[] | undefined => {
  const t = useTranslation();
  return useMemo(
    () =>
      nodes?.map(node => ({
        effectiveStatus: node.status
          ? encounterStatusTranslation(node.status, t)
          : '',
        ...node,
      })),
    [nodes]
  );
};

export const useLogicalStatus = (
  startDatetime: Date,
  t: ReturnType<typeof useTranslation>
): string | undefined => {
  if (DateUtils.differenceInMinutes(startDatetime, new Date()) < 0) {
    return `${t('label.encounter')} ${t('label.encounter-status-missed')}`;
  } else if (DateUtils.differenceInMinutes(startDatetime, new Date()) > 0) {
    return `${t('label.encounter')} ${t('label.encounter-status-scheduled')}`;
  }
};
