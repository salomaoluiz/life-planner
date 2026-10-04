import { router, useLocalSearchParams } from "expo-router";
import { Pressable } from "react-native";

import { render } from "@tests";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { Picker } from "@components";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";

import NewAccountModal from "../";
import { owners as defaultOwners } from "../../../mocks/index.mocks";
import useForm from "../hooks/useForm";

jest.mock("expo-router", () => ({
  router: { back: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@infrastructure/fetcher");
jest.mock("../hooks/useForm");
jest.mock("@presentation/i18n/useTranslation", () => ({
  __esModule: true,
  default: () => ({ t: (key: string) => key }),
}));
jest.mock("@application/useCases", () => ({
  useCases: {
    createFinancialAccountUseCase: {
      execute: jest.fn(),
      uniqueName: "create_account",
    },
    getOwnersUseCase: { execute: jest.fn(), uniqueName: "get_owners" },
    updateFinancialAccountUseCase: {
      execute: jest.fn(),
      uniqueName: "update_account",
    },
  },
}));

// region mocks
function field<T>(value?: T) {
  return { label: "", onChange: jest.fn(), value };
}

function makeFields(values: Record<string, string | undefined> = {}) {
  return {
    balance: field(values.balance ?? "0"),
    icon: field(values.icon ?? "bank"),
    name: field(values.name ?? ""),
    ownerId: field(values.ownerId),
    status: field(values.status ?? "ACTIVE"),
  };
}

const validateForm = jest.fn();
const ownersQuery = new UseQueryFixture<OwnerDTO[]>();
const saveMutation = new UseMutationFixture<unknown, void>();
// endregion mocks

// region spies
const spies = {
  back: jest.mocked(router.back),
  createAccount: jest.mocked(useCases.createFinancialAccountUseCase.execute),
  params: jest.mocked(useLocalSearchParams),
  updateAccount: jest.mocked(useCases.updateFinancialAccountUseCase.execute),
  useForm: jest.mocked(useForm),
  useMutation: jest.mocked(useMutation),
  useQuery: jest.mocked(useQuery),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

interface SetupProps {
  errors?: Record<string, string>;
  fieldValues?: Record<string, string | undefined>;
  isFetching?: boolean;
  noOwners?: boolean;
  params?: Record<string, string>;
  status?: "idle" | "success";
}

function setup(props: SetupProps = {}) {
  spies.params.mockReturnValue(props.params ?? {});
  ownersQuery.reset().withIsFetching(!!props.isFetching);
  if (!props.noOwners) {
    ownersQuery.withData(defaultOwners);
  }
  const builtMutation = saveMutation
    .reset()
    .withStatus(props.status ?? "idle")
    .build();
  const fields = makeFields(props.fieldValues);

  spies.useQuery.mockReturnValue(ownersQuery.build() as never);
  spies.useMutation.mockReturnValue(builtMutation as never);
  spies.useForm.mockReturnValue({
    errors: props.errors ?? {},
    fields,
    validateForm,
  } as never);

  render(<NewAccountModal />);

  return { fields, mutate: builtMutation.mutate };
}

const mocks = { owners: defaultOwners, Picker, Pressable, validateForm };

export { mocks, setup, spies };
export { fireEvent, hasText, screen } from "@tests";
