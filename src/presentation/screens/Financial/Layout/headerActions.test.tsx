import { useState } from "react";
import { Text } from "react-native";

import { fireEvent, render, screen } from "@tests";

import {
  FinancialHeaderActionsProvider,
  useFinancialHeaderActions,
  useFinancialHeaderActionsNode,
} from "./headerActions";

function Host({ mounted }: { mounted: boolean }) {
  return (
    <FinancialHeaderActionsProvider>
      <Slot />
      {mounted ? <Section /> : null}
    </FinancialHeaderActionsProvider>
  );
}

function Section() {
  const [label, setLabel] = useState("first");
  useFinancialHeaderActions(<Text testID={"action"}>{label}</Text>, label);

  return <Text onPress={() => setLabel("second")}>change</Text>;
}

function Slot() {
  return <>{useFinancialHeaderActionsNode()}</>;
}

it("SHOULD show the registered actions, follow their updates and clear them on unmount", () => {
  const { rerender } = render(<Host mounted />);
  expect(screen.getByTestId("action")).toHaveTextContent("first");

  fireEvent.press(screen.getByText("change"));
  expect(screen.getByTestId("action")).toHaveTextContent("second");

  rerender(<Host mounted={false} />);
  expect(screen.queryByTestId("action")).toBeNull();
});
