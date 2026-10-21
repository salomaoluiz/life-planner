import { act, fireEvent, render, screen, waitFor } from "@tests";

import CategoryDTO from "@application/dto/financial/CategoryDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { useMutation } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import { pickCsvFile } from "@infrastructure/filePicker";
import * as theme from "@presentation/theme";
import useFilterOptions from "@screens/Financial/Transactions/hooks/useFilterOptions";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import ImportWizard from "../index";
import { ImportWizardParams } from "../useImportWizardViewModel";

jest.mock("@infrastructure/fetcher");
jest.mock("@infrastructure/filePicker", () => ({ pickCsvFile: jest.fn() }));
jest.mock("@screens/Financial/Transactions/hooks/useFilterOptions");
jest.mock("@application/useCases", () => ({
  useCases: {
    createFinancialAccountUseCase: {
      execute: jest.fn(),
      uniqueName: "createAccount",
    },
    createFinancialCategoryUseCase: {
      execute: jest.fn(),
      uniqueName: "createCategory",
    },
    createFinancialCreditCardUseCase: {
      execute: jest.fn(),
      uniqueName: "createCard",
    },
    getFinancialCategoriesUseCase: {
      execute: jest.fn().mockResolvedValue([]),
      uniqueName: "getCategories",
    },
    importFinancialTransactionsUseCase: {
      execute: jest.fn(),
      uniqueName: "importTransactions",
    },
    validateFinancialImportUseCase: {
      execute: jest.fn(),
      uniqueName: "validateImport",
    },
  },
}));

const ids = transactionsTestIds;

const owners = [
  new OwnerDTO({ id: "user-id", name: "Me", type: OwnerType.USER }),
  new OwnerDTO({ id: "family-1", name: "Família", type: OwnerType.FAMILY }),
];

function category(id: string, name: string, type = "EXPENSE") {
  return new CategoryDTO({
    icon: "cart",
    id,
    name,
    owner: "USER",
    ownerId: "user-id",
    type,
  });
}

const options = {
  categories: [],
  categoryDtos: [
    category("cat-market", "Mercado"),
    category("cat-salary", "Salário", "INCOME"),
  ],
  sources: [
    {
      archived: false,
      currency: "BRL" as const,
      id: "acc-1",
      kind: "ACCOUNT" as const,
      name: "Corrente",
      ownerId: "user-id",
    },
    {
      archived: false,
      closingDay: 10,
      currency: "BRL" as const,
      id: "card-1",
      kind: "CARD" as const,
      name: "Visa",
      ownerId: "user-id",
    },
  ],
  tags: [],
};

const CSV = [
  "Data;Histórico;Valor;Categoria;Cartão",
  "02/10/2026;Supermercado;-312,40;Mercado;",
  "03/10/2026;Salário;5.200,00;Salário;",
  "05/10/2026;Streaming;-39,90;Assinaturas;Visa",
  "",
].join("\r\n");

function file(text: string, name = "extrato.csv") {
  const bytes = new TextEncoder().encode(text);

  return { bytes, name, size: bytes.length };
}

const mutations = {
  create: new UseMutationFixture<unknown, void>(),
  import: new UseMutationFixture<unknown, number>(),
  validate: new UseMutationFixture<unknown, unknown>(),
};
const params: ImportWizardParams = {
  onClose: jest.fn(),
  onImported: jest.fn(),
  owners,
  screenOwner: "ALL",
};
const spies = {
  create: jest.mocked(useCases.createFinancialCategoryUseCase.execute),
  createAccount: jest.mocked(useCases.createFinancialAccountUseCase.execute),
  createCard: jest.mocked(useCases.createFinancialCreditCardUseCase.execute),
  import: jest.mocked(useCases.importFinancialTransactionsUseCase.execute),
  pick: jest.mocked(pickCsvFile),
  useMutation: jest.mocked(useMutation),
  validate: jest.mocked(useCases.validateFinancialImportUseCase.execute),
};

async function chooseOption(testID: string, value: string) {
  fireEvent.press(screen.getByTestId(testID));
  fireEvent.press(screen.getByTestId(`${testID}-option-${value}`));
}

async function pickFile(text = CSV) {
  spies.pick.mockResolvedValueOnce(file(text));
  fireEvent.press(screen.getByTestId(ids.importPick));
  await waitFor(() =>
    expect(screen.getByTestId(ids.importFileName)).toBeOnTheScreen(),
  );
}

function setup(
  overrides: Partial<ImportWizardParams> = {},
  breakpoint: "compact" | "expanded" = "expanded",
) {
  mutations.create.reset();
  mutations.import.reset();
  mutations.validate.reset();
  jest.mocked(theme.useBreakpoint).mockReturnValue(breakpoint);
  jest.mocked(useFilterOptions).mockReturnValue(options as never);
  spies.useMutation.mockImplementation(((props: { cacheKey: string[] }) => {
    const key = props.cacheKey[0];

    if (key === "validateImport") {
      return mutations.validate.build();
    }

    return key === "importTransactions"
      ? mutations.import.build()
      : mutations.create.build();
  }) as never);

  return render(<ImportWizard {...params} {...overrides} />);
}

// Mapped columns of the sample file: date, description, signed amount, category, card.
async function toColumns() {
  await pickFile();
  fireEvent.press(screen.getByTestId(ids.importContinue));
}

beforeEach(() => jest.clearAllMocks());

export {
  act,
  category,
  chooseOption,
  CSV,
  file,
  fireEvent,
  ids,
  ImportWizard,
  mutations,
  options,
  params,
  pickFile,
  screen,
  setup,
  spies,
  toColumns,
  useFilterOptions,
  waitFor,
};
