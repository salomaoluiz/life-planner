import { render, screen } from "@tests";

import { Text } from "@components";

import CameraViewport from "./";

it("SHOULD render its children inside the frame", () => {
  render(
    <CameraViewport height={200} showGuide testID="viewport">
      <Text.Body value="camera" />
    </CameraViewport>,
  );

  expect(screen.getByTestId("viewport")).toBeOnTheScreen();
  expect(screen.getByText("camera")).toBeOnTheScreen();
});
