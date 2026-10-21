import { fireEvent, render, renderHook, screen } from "@tests";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import { saveCsvFile } from "@infrastructure/fileSave";
import * as theme from "@presentation/theme";
import useFilterOptions from "@screens/Financial/Transactions/hooks/useFilterOptions";

import ExportModal from "../index";
import useExportModalViewModel, {
  ExportModalParams,
} from "../useExportModalViewModel";

jest.mock("@infrastructure/fetcher");
jest.mock("@infrastructure/fileSave", () => ({ saveCsvFile: jest.fn() }));
jest.mock("@screens/Financial/Transactions/hooks/useFilterOptions");
jest.mock("@application/useCases", () => ({
  useCases: {
    exportFinancialTransactionsUseCase: {
      execute: jest.fn(),
      uniqueName: "exportTransactions",
    },
    getFinancialExportCountUseCase: {
      execute: jest.fn(),
      uniqueName: "exportCount",
    },
  },
}));

const owners = [
  new OwnerDTO({ id: "user-id", name: "Me", type: OwnerType.USER }),
  new OwnerDTO({ id: "family-1", name: "Família", type: OwnerType.FAMILY }),
  new OwnerDTO({
    archived: true,
    id: "family-old",
    name: "Antiga",
    type: OwnerType.FAMILY,
  }),
];
const options = {
  categories: [],
  categoryDtos: [],
  sources: [
    {
      archived: false,
      id: "acc-1",
      kind: "ACCOUNT" as const,
      name: "Checking",
      ownerId: "user-id",
    },
    {
      archived: false,
      id: "card-1",
      kind: "CARD" as const,
      name: "Visa",
      ownerId: "family-1",
    },
    {
      archived: true,
      id: "acc-old",
      kind: "ACCOUNT" as const,
      name: "Old",
      ownerId: "user-id",
    },
  ],
  tags: [],
};
const params: ExportModalParams = { onClose: jest.fn(), owners };
const countQuery = new UseQueryFixture<number>();
const exportMutation = new UseMutationFixture<void, void>();

const spies = {
  count: jest.mocked(useCases.getFinancialExportCountUseCase.execute),
  export: jest.mocked(useCases.exportFinancialTransactionsUseCase.execute),
  save: jest.mocked(saveCsvFile),
  useMutation: jest.mocked(useMutation),
  useQuery: jest.mocked(useQuery),
};

function given(
  count?: number,
  breakpoint: "compact" | "expanded" = "expanded",
) {
  countQuery.reset();
  exportMutation.reset();
  if (count !== undefined) {
    countQuery.withData(count);
  }
  jest.mocked(theme.useBreakpoint).mockReturnValue(breakpoint);
  jest.mocked(useFilterOptions).mockReturnValue(options as never);
  spies.useQuery.mockImplementation(() => countQuery.build() as never);
  spies.useMutation.mockImplementation(() => exportMutation.build() as never);
}

function lastMutationProps() {
  return spies.useMutation.mock.calls[
    spies.useMutation.mock.calls.length - 1
  ][0];
}

// The options the last `useQuery` / `useMutation` call received (the fetch functions).
function lastQueryProps() {
  return spies.useQuery.mock.calls[spies.useQuery.mock.calls.length - 1][0];
}

function setupHook(count?: number) {
  given(count);

  return renderHook(() => useExportModalViewModel(params));
}

function setupView(
  count?: number,
  breakpoint: "compact" | "expanded" = "expanded",
) {
  given(count, breakpoint);

  return render(<ExportModal {...params} />);
}

beforeEach(() => jest.clearAllMocks());

export {
  exportMutation,
  fireEvent,
  lastMutationProps,
  lastQueryProps,
  params,
  screen,
  setupHook,
  setupView,
  spies,
};
