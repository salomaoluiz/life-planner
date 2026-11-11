import { fireEvent, screen } from "@testing-library/react-native";

import { hasText } from "@tests";

import investmentTestIds from "@screens/Investment/testIds";

import { setup } from "./mocks/index.mocks";

const ids = investmentTestIds.modal.incomeReceive;

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD show the planned value, the gross estimate AND confirm or delete", () => {
  const { vm } = setup();

  fireEvent.press(screen.getByTestId(ids.save));
  fireEvent.press(screen.getByTestId(ids.delete));

  expect(hasText("investment.income.receive.title")).toBe(true);
  expect(hasText("R$ 71,40")).toBe(true);
  expect(screen.getByText(/investment.income.estimate/)).toBeOnTheScreen();
  expect(vm.onSave).toHaveBeenCalledTimes(1);
  expect(vm.onDelete).toHaveBeenCalledTimes(1);
});

it("SHOULD hide the gross line WHEN there is no withholding AND show the failure", () => {
  setup({
    failure: { key: "investment.income.errors.received" },
    showGross: false,
  });

  expect(screen.queryByText(/investment.income.estimate/)).toBeNull();
  expect(hasText("investment.income.errors.received")).toBe(true);
});

it("SHOULD render the loading AND the not found states", () => {
  setup({ isLoading: true });
  expect(screen.queryByTestId(ids.netAmount)).toBeNull();

  setup({ isNotFound: true });
  expect(hasText("investment.detail.notFound")).toBe(true);
});
