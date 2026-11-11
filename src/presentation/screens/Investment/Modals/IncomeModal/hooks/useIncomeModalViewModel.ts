import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import AccountDTO from "@application/dto/financial/AccountDTO";
import CategoryDTO from "@application/dto/financial/CategoryDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { financeKeys } from "@application/queryKeys/financeKeys";
import { investmentKeys } from "@application/queryKeys/investmentKeys";
import { useCases } from "@application/useCases";
import { CategoryType } from "@domain/entities/financial/CategoryEntity";
import {
  defaultIncomeType,
  incomeWithholdingBps,
  INVESTMENT_INCOME_TYPES,
  InvestmentIncomeStatus,
  InvestmentIncomeType,
} from "@domain/entities/investment/enums";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import useOwnerScopedQuery from "@presentation/hooks/useOwnerScopedQuery";
import { useLocaleTag } from "@presentation/i18n";
import invalidateInvestments from "@screens/Investment/hooks/invalidateInvestments";
import { formatDay, formatMoney } from "@screens/Investment/models/format";
import getInvestmentErrorMessage from "@screens/Investment/utils/investmentErrorMessage";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

import {
  effectiveNet,
  estimateOf,
  hasErrors,
  IncomeFormState,
  initialState,
  isSameState,
  stateFromIncome,
  stateFromSuggestion,
  toCreateParams,
  toUpdateParams,
  validate,
} from "../models/incomeFormState";

export type IncomeModalVM = ReturnType<typeof useIncomeModalViewModel>;

interface AccountsData {
  accounts: AccountDTO[];
  owners: OwnerDTO[];
}
interface CategoriesData {
  categories: CategoryDTO[];
}

export default useIncomeModalViewModel;

// The sheet title and the save label of the three modes (create, edit, approve).
function modeKeys(isApproving: boolean, isEditing: boolean) {
  if (isApproving) {
    return {
      save: "investment.suggestions.approve",
      title: "investment.income.title.approve",
    } as const;
  }

  return isEditing
    ? ({
        save: "investment.income.editSave",
        title: "investment.income.title.edit",
      } as const)
    : ({
        save: "investment.income.title.create",
        title: "investment.income.title.create",
      } as const);
}

// Spec 107: one modal for create (`assetId`), edit (`id`) and approve-with-edit (`suggestionId`).
function useIncomeModalViewModel() {
  const { closeModal } = useModalNavigation();
  const localeTag = useLocaleTag();
  const params = useLocalSearchParams<{
    assetId?: string;
    id?: string;
    suggestionId?: string;
  }>();
  const isEditing = !!params.id;
  const isApproving = !!params.suggestionId;

  const income = useQuery({
    cacheKey: [...investmentKeys.all(), "income", params.id ?? "none"],
    enabled: isEditing,
    fetch: async () => useCases.getInvestmentIncomeUseCase.execute(params.id!),
  });
  const assetId = income.data?.assetId ?? params.assetId ?? "";
  const asset = useQuery({
    cacheKey: [...investmentKeys.asset(assetId), "form"],
    enabled: !!assetId,
    fetch: async () => useCases.getInvestmentAssetUseCase.execute(assetId),
  });
  const suggestions = useQuery({
    cacheKey: [...investmentKeys.all(), "income-suggestions", assetId],
    enabled: isApproving && !!assetId,
    fetch: async () =>
      useCases.getInvestmentIncomeSuggestionsUseCase.execute({ assetId }),
  });
  const suggestion = suggestions.data?.find(
    (item) => item.id === params.suggestionId,
  );
  const startType = asset.data
    ? (suggestion?.type ??
      income.data?.type ??
      defaultIncomeType(asset.data.assetClass))
    : undefined;
  const defaults = useQuery({
    cacheKey: [
      ...investmentKeys.all(),
      "income-defaults",
      assetId,
      startType ?? "none",
    ],
    enabled: !!startType && !isEditing,
    fetch: async () =>
      useCases.getInvestmentIncomeDefaultsUseCase.execute({
        assetId,
        exDate: suggestion?.exDate,
        type: startType,
      }),
  });
  const accountsQuery = useOwnerScopedQuery<AccountsData>({
    cacheKey: financeKeys.accounts.raw("investment-income"),
    fetch: async (owners) => ({
      accounts: await useCases.getFinancialAccountsUseCase.execute(
        owners.map((owner) => owner.id),
      ),
      owners,
    }),
  });
  const categoriesQuery = useOwnerScopedQuery<CategoriesData>({
    cacheKey: financeKeys.categories.raw("investment-income"),
    fetch: async (owners) => ({
      categories: await useCases.getFinancialCategoriesUseCase.execute(
        owners.map((owner) => owner.id),
      ),
    }),
  });

  const save = useMutation({
    cacheKey: [useCases.createInvestmentIncomeUseCase.uniqueName],
    fetch: async (request: {
      body: never;
      kind: "approve" | "create" | "update";
    }) => {
      if (request.kind === "update") {
        return useCases.updateInvestmentIncomeUseCase.execute(request.body);
      }

      return request.kind === "approve"
        ? useCases.approveInvestmentIncomeSuggestionUseCase.execute(
            request.body,
          )
        : useCases.createInvestmentIncomeUseCase.execute(request.body);
    },
  });
  const remove = useMutation({
    cacheKey: [useCases.deleteInvestmentIncomeUseCase.uniqueName],
    fetch: useCases.deleteInvestmentIncomeUseCase.execute,
  });

  useEffect(() => {
    if (save.status === "success" || remove.status === "success") {
      void invalidateInvestments();
      closeModal();
    }
  }, [save.status, remove.status]);

  const currency = asset.data?.currency ?? "BRL";
  const accounts = useMemo(() => {
    const archivedOwners = new Set(
      (accountsQuery.data?.owners ?? [])
        .filter((owner) => owner.archived)
        .map((owner) => owner.id),
    );

    return (accountsQuery.data?.accounts ?? [])
      .filter(
        (account) =>
          account.status === "ACTIVE" &&
          account.currency === currency &&
          !archivedOwners.has(account.ownerId),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [accountsQuery.data, currency]);
  const incomeCategories = useMemo(
    () =>
      (categoriesQuery.data?.categories ?? [])
        .filter(
          (category) =>
            category.type === CategoryType.INCOME &&
            category.status !== "ARCHIVED",
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    [categoriesQuery.data],
  );

  const ready =
    !!asset.data &&
    !!accountsQuery.data &&
    !!categoriesQuery.data &&
    (isEditing ? !!income.data : !!defaults.data) &&
    (!isApproving || !!suggestion);
  const initial = useMemo<IncomeFormState | undefined>(() => {
    if (!ready || !asset.data || !startType) {
      return undefined;
    }
    if (income.data) {
      return stateFromIncome(income.data);
    }

    const base = {
      accountId: defaults.data?.accountId,
      categoryId: defaults.data?.categoryId,
    };

    if (suggestion) {
      return stateFromSuggestion(suggestion, base);
    }

    return initialState({
      ...base,
      quantity:
        defaults.data && defaults.data.quantity !== "0"
          ? defaults.data.quantity
          : "",
      type: startType,
    });
  }, [ready, asset.data, income.data, suggestion, defaults.data, startType]);

  const [edited, setEdited] = useState<IncomeFormState>();
  const [submitted, setSubmitted] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const state = edited ?? initial;
  const assetClass = asset.data?.assetClass;
  const bps =
    state && assetClass ? incomeWithholdingBps(state.type, assetClass) : 0;
  const net = state ? effectiveNet(state, bps) : 0;
  const estimate = estimateOf(net, bps);
  const errors = state && submitted ? validate(state, net) : {};
  const isDirty = !!edited && !!initial && !isSameState(edited, initial);

  function patch(change: Partial<IncomeFormState>) {
    if (state) {
      setEdited({ ...state, ...change });
    }
  }

  function onSave() {
    setSubmitted(true);

    if (!state || !asset.data || hasErrors(validate(state, net))) {
      return;
    }

    if (isApproving) {
      const { assetId: ignored, ...fields } = toCreateParams(
        asset.data.id,
        state,
        net,
      );

      void ignored;
      save.mutate({
        body: { ...fields, id: params.suggestionId } as never,
        kind: "approve",
      });
    } else if (isEditing) {
      save.mutate({
        body: toUpdateParams(params.id!, state, net) as never,
        kind: "update",
      });
    } else {
      save.mutate({
        body: toCreateParams(asset.data.id, state, net) as never,
        kind: "create",
      });
    }
  }

  const keys = modeKeys(isApproving, isEditing);
  return {
    accountHint:
      state?.accountId && state.accountId === defaults.data?.accountId
        ? ("investment.income.accountDefaultHint" as const)
        : undefined,
    accountOptions: accounts.map((account) => ({
      label: account.name,
      value: account.id,
    })),
    assetLabel: asset.data ? (asset.data.ticker ?? asset.data.name) : "",
    categoryHint:
      state?.categoryId && state.categoryId === defaults.data?.categoryId
        ? ("investment.income.categoryDefaultHint" as const)
        : undefined,
    categoryOptions: incomeCategories.map((category) => ({
      label: category.name,
      value: category.id,
    })),
    currency,
    errors,
    estimate: {
      gross: formatMoney(estimate.gross, currency, localeTag),
      rate: `${bps / 100}%`,
      show: bps > 0,
    },
    failure: getInvestmentErrorMessage(save.error ?? remove.error, (day) =>
      formatDay(day, localeTag),
    ),
    isApproving,
    isDeleteOpen: deleteOpen,
    isDirty,
    isEditing,
    isLoading: !ready && !asset.error && !income.error,
    isNotFound:
      (!!asset.error && !asset.data) || (!!income.error && !income.data),
    isSaving: save.isFetching || remove.isFetching,
    net,
    onAccountChange: (accountId: string) => patch({ accountId }),
    onCategoryChange: (categoryId: string) => patch({ categoryId }),
    onClose: closeModal,
    onDelete: () => remove.mutate(params.id!),
    onDeleteClose: () => setDeleteOpen(false),
    onDeleteOpen: () => setDeleteOpen(true),
    onExDateChange: (value?: Date) => patch({ exDate: value }),
    onNetChange: (cents: number) =>
      patch({ netAmount: cents, netTouched: true }),
    onNotesChange: (notes: string) => patch({ notes }),
    onPaymentDateChange: (value?: Date) =>
      value && patch({ paymentDate: value }),
    onPerUnitChange: (perUnit: string) => patch({ perUnit }),
    onQuantityChange: (quantity: string) => patch({ quantity }),
    onSave,
    onStatusChange: (status: InvestmentIncomeStatus) => patch({ status }),
    onTypeChange: (type: InvestmentIncomeType) => patch({ type }),
    saveLabelKey: keys.save,
    state,
    titleKey: keys.title,
    typeOptions: INVESTMENT_INCOME_TYPES,
  };
}
