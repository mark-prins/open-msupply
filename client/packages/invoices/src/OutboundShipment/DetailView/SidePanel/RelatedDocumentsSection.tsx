import React, { memo } from 'react';
import {
  PanelRow,
  PanelLabel,
  PanelField,
  Link,
  Grid,
  DetailPanelSection,
  useTranslation,
  useFormatDate,
  RouteBuilder,
  Tooltip,
} from '@openmsupply-client/common';
import { AppRoute } from '@openmsupply-client/config';
import { useOutboundFields } from '../../api';

const RelatedDocumentsSectionComponent = () => {
  const t = useTranslation('distribution');
  const d = useFormatDate();
  const { requisition } = useOutboundFields('requisition');

  if (!requisition) {
    return <PanelLabel>{t('messages.no-related-documents')}</PanelLabel>;
  }

  const { createdDatetime, user, requisitionNumber } = requisition;

  let tooltip = t('messages.customer-requisition-created-on', {
    date: d(new Date(createdDatetime)),
  });
  if (user && user?.username !== 'unknown') {
    tooltip += ` ${t('messages.by-user', { user: user?.username })}`;
  }

  return (
    <DetailPanelSection title={t('heading.related-documents')}>
      <Grid item direction="column" container gap={0.5}>
        <Tooltip title={tooltip}>
          <Grid item>
            <PanelRow>
              <PanelLabel>{t('label.requisition')}</PanelLabel>
              <PanelField>
                <Link
                  to={RouteBuilder.create(AppRoute.Distribution)
                    .addPart(AppRoute.CustomerRequisition)
                    .addPart(String(requisition.requisitionNumber))
                    .build()}
                >{`#${requisitionNumber}`}</Link>
              </PanelField>
            </PanelRow>
          </Grid>
        </Tooltip>
      </Grid>
    </DetailPanelSection>
  );
};

export const RelatedDocumentsSection = memo(RelatedDocumentsSectionComponent);
