import { router, usePathname } from "expo-router";

import { render } from "@tests";

import SectionPicker from "../";

jest.mock("expo-router", () => ({
  router: { back: jest.fn(), replace: jest.fn() },
  usePathname: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

function setup(pathname = "/financial/transaction") {
  jest.mocked(usePathname).mockReturnValue(pathname);

  return render(<SectionPicker />);
}

const spies = {
  back: jest.mocked(router.back),
  replace: jest.mocked(router.replace),
};

export { setup, spies };
