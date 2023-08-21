import React from 'react';
import { ComponentMeta, Story } from '@storybook/react';
import { Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { Breadcrumbs } from './Breadcrumbs';
import { StoryProvider, TestingRouter } from '../../../../utils/testing';
import { RouteBuilder } from '../../../../utils';

export default {
  title: 'Components/Breadcrumbs',
  component: Breadcrumbs,
} as ComponentMeta<typeof Breadcrumbs>;

const Template: Story<{ initialEntries: string[] }> = ({ initialEntries }) => {
  return (
    <StoryProvider>
      <TestingRouter initialEntries={initialEntries}>
        <Route
          path="*"
          element={
            <Box>
              <Breadcrumbs />
            </Box>
          }
        ></Route>
      </TestingRouter>
    </StoryProvider>
  );
};

export const Short = Template.bind({});
Short.args = {
  initialEntries: [RouteBuilder.create('distribution').build()],
};

export const Medium = Template.bind({});
Medium.args = {
  initialEntries: [
    RouteBuilder.create('distribution')
      .addPart('outbound-shipment')
      .addPart('3')
      .build(),
  ],
};

export const TooLong = Template.bind({});
TooLong.args = {
  initialEntries: [
    RouteBuilder.create('distribution')
      .addPart('outbound-shipment')
      .addPart('distribution')
      .addPart('outbound-shipment')
      .addPart('distribution')
      .addPart('outbound-shipment')
      .addPart('distribution')
      .addPart('outbound-shipment')
      .addPart('distribution')
      .addPart('outbound-shipment')
      .addPart('distribution')
      .addPart('outbound-shipment')
      .addPart('distribution')
      .addPart('outbound-shipment')
      .addPart('distribution')
      .addPart('outbound-shipment')
      .addPart('distribution')
      .addPart('outbound-shipment')
      .addPart('3')
      .build(),
  ],
};
