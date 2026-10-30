import { useLocalSearchParams } from "expo-router";

import { render } from "@tests";

import ModalRoute from "./ModalRoute";

jest.mock("expo-router", () => {
  const { Text: Label } = jest.requireActual("react-native");

  return {
    Unmatched: () => <Label>unmatched</Label>,
    useLocalSearchParams: jest.fn(),
  };
});
jest.mock("./modalRoutes", () => {
  const { Text: Label } = jest.requireActual("react-native");

  return {
    MODAL_ROUTES: {
      add_new_account: () => <Label>account-modal</Label>,
      versions: () => <Label>versions-modal</Label>,
    },
  };
});

function renderWith(modal: string | string[]) {
  jest.mocked(useLocalSearchParams).mockReturnValue({ modal } as never);

  return render(<ModalRoute />);
}

it("SHOULD render the modal named by the last segment", () => {
  const screen = renderWith(["financial", "overview", "add_new_account"]);

  expect(screen.getByText("account-modal")).toBeTruthy();
});

it("SHOULD accept a single string segment", () => {
  expect(renderWith("versions").getByText("versions-modal")).toBeTruthy();
});

it("SHOULD render not found WHEN the modal name is unknown", () => {
  expect(renderWith(["foo"]).getByText("unmatched")).toBeTruthy();
});
