import { render } from "@tests";

import { useFamilies } from "@screens/Family/hooks";
import FamilyViewModel from "@screens/Family/models/FamilyViewModel";

import Family from "../";
import { makeFamilyViewModel } from "./index.mocks";

jest.mock("@screens/Family/hooks", () => ({ useFamilies: jest.fn() }));
jest.mock("@shopify/flash-list", () => {
  const { View: MockView } = jest.requireActual("react-native");
  return {
    FlashList: ({
      data,
      renderItem,
      ...props
    }: {
      data?: unknown[];
      renderItem: (info: { item: unknown }) => React.ReactNode;
    }) => (
      <MockView testID="flashList" {...props}>
        {data?.map((item, index) => (
          <MockView key={index}>{renderItem({ item })}</MockView>
        ))}
      </MockView>
    ),
  };
});
jest.mock("@screens/Family/containers", () => {
  const { View: MockView } = jest.requireActual("react-native");
  return {
    FamilyCard: (props: { family: unknown; refetchFamilies: () => void }) => (
      <MockView testID="familyCard" {...props} />
    ),
    NewFamilyButton: () => <MockView testID="newFamilyButton" />,
  };
});

// region spies
const spies = {
  useFamilies: jest.mocked(useFamilies),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup(props?: { families?: FamilyViewModel[]; isFetching?: boolean }) {
  const refetch = jest.fn();
  spies.useFamilies.mockReturnValue({
    error: null,
    families: props?.families,
    isFetching: !!props?.isFetching,
    refetch,
    status: "success",
  } as never);

  render(<Family />);

  return { refetch };
}

const mocks = { families: [makeFamilyViewModel()] };

export { mocks, setup };
export { screen } from "@tests";
