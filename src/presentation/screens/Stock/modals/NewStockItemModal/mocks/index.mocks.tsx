import { router } from "expo-router";
import { Pressable } from "react-native";

import { render } from "@tests";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { DatePicker, Picker } from "@components";
import { StockUnits } from "@domain/entities/stock/StockEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";

import NewStockItemModal from "../";
import useForm from "../hooks/useForm";

jest.mock("expo-router", () => ({ router: { back: jest.fn() } }));
jest.mock("@infrastructure/fetcher");
jest.mock("../hooks/useForm");
jest.mock("@application/useCases", () => ({
  useCases: {
    createStockItemUseCase: { execute: jest.fn(), uniqueName: "create_stock" },
    getOwnersUseCase: { execute: jest.fn(), uniqueName: "get_owners" },
  },
}));

// region mocks
const owners = [
  new OwnerDTO({ id: "owner-1", name: "Alice Test", type: OwnerType.USER }),
  new OwnerDTO({ id: "owner-2", name: "Test Family", type: OwnerType.FAMILY }),
];

function field<T>(label: string, value: T) {
  return { label, onChange: jest.fn(), value };
}

const fields = {
  barcode: field<string | undefined>("Barcode", undefined),
  brand: field<string | undefined>("Brand", undefined),
  description: field("Description", ""),
  expirationDate: field<Date | undefined>("Expiration Date", undefined),
  notes: field<string | undefined>("Notes", undefined),
  openingDate: field<Date | undefined>("Opening Date", undefined),
  owner: field<string | undefined>("Owner", undefined),
  ownerId: field<string | undefined>("Owner ID", undefined),
  purchaseDate: field<Date | undefined>("Purchase Date", undefined),
  quantity: field("Quantity", "1"),
  unit: field("Unit", StockUnits.UNIT),
};

const validateForm = jest.fn();
const ownersQuery = new UseQueryFixture<OwnerDTO[]>();
const addStock = new UseMutationFixture<unknown, void>();
// endregion mocks

// region spies
const spies = {
  back: jest.mocked(router.back),
  useForm: jest.mocked(useForm),
  useMutation: jest.mocked(useMutation),
  useQuery: jest.mocked(useQuery),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup(props?: {
  errors?: Record<string, string>;
  isFetching?: boolean;
  noOwners?: boolean;
  status?: "idle" | "success";
}) {
  ownersQuery.reset().withIsFetching(!!props?.isFetching);
  if (!props?.noOwners) {
    ownersQuery.withData(owners);
  }
  addStock.reset().withStatus(props?.status ?? "idle");
  const builtMutation = addStock.build();

  spies.useQuery.mockReturnValue(ownersQuery.build() as never);
  spies.useMutation.mockReturnValue(builtMutation as never);
  spies.useForm.mockReturnValue({
    errors: props?.errors ?? {},
    fields,
    validateForm,
  } as never);

  render(<NewStockItemModal />);

  return { mutate: builtMutation.mutate };
}

const mocks = { DatePicker, fields, owners, Picker, Pressable, validateForm };

export { mocks, setup, spies };
export { fireEvent, hasText, screen } from "@tests";
