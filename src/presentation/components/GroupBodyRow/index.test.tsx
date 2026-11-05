import { screen } from "@testing-library/react-native";
import { Text } from "react-native";

import { render } from "@tests";

import GroupBodyRow from "./index";

it("SHOULD render its children under the test id", () => {
  render(
    <GroupBodyRow testID="row">
      <Text>child</Text>
    </GroupBodyRow>,
  );

  expect(screen.getByTestId("row")).toBeTruthy();
  expect(screen.getByText("child")).toBeTruthy();
});

it("SHOULD close the card WHEN it is the last row AND stay bare in a tooltip", () => {
  const { rerender } = render(
    <GroupBodyRow isLast testID="row">
      <Text>child</Text>
    </GroupBodyRow>,
  );

  expect(screen.getByTestId("row").props.style).toMatchObject({
    borderBottomWidth: 1,
    borderLeftWidth: 1,
  });

  rerender(
    <GroupBodyRow isLast testID="row" variant="bare">
      <Text>child</Text>
    </GroupBodyRow>,
  );

  expect(screen.getByTestId("row").props.style).toMatchObject({
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  });
});

it("SHOULD tint the row WHEN highlighted (the favorite account, spec 094)", () => {
  const { rerender } = render(
    <GroupBodyRow testID="row">
      <Text>child</Text>
    </GroupBodyRow>,
  );
  const plain = screen.getByTestId("row").props.style.backgroundColor;

  rerender(
    <GroupBodyRow highlight testID="row">
      <Text>child</Text>
    </GroupBodyRow>,
  );

  expect(screen.getByTestId("row").props.style.backgroundColor).not.toBe(plain);
});
