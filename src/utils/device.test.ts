import { mocks, setup, spies } from "./mocks/device.mocks";

it("SHOULD get the screen sizes", () => {
  spies.get.mockReturnValue(mocks.screenSizes);

  const result = setup.getScreenSizes();

  expect(result).toEqual({
    height: mocks.screenSizes.height,
    width: mocks.screenSizes.width,
  });
});

it("SHOULD get the window sizes", () => {
  spies.get.mockReturnValue(mocks.windowSizes);

  const result = setup.getWindowsSizes();

  expect(result).toEqual({
    height: mocks.windowSizes.height,
    width: mocks.windowSizes.width,
  });
});
