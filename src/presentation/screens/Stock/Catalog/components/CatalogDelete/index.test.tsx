import { fireEvent, render, screen } from "@tests";

import { useCases } from "@application/useCases";
import { useMutation } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import { CatalogNode } from "@screens/Stock/Catalog/models/catalogEntries";

import CatalogDelete from "./";

jest.mock("@infrastructure/fetcher", () => ({ useMutation: jest.fn() }));
jest.mock("@application/useCases", () => ({
  useCases: {
    deleteStockCategoryUseCase: { execute: jest.fn(), uniqueName: "del-cat" },
    deleteStockLocationUseCase: { execute: jest.fn(), uniqueName: "del-loc" },
  },
}));
jest.mock("../CatalogDeleteSheet", () => ({
  __esModule: true,
  default: (props: {
    busy: boolean;
    itemCount: number;
    onConfirm: (moveTo?: string) => void;
    targets: Array<{ value: string }>;
  }) => {
    const { Pressable, Text } = jest.requireActual("react-native");

    return (
      <Pressable onPress={() => props.onConfirm("other")} testID="sheet">
        <Text>{`${props.itemCount}|${props.targets.map((t) => t.value).join(",")}`}</Text>
      </Pressable>
    );
  },
}));

function node(
  id: string,
  name: string,
  extra: Partial<CatalogNode> = {},
): CatalogNode {
  return {
    children: [],
    color: "#fff000",
    icon: "cart",
    itemCount: 2,
    name,
    owner: "USER",
    ownerId: "u",
    status: "ACTIVE",
    ...extra,
    id,
  };
}

const remove = new UseMutationFixture<unknown, void>();

beforeEach(() => {
  jest.clearAllMocks();
  remove.reset();
  jest.mocked(useMutation).mockImplementation((() => remove.build()) as never);
});

async function runLast() {
  const run = (remove.value.mutate as jest.Mock).mock.calls[0][0] as {
    moveTo?: string;
  };

  return run;
}

function setup(
  kind: "category" | "location",
  extra: Record<string, unknown> = {},
) {
  const props = {
    categories: [node("a", "A"), node("b", "B")],
    id: "a",
    kind,
    locations: [node("l", "L"), node("m", "M")],
    onClose: jest.fn(),
    onDeleted: jest.fn(),
    ...extra,
  };

  render(<CatalogDelete {...props} />);

  return props;
}

it("SHOULD offer the other rows of the owner as move targets", () => {
  setup("category");

  expect(screen.getByText("2|b")).toBeOnTheScreen();
});

it("SHOULD send the delete of a category with moveTo", async () => {
  const fetchSpy = jest.mocked(useMutation);

  setup("category");
  fireEvent.press(screen.getByTestId("sheet"));

  expect(await runLast()).toEqual({ moveTo: "other" });

  const fetcher = (
    fetchSpy.mock.calls[0][0] as {
      fetch: (p: { moveTo?: string }) => Promise<void>;
    }
  ).fetch;

  await fetcher({ moveTo: "other" });
  expect(useCases.deleteStockCategoryUseCase.execute).toHaveBeenCalledWith({
    id: "a",
    moveTo: "other",
  });
});

it("SHOULD send the delete of a location", async () => {
  setup("location", { id: "l" });

  const fetcher = (
    jest.mocked(useMutation).mock.calls[0][0] as {
      fetch: (p: { moveTo?: string }) => Promise<void>;
    }
  ).fetch;

  await fetcher({});
  expect(useCases.deleteStockLocationUseCase.execute).toHaveBeenCalledWith({
    id: "l",
    moveTo: undefined,
  });
});

it("SHOULD render nothing WHEN the row is gone", () => {
  setup("category", { id: "missing" });

  expect(screen.queryByTestId("sheet")).toBeNull();
});

it("SHOULD report the delete WHEN it succeeded", () => {
  remove.value.status = "success";
  const props = setup("category");

  expect(remove.value.reset).toHaveBeenCalled();
  expect(props.onDeleted).toHaveBeenCalled();
});
