import { act, renderHook } from "@tests";
import { modalNavigation } from "@tests/modalNavigation";

import { InvestmentNoPosition } from "@domain/entities/errors";
import { useMutation } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import invalidateInvestments from "@screens/Investment/hooks/invalidateInvestments";
import { makeEventSuggestion } from "@screens/Investment/mocks/fixtures";

import useEventSuggestionActions from "./useEventSuggestionActions";

jest.mock("@infrastructure/fetcher");
jest.mock("@screens/Investment/hooks/invalidateInvestments");
jest.mock("@application/useCases", () => ({
  useCases: {
    approveInvestmentEventSuggestionUseCase: {
      execute: jest.fn(),
      uniqueName: "approve",
    },
    rejectInvestmentEventSuggestionUseCase: {
      execute: jest.fn(),
      uniqueName: "reject",
    },
  },
}));

const approve = new UseMutationFixture();
const reject = new UseMutationFixture();

beforeEach(() => {
  jest.clearAllMocks();
  approve.reset();
  reject.reset();
  jest
    .mocked(useMutation)
    .mockImplementation(((props: { cacheKey: string[] }) =>
      (props.cacheKey[0] === "approve" ? approve : reject).build()) as never);
});

function setup() {
  return renderHook(() => useEventSuggestionActions());
}

it("SHOULD approve the suggestion as announced, by id", () => {
  const { result } = setup();

  act(() => result.current.onApprove(makeEventSuggestion()));

  expect(approve.value.mutate).toHaveBeenCalledWith({ id: "esug-1" });
  expect(modalNavigation.openModal).not.toHaveBeenCalled();
});

it("SHOULD open the operation modal prefilled WHEN the owner edits it", () => {
  const { result } = setup();

  act(() => result.current.onEdit(makeEventSuggestion()));

  expect(modalNavigation.openModal).toHaveBeenCalledWith(
    "investment_operation",
    {
      assetId: "asset-1",
      suggestionId: "esug-1",
    },
  );
});

it("SHOULD reject by id", () => {
  const { result } = setup();

  act(() => result.current.onReject(makeEventSuggestion()));

  expect(reject.value.mutate).toHaveBeenCalledWith("esug-1");
});

it("SHOULD refresh the investments WHEN a decision succeeds", () => {
  reject.value.status = "success";
  setup();

  expect(invalidateInvestments).toHaveBeenCalled();
});

it("SHOULD expose the 422 of the event rules AND the busy flag", () => {
  approve.reset().withError(new InvestmentNoPosition("2026-03-10"));
  approve.value.isFetching = true;
  const { result } = setup();

  expect(result.current.failure?.key).toBe("investment.event.noPosition");
  expect(result.current.failure?.params?.date).toContain("2026");
  expect(result.current.isBusy).toBe(true);
});
