import { router } from "expo-router";

import { fireEvent, render, screen } from "@tests";

import { useCases } from "@application/useCases";
import { useMutation } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";

import Logout from "./";

jest.mock("expo-router", () => ({ router: { replace: jest.fn() } }));
jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => ({
  useCases: { logoutUseCase: { execute: jest.fn() } },
}));

const mutation = new UseMutationFixture<void, void>();

beforeEach(() => {
  jest.clearAllMocks();
});

function button() {
  return screen.UNSAFE_getAllByProps({ label: "configurations.logout" })[0];
}

function setup(props?: {
  isFetching?: boolean;
  status?: "error" | "idle" | "success";
}) {
  const built = mutation
    .reset()
    .withIsFetching(!!props?.isFetching)
    .withStatus(props?.status ?? "idle")
    .build();
  jest.mocked(useMutation).mockReturnValue(built as never);

  render(<Logout />);

  return { mutate: built.mutate };
}

it("SHOULD configure the logout mutation with the use case", () => {
  setup();

  expect(useMutation).toHaveBeenCalledWith({
    cacheKey: [],
    fetch: useCases.logoutUseCase.execute,
  });
});

it("SHOULD render an enabled logout button", () => {
  setup();

  expect(button().props.disabled).toBe(false);
  expect(button().props.icon).toBe("logout");
});

it("SHOULD disable the button WHEN the logout is in progress", () => {
  setup({ isFetching: true });

  expect(button().props.disabled).toBe(true);
});

it("SHOULD log out WHEN the button is pressed", () => {
  const { mutate } = setup();

  fireEvent.press(button());

  expect(mutate).toHaveBeenCalledTimes(1);
});

it("SHOULD go to the login screen WHEN the logout succeeded", () => {
  setup({ status: "success" });

  expect(router.replace).toHaveBeenCalledWith("/login");
});

it.each(["idle", "error"] as const)(
  "SHOULD NOT navigate WHEN the logout status is %s",
  (status) => {
    setup({ status });

    expect(router.replace).not.toHaveBeenCalled();
  },
);
