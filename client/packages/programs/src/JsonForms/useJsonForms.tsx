import React, { useEffect, useState } from 'react';
import {
  useTranslation,
  useNotification,
  useConfirmOnLeaving,
} from '@openmsupply-client/common';
import { JsonData, JsonForm } from './common';
import { useDocumentLoader } from './useDocumentLoader';
import _ from 'lodash';
import {
  JsonFormsRendererRegistryEntry,
  JsonSchema,
  UISchemaElement,
} from '@jsonforms/core';
import {
  EncounterLineChart,
  encounterLineChartTester,
  BMI,
  bmiTester,
  DateOfBirth,
  dateOfBirthTester,
  IdGenerator,
  idGeneratorTester,
  QuantityPrescribed,
  quantityDispensedTester,
  AdherenceScore,
  adherenceScoreTester,
  PreviousEncounterField,
  previousEncounterFieldTester,
  DecisionTreeControl,
  decisionTreeTester,
  Search,
  searchTester,
  programEventTester,
  ProgramEvent,
} from './components';

// https://stackoverflow.com/questions/57874879/how-to-treat-missing-undefined-properties-as-equivalent-in-lodashs-isequalwit
// TODO: handle undefined and empty string as equal? e.g. initial data is undefined and current data is ""
const isEqualIgnoreUndefined = (
  a: JsonData | undefined,
  b: JsonData | undefined
) => {
  const comparisonFunc = (a: JsonData | undefined, b: JsonData | undefined) => {
    if (_.isArray(a) || _.isArray(b)) return;
    if (!_.isObject(a) || !_.isObject(b)) return;

    if (!_.includes(a, undefined) && !_.includes(b, undefined)) return;

    // Call recursively, after filtering all undefined properties
    return _.isEqualWith(
      _.omitBy(a, value => value === undefined),
      _.omitBy(b, value => value === undefined),
      comparisonFunc
    );
  };
  return _.isEqualWith(a, b, comparisonFunc);
};

export type SavedDocument = {
  id: string;
  name: string;
  type: string;
};

export type SaveDocumentMutation = (
  jsonData: unknown,
  formSchemaId: string,
  parent?: string
) => Promise<SavedDocument>;

interface JsonFormOptions {
  onCancel?: () => void;
  handleSave?: SaveDocumentMutation;
}

export interface SchemaData {
  formSchemaId?: string;
  jsonSchema: JsonSchema;
  uiSchema: UISchemaElement;
}

/**
 * Information required to create a new document
 */
export interface FormInputData {
  data: JsonData;
  schema: SchemaData;
  /** Indicates if data is newly created, i.e. if the data isDirty */
  isCreating: boolean;
}

const additionalRenderers: JsonFormsRendererRegistryEntry[] = [
  { tester: idGeneratorTester, renderer: IdGenerator },
  { tester: dateOfBirthTester, renderer: DateOfBirth },
  { tester: encounterLineChartTester, renderer: EncounterLineChart },
  { tester: quantityDispensedTester, renderer: QuantityPrescribed },
  { tester: bmiTester, renderer: BMI },
  { tester: adherenceScoreTester, renderer: AdherenceScore },
  {
    tester: previousEncounterFieldTester,
    renderer: PreviousEncounterField,
  },
  { tester: decisionTreeTester, renderer: DecisionTreeControl },
  { tester: searchTester, renderer: Search },
  { tester: programEventTester, renderer: ProgramEvent },
];

/**
 * @param docName the document name (if the document already exist)
 * @param inputData the initial data of of the document, e.g. if the the document doesn't exist yet
 * or if there isn't a document.
 */

export const useJsonForms = (
  docName: string | undefined,
  patientId: string | undefined,
  options: JsonFormOptions = {},
  inputData?: FormInputData
) => {
  const {
    data: loadedData,
    isLoading,
    documentId,
    schema,
    error,
  } = useDocumentLoader(docName, inputData);
  const [initialData, setInitialData] = useState<JsonData | undefined>(
    loadedData
  );
  useEffect(() => {
    setInitialData(loadedData);
  }, [loadedData]);
  // current modified data
  const [data, setData] = useState<JsonData | undefined>();
  const [isSaving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState<boolean>();
  const t = useTranslation('common');
  const [validationError, setValidationError] = useState<string | false>(false);
  const { success, error: errorNotification } = useNotification();

  useConfirmOnLeaving(isDirty);

  // returns the document name
  const saveData = async (): Promise<string | undefined> => {
    if (data === undefined) {
      return undefined;
    }
    setSaving(true);

    // Run mutation...
    try {
      const result = await options.handleSave?.(
        data,
        schema?.formSchemaId ?? '',
        documentId
      );

      const successSnack = success(t('success.data-saved'));
      successSnack();

      setInitialData(data);
      return result?.name;
    } catch (err) {
      const errorSnack = errorNotification(t('error.problem-saving'));
      errorSnack();
    } finally {
      setSaving(false);
    }
  };

  const revert = () => {
    setIsDirty(false);
    setData(initialData);
  };

  const updateData = (newData: JsonData) => {
    setData(newData);
  };

  useEffect(() => {
    const dirty =
      isSaving ||
      isLoading ||
      // document doesn't exist yet; always set the isDirty flag
      !!inputData?.isCreating ||
      !isEqualIgnoreUndefined(initialData, data);
    setIsDirty(dirty);
    if (data === undefined) {
      setData(initialData);
    }
  }, [initialData, data, isSaving, isLoading, inputData]);

  useEffect(() => {
    setData(initialData);
    return () => setIsDirty(false);
  }, [initialData]);

  return {
    JsonForm: (
      <JsonForm
        data={data}
        jsonSchema={schema?.jsonSchema ?? {}}
        uiSchema={schema?.uiSchema ?? { type: 'Control' }}
        isError={!!error}
        isLoading={isLoading}
        setError={setValidationError}
        updateData={updateData}
        additionalRenderers={additionalRenderers}
        config={{
          documentName: docName,
          patientId,
        }}
      />
    ),
    data,
    setData,
    saveData,
    revert,
    isSaving,
    isLoading,
    isDirty: isDirty ?? false,
    error,
    validationError,
  };
};