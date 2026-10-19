import { fireEvent, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import { render } from "@tests";

import { isWeb } from "@utils/platform";

import Tooltip from "./index";

jest.mock("@utils/platform", () => ({ isWeb: jest.fn() }));

function setup(content?: React.ReactNode) {
  return render(
    <Tooltip content={content} testID="bubble">
      <Text testID="child">child</Text>
    </Tooltip>,
  );
}

it("SHOULD show the content on hover and hide it on leave in web mode", () => {
  jest.mocked(isWeb).mockReturnValue(true);
  setup(<Text>lines</Text>);

  expect(screen.queryByTestId("bubble")).toBeNull();

  fireEvent(screen.getByTestId("child").parent!.parent!, "hoverIn");
  expect(screen.getByTestId("bubble")).toBeTruthy();

  fireEvent(screen.getByTestId("child").parent!.parent!, "hoverOut");
  expect(screen.queryByTestId("bubble")).toBeNull();
});

it("SHOULD render only the children on native or without content", () => {
  jest.mocked(isWeb).mockReturnValue(false);
  setup(<Text>lines</Text>);
  expect(screen.getByTestId("child")).toBeTruthy();

  jest.mocked(isWeb).mockReturnValue(true);
  setup(undefined);
  expect(screen.queryByTestId("bubble")).toBeNull();
});
