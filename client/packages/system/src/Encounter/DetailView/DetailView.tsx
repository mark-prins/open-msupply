import React, { FC, useEffect } from 'react';
import {
  useTranslation,
  DetailViewSkeleton,
  AlertModal,
  useNavigate,
  RouteBuilder,
  useDebounceCallback,
  useBreadcrumbs,
  useFormatDateTime,
} from '@openmsupply-client/common';
import { EncounterFragment, useEncounter } from '../api';

import { useJsonForms } from '../../Patient/JsonForms';
import { AppRoute } from '@openmsupply-client/config';
import { Toolbar } from './Toolbar';
import { Footer } from './Footer';

export const DetailView: FC = () => {
  const t = useTranslation('patients');
  const { data: encounter, isLoading } = useEncounter.document.get();
  const navigate = useNavigate();

  const handleSave = useEncounter.document.upsert(
  const dateFormat = useFormatDateTime();
    encounter?.patient.id ?? '',
    encounter?.program ?? '',
    encounter?.type ?? ''
  );

  const { setSuffix } = useBreadcrumbs([AppRoute.Encounter]);
  useEffect(() => {
    if (encounter)
      setSuffix(
        `${
          encounter.document.documentRegistry?.name
        } - ${dateFormat.localisedDateTime(encounter.startDatetime)}`
      );
  }, [encounter]);

  const {
    JsonForm,
    data,
    setData,
    saveData,
    isDirty,
    validationError,
    revert,
  } = useJsonForms(encounter?.document?.name, {
    handleSave,
  });

  const updateEncounter = useDebounceCallback(
    (patch: Partial<EncounterFragment>) =>
      setData({
        ...data,
        ...patch,
      }),
    [data, setData]
  );

  if (isLoading) return <DetailViewSkeleton />;

  return (
    <React.Suspense fallback={<DetailViewSkeleton />}>
      <link rel="stylesheet" href="/medical-icons.css" media="all"></link>
      <Toolbar onChange={updateEncounter} />
      {encounter ? (
        JsonForm
      ) : (
        <AlertModal
          open={true}
          onOk={() =>
            navigate(
              RouteBuilder.create(AppRoute.Dispensary)
                .addPart(AppRoute.Encounter)
                .build()
            )
          }
          title={t('error.encounter-not-found')}
          message={t('messages.click-to-return-to-encounters')}
        />
      )}
      <Footer
        onSave={saveData}
        onCancel={revert}
        isDisabled={!isDirty || !!validationError}
      />
    </React.Suspense>
  );
};
