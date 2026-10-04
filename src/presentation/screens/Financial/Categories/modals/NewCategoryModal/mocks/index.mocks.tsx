import { router } from "expo-router";
import { Pressable } from "react-native";
import Svg from "react-native-svg";

import { render } from "@tests";

import CategoryDTO from "@application/dto/financial/CategoryDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { Menu, Picker } from "@components";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";

import NewCategoryModal from "../";
import {
  owners as defaultOwners,
  makeCategoryDTO,
} from "../../../mocks/index.mocks";
import useForm from "../hooks/useForm";

jest.mock("expo-router", () => ({ router: { back: jest.fn() } }));
jest.mock("@infrastructure/fetcher");
jest.mock("../hooks/useForm");
jest.mock("@presentation/i18n/useTranslation", () => ({
  __esModule: true,
  default: () => ({ t: (key: string) => key }),
}));
jest.mock("@application/useCases", () => ({
  useCases: {
    createFinancialCategoryUseCase: {
      execute: jest.fn(),
      uniqueName: "create_category",
    },
    getFinancialCategoriesUseCase: {
      execute: jest.fn(),
      uniqueName: "get_categories",
    },
    getOwnersUseCase: { execute: jest.fn(), uniqueName: "get_owners" },
  },
}));

// region mocks
function field<T>(label: string, value?: T) {
  return { label, onChange: jest.fn(), value };
}

function makeFields(values: Record<string, string | undefined> = {}) {
  return {
    icon: field("Icon", values.icon ?? "folder"),
    iconColor: field("Icon Color", values.iconColor ?? "black"),
    name: field("Name", values.name ?? ""),
    ownerId: field("Owner ID", values.ownerId),
    parentId: field("Parent", values.parentId),
    type: field("Type", values.type ?? "EXPENSE"),
  };
}

const categoryDTOs = [
  makeCategoryDTO({ id: "cat-1", name: "Food" }),
  makeCategoryDTO({ id: "cat-2", name: "Salary", type: "INCOME" }),
  makeCategoryDTO({
    id: "cat-3",
    name: "Rent",
    owner: "FAMILY",
    ownerId: "owner-2",
  }),
];

const validateForm = jest.fn();
const addCategory = new UseMutationFixture<unknown, void>();
// endregion mocks

// region spies
const spies = {
  back: jest.mocked(router.back),
  getCategories: jest.mocked(useCases.getFinancialCategoriesUseCase.execute),
  getOwners: jest.mocked(useCases.getOwnersUseCase.execute),
  useForm: jest.mocked(useForm),
  useMutation: jest.mocked(useMutation),
  useQuery: jest.mocked(useQuery),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

interface SetupProps {
  categories?: CategoryDTO[] | undefined;
  errors?: Record<string, string>;
  fetching?: "categories" | "owners";
  fieldValues?: Record<string, string | undefined>;
  owners?: OwnerDTO[] | undefined;
  status?: "idle" | "success";
}

function setup(props: SetupProps = {}) {
  const data = {
    get_categories: "categories" in props ? props.categories : categoryDTOs,
    get_owners: "owners" in props ? props.owners : defaultOwners,
  };
  const fields = makeFields(props.fieldValues);

  spies.useQuery.mockImplementation(((options: { cacheKey: string[] }) => {
    const key = options.cacheKey[0] as keyof typeof data;
    return {
      data: data[key],
      error: null,
      isFetching:
        props.fetching === (key === "get_owners" ? "owners" : "categories"),
      refetch: jest.fn(),
      status: "success",
    };
  }) as never);
  const builtMutation = addCategory
    .reset()
    .withStatus(props.status ?? "idle")
    .build();
  spies.useMutation.mockReturnValue(builtMutation as never);
  spies.useForm.mockReturnValue({
    errors: props.errors ?? {},
    fields,
    validateForm,
  } as never);

  render(<NewCategoryModal />);

  return { fields, mutate: builtMutation.mutate };
}

const mocks = {
  categories: categoryDTOs,
  Menu,
  owners: defaultOwners,
  Picker,
  Pressable,
  Svg,
  validateForm,
};

export { mocks, setup, spies };
export { act, fireEvent, hasText, screen } from "@tests";
