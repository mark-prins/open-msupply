import {
  SortBy,
  PatientSortFieldInput,
  InsertPatientInput,
  UpdatePatientInput,
  FilterBy,
  PatientSearchInput,
  ProgramEnrolmentSortFieldInput,
  SortRule,
  EncounterSortFieldInput,
  PaginationInput,
  CentralPatientSearchInput,
} from '@openmsupply-client/common';
import {
  Sdk,
  PatientRowFragment,
  CentralPatientSearchQuery,
  LinkPatientToStoreMutation,
} from './operations.generated';

export type ListParams = {
  first?: number;
  offset?: number;
  sortBy?: SortBy<PatientRowFragment>;
  filterBy?: FilterBy | null;
};

export type ProgramEnrolmentListParams = {
  sortBy?: SortRule<ProgramEnrolmentSortFieldInput>;
  filterBy?: FilterBy;
};

export type EncounterListParams = {
  first?: number;
  offset?: number;
  sortBy: SortRule<EncounterSortFieldInput>;
  filterBy?: FilterBy | null;
  pagination?: PaginationInput;
};

export type CentralPatientSearchResponse =
  CentralPatientSearchQuery['centralPatientSearch'];

export type LinkPatientToStoreResponse =
  LinkPatientToStoreMutation['linkPatientToStore'];

export const getPatientQueries = (sdk: Sdk, storeId: string) => ({
  get: {
    byId: async (nameId: string) => {
      const result = await sdk.patientById({ storeId, nameId });
      const { patients } = result;
      if (patients.__typename === 'PatientConnector') {
        return patients.nodes[0];
      }

      throw new Error('Name not found');
    },
    list: async ({
      first,
      offset,
      sortBy,
      filterBy,
    }: ListParams): Promise<{
      nodes: PatientRowFragment[];
      totalCount: number;
    }> => {
      const key = sortBy?.key as PatientSortFieldInput;

      const result = await sdk.patients({
        first,
        offset,
        key,
        desc: !!sortBy?.isDesc,
        storeId,
        filter: filterBy,
      });

      return result?.patients;
    },
    listAll: async ({
      sortBy,
    }: ListParams): Promise<{
      nodes: PatientRowFragment[];
      totalCount: number;
    }> => {
      const key =
        sortBy?.key === 'name'
          ? PatientSortFieldInput.Name
          : PatientSortFieldInput.Code;

      const result = await sdk.patients({
        key,
        desc: !!sortBy?.isDesc,
        storeId,
      });

      return result?.patients;
    },
    search: async (
      input: PatientSearchInput
    ): Promise<{ score: number; patient: PatientRowFragment }[]> => {
      const result = await sdk.patientSearch({
        storeId,
        input,
      });

      if (result.patientSearch.__typename === 'PatientSearchConnector') {
        return result.patientSearch.nodes;
      }

      throw new Error('Could not search for patients');
    },
    centralSearch: async (
      input: CentralPatientSearchInput
    ): Promise<CentralPatientSearchResponse> => {
      const result = await sdk.centralPatientSearch({
        storeId,
        input,
      });
      return result.centralPatientSearch;
    },
  },
  insertPatient: async (
    input: InsertPatientInput
  ): Promise<PatientRowFragment> => {
    const result = await sdk.insertPatient({
      storeId,
      input,
    });

    if (result.insertPatient?.__typename === 'PatientNode') {
      return result.insertPatient;
    }

    throw new Error('Could not insert patient');
  },

  updatePatient: async (
    input: UpdatePatientInput
  ): Promise<PatientRowFragment> => {
    const result = await sdk.updatePatient({
      storeId,
      input,
    });

    if (result.updatePatient.__typename === 'PatientNode') {
      return result.updatePatient;
    }

    throw new Error('Could not update patient');
  },
  linkPatientToStore: async (
    nameId: string
  ): Promise<LinkPatientToStoreResponse> => {
    const result = await sdk.linkPatientToStore({
      storeId,
      nameId,
    });
    return result.linkPatientToStore;
  },
});