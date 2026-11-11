import { act, renderHook } from "@tests";
import { modalNavigation } from "@tests/modalNavigation";

import { InvestmentIncomeIncomplete } from "@domain/entities/errors";
import { useMutation } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import invalidateInvestments from "@screens/Investment/hooks/invalidateInvestments";
import { makeSuggestion } from "@screens/Investment/mocks/fixtures";

import useIncomeSuggestionActions from "./useIncomeSuggestionActions";

jest.mock("@infrastructure/fetcher");
jest.mock("@screens/Investment/hooks/invalidateInvestments");
jest.mock("@application/useCases", () => ({
  useCases: {
    approveInvestmentIncomeSuggestionUseCase: {
      execute: jest.fn(),
      uniqueName: "approve",
    },
    rejectInvestmentIncomeSuggestionUseCase: {
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
  return renderHook(() => useIncomeSuggestionActions());
}

it("SHOULD approve at once WHEN the suggestion is complete", () => {
  const { result } = setup();

  act(() => result.current.onApprove(makeSuggestion()));

  expect(approve.value.mutate).toHaveBeenCalledWith({ id: "sug-1" });
  expect(modalNavigation.openModal).not.toHaveBeenCalled();
});

it("SHOULD open the edit form instead WHEN it cannot be approved directly", () => {
  const { result } = setup();

  act(() =>
    result.current.onApprove(makeSuggestion({ canApproveDirectly: false })),
  );

  expect(approve.value.mutate).not.toHaveBeenCalled();
  expect(modalNavigation.openModal).toHaveBeenCalledWith("investment_income", {
    assetId: "asset-1",
    suggestionId: "sug-1",
  });
});

it("SHOULD open the edit form on Editar AND reject by id", () => {
  const { result } = setup();

  act(() => result.current.onEdit(makeSuggestion()));
  act(() => result.current.onReject(makeSuggestion()));

  expect(modalNavigation.openModal).toHaveBeenCalledTimes(1);
  expect(reject.value.mutate).toHaveBeenCalledWith("sug-1");
});

it("SHOULD refresh the investments WHEN a decision succeeds", () => {
  approve.value.status = "success";
  setup();

  expect(invalidateInvestments).toHaveBeenCalled();
});

it("SHOULD expose the failure AND the busy flag", () => {
  approve.reset().withError(new InvestmentIncomeIncomplete(["paymentDate"]));
  approve.value.isFetching = true;
  const { result } = setup();

  expect(result.current.failure).toEqual({
    key: "investment.income.errors.incomplete",
  });
  expect(result.current.isBusy).toBe(true);
});
