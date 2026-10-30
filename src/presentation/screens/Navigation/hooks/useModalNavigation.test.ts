import { router, usePathname } from "expo-router";

import { renderHook } from "@tests";

const useModalNavigation = jest.requireActual("./useModalNavigation").default;

jest.mock("expo-router", () => ({
  router: {
    back: jest.fn(),
    canGoBack: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  },
  usePathname: jest.fn(),
}));

function setup(pathname: string, canGoBack = true) {
  jest.mocked(usePathname).mockReturnValue(pathname);
  jest.mocked(router.canGoBack).mockReturnValue(canGoBack);

  return renderHook(() => useModalNavigation()).result.current;
}

beforeEach(() => jest.clearAllMocks());

describe("openModal", () => {
  it("SHOULD push the modal under the current screen", () => {
    setup("/financial/overview").openModal("add_new_transaction");

    expect(router.push).toHaveBeenCalledWith({
      params: undefined,
      pathname: "/financial/overview/add_new_transaction",
    });
  });

  it("SHOULD push a single segment from Home", () => {
    setup("/").openModal("add_new_transaction", { id: "1" });

    expect(router.push).toHaveBeenCalledWith({
      params: { id: "1" },
      pathname: "/add_new_transaction",
    });
  });
});

describe("replaceModal", () => {
  it("SHOULD keep the base WHEN a modal replaces itself", () => {
    setup("/financial/cards/invoice_detail").replaceModal(
      "add_new_transaction",
      { id: "1" },
    );

    expect(router.replace).toHaveBeenCalledWith({
      params: { id: "1" },
      pathname: "/financial/cards/add_new_transaction",
    });
  });

  it("SHOULD fall back to Home WHEN the current base is invalid", () => {
    setup("/foo").replaceModal("quick_add");

    expect(router.replace).toHaveBeenCalledWith({
      params: undefined,
      pathname: "/quick_add",
    });
  });
});

describe("closeModal", () => {
  it("SHOULD go back WHEN a screen is below", () => {
    setup("/financial/overview/add_new_transaction").closeModal();

    expect(router.back).toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("SHOULD replace to the base WHEN nothing is below", () => {
    setup("/financial/overview/add_new_transaction", false).closeModal();

    expect(router.back).not.toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith("/financial/overview");
  });

  it("SHOULD replace to Home WHEN the modal has no base", () => {
    setup("/add_new_transaction", false).closeModal();

    expect(router.replace).toHaveBeenCalledWith("/");
  });
});
