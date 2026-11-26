import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import AccountDTO from "@application/dto/financial/AccountDTO";
import CategoryDTO from "@application/dto/financial/CategoryDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { financeKeys } from "@application/queryKeys/financeKeys";
import { investmentKeys } from "@application/queryKeys/investmentKeys";
import { useCases } from "@application/useCases";
import { todayCalendarDate } from "@data/models/financial/calendarDate";
import { CategoryType } from "@domain/entities/financial/CategoryEntity";
import { RecurrenceFrequency } from "@domain/entities/financial/RecurrenceEntity";
import {
  defaultIncomeType,
  incomeWithholdingBps,
  INVESTMENT_INCOME_TYPES,
  InvestmentIncomeScope,
  InvestmentIncomeStatus,
  InvestmentIncomeType,
} from "@domain/entities/investment/enums";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import useOwnerScopedQuery from "@presentation/hooks/useOwnerScopedQuery";
import { useLocaleTag } from "@presentation/i18n";
import { toTreeNodes } from "@presentation/utils/categoryTreeNodes";
import useDebouncedValue from "@screens/Investment/FixedIncome/hooks/useDebouncedValue";
import invalidateInvestments from "@screens/Investment/hooks/invalidateInvestments";
import { formatDay, formatMoney } from "@screens/Investment/models/format";
import getInvestmentErrorMessage from "@screens/Investment/utils/investmentErrorMessage";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

import {
  dayToDate,
  effectiveNet,
  estimateOf,
  hasErrors,
  IncomeFormState,
  initialState,
  isSameState,
  stateFromIncome,
  stateFromSuggestion,
  toCreateParams,
  toSeriesParams,
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
function modeKeys(
  isApproving: boolean,
  isEditing: boolean,
  isSeriesEdit: boolean,
) {
  if (isSeriesEdit) {
    return {
      save: "investment.income.seriesModal.save",
      title: "investment.income.seriesModal.title",
    } as const;
  }
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
    seriesId?: string;
    suggestionId?: string;
  }>();
  const isEditing = !!params.id;
  // Spec 115: "Edit series" opens the same modal on the series header (the `ALL` scope without an income).
  const isSeriesEdit = !!params.seriesId && !isEditing;
  const isApproving = !!params.suggestionId;

  const income = useQuery({
    cacheKey: [...investmentKeys.all(), "income", params.id ?? "none"],
    enabled: isEditing,
    fetch: async () => useCases.getInvestmentIncomeUseCase.execute(params.id!),
  });
  // Spec 115 FR 24: an income of a series asks its scope first; the rule fields come from its series.
  const [scope, setScope] = useState<InvestmentIncomeScope>();
  const seriesId = income.data?.seriesId ?? params.seriesId;
  const series = useQuery({
    cacheKey: [...investmentKeys.all(), "income-series", seriesId ?? "none"],
    enabled: !!seriesId,
    fetch: async () =>
      useCases.getInvestmentIncomeSeriesByIdUseCase.execute(seriesId!),
  });
  const isSeriesIncome = isEditing && !!seriesId;
  const assetId =
    income.data?.assetId ??
    (isSeriesEdit ? series.data?.assetId : undefined) ??
    params.assetId ??
    "";
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
      (isSeriesEdit ? series.data?.type : undefined) ??
      defaultIncomeType(asset.data.assetClass))
    : undefined;
  const defaults = useQuery({
    cacheKey: [
      ...investmentKeys.all(),
      "income-defaults",
      assetId,
      startType ?? "none",
    ],
    enabled: !!startType && !isEditing && !isSeriesEdit,
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
      kind: "approve" | "create" | "series" | "update" | "updateSeries";
    }) => {
      if (request.kind === "update") {
        return useCases.updateInvestmentIncomeUseCase.execute(request.body);
      }
      if (request.kind === "updateSeries") {
        return useCases.updateInvestmentIncomeSeriesUseCase.execute(
          request.body,
        );
      }
      if (request.kind === "series") {
        return useCases.createInvestmentIncomeSeriesUseCase.execute(
          request.body,
        );
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

  const hasSource = isEditing
    ? !!income.data
    : (isSeriesEdit && !!series.data) || (!isSeriesEdit && !!defaults.data);
  const ready =
    !!asset.data &&
    !!accountsQuery.data &&
    !!categoriesQuery.data &&
    hasSource &&
    (!seriesId || !!series.data) &&
    (!isApproving || !!suggestion);
  const initial = useMemo<IncomeFormState | undefined>(() => {
    if (!ready || !asset.data || !startType) {
      return undefined;
    }
    if (isSeriesEdit && series.data) {
      return {
        ...initialState({
          accountId: series.data.accountId,
          categoryId: series.data.categoryId,
          paymentDate: series.data.firstPaymentDate,
          perUnit: series.data.amountPerUnit,
          type: series.data.type,
          withFinance: series.data.withFinance,
        }),
        endDate: series.data.endDate
          ? dayToDate(series.data.endDate)
          : undefined,
        frequency: series.data.frequency,
        notes: series.data.notes ?? "",
      };
    }
    if (income.data) {
      const base = stateFromIncome(income.data);

      return series.data
        ? {
            ...base,
            endDate: series.data.endDate
              ? dayToDate(series.data.endDate)
              : undefined,
            exDateOffset:
              series.data.exDateOffsetDays === undefined
                ? ""
                : String(series.data.exDateOffsetDays),
            frequency: series.data.frequency,
          }
        : base;
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
  }, [
    ready,
    asset.data,
    income.data,
    series.data,
    isSeriesEdit,
    suggestion,
    defaults.data,
    startType,
  ]);

  const [edited, setEdited] = useState<IncomeFormState>();
  const [submitted, setSubmitted] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const state = edited ?? initial;
  const assetClass = asset.data?.assetClass;
  const bps =
    state && assetClass ? incomeWithholdingBps(state.type, assetClass) : 0;
  const net = state ? effectiveNet(state, bps) : 0;
  const estimate = estimateOf(net, bps);
  // Spec 115: a new income can repeat; an income of a series edits with a scope.
  const isSeries =
    !!state?.repeat && !isEditing && !isApproving && !isSeriesEdit;
  const showSeriesBlock =
    isSeries || scope === InvestmentIncomeScope.THIS_AND_NEXT;
  const scopePending = isSeriesIncome && !scope && !!state;
  // The series rules (value per unit, end date) replace the single income rules when no single amount is typed.
  const seriesMode =
    isSeries || isSeriesEdit || scope === InvestmentIncomeScope.ALL;
  const errors = state && submitted ? validate(state, net, seriesMode) : {};
  const isDirty = !!edited && !!initial && !isSameState(edited, initial);
  const previewParams =
    isSeries && state && asset.data && !hasErrors(validate(state, net, true))
      ? toSeriesParams(asset.data.id, state)
      : undefined;
  const previewKey = useDebouncedValue(
    previewParams ? JSON.stringify(previewParams) : "",
  );
  const preview = useQuery({
    cacheKey: [...investmentKeys.all(), "income-series-preview", previewKey],
    enabled:
      previewKey !== "" &&
      previewKey === (previewParams ? JSON.stringify(previewParams) : ""),
    fetch: async () =>
      useCases.previewInvestmentIncomeSeriesUseCase.execute(
        JSON.parse(previewKey),
      ),
  });
  const occurrenceCount = preview.data
    ? preview.data.occurrences.past + preview.data.occurrences.currentMonth
    : undefined;
  const tooMany =
    !!preview.data &&
    preview.data.occurrences.past > preview.data.occurrences.max;

  function patch(change: Partial<IncomeFormState>) {
    if (state) {
      setEdited({ ...state, ...change });
    }
  }

  function onSave() {
    setSubmitted(true);

    if (
      !state ||
      !asset.data ||
      hasErrors(validate(state, net, seriesMode)) ||
      tooMany ||
      !!preview.error
    ) {
      return;
    }

    if (isSeriesEdit) {
      save.mutate({
        body: {
          accountId: state.withFinance ? state.accountId : undefined,
          amountPerUnit: state.perUnit,
          categoryId: state.withFinance ? state.categoryId : undefined,
          endDate: state.endDate ? todayCalendarDate(state.endDate) : null,
          id: params.seriesId,
          notes: state.notes.trim() === "" ? null : state.notes.trim(),
          withFinance: state.withFinance,
        } as never,
        kind: "updateSeries",
      });
    } else if (isSeries) {
      save.mutate({
        body: toSeriesParams(asset.data.id, state) as never,
        kind: "series",
      });
    } else if (isApproving) {
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
      const withSeries =
        scope === InvestmentIncomeScope.THIS_AND_NEXT
          ? {
              endDate: state.endDate ? todayCalendarDate(state.endDate) : null,
              exDateOffsetDays:
                state.exDateOffset.trim() === ""
                  ? null
                  : Number(state.exDateOffset),
              frequency: state.frequency,
            }
          : {};

      save.mutate({
        body: {
          ...toUpdateParams(params.id!, state, net),
          ...withSeries,
          scope,
        } as never,
        kind: "update",
      });
    } else {
      save.mutate({
        body: toCreateParams(asset.data.id, state, net) as never,
        kind: "create",
      });
    }
  }

  const keys = modeKeys(isApproving, isEditing, isSeriesEdit);
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
    categoryNodes: toTreeNodes(incomeCategories),
    currency,
    errors,
    estimate: {
      gross: formatMoney(estimate.gross, currency, localeTag),
      rate: `${bps / 100}%`,
      show: bps > 0,
    },
    failure: getInvestmentErrorMessage(
      save.error ?? remove.error ?? preview.error,
      (day) => formatDay(day, localeTag),
    ),
    isApproving,
    isDeleteOpen: deleteOpen,
    isDirty,
    isEditing,
    isLoading: !ready && !asset.error && !income.error,
    isNotFound:
      (!!asset.error && !asset.data) ||
      (!!income.error && !income.data) ||
      (isSeriesEdit && !!series.error && !series.data),
    isSaving: save.isFetching || remove.isFetching,
    // Spec 115 FR 24: ALL edits the series header only (account, category, notes, amount per unit, finance).
    isScopeAll: scope === InvestmentIncomeScope.ALL || isSeriesEdit,
    isSeries,
    isSeriesEdit,
    isSeriesIncome,
    net,
    occurrenceCount,
    onAccountChange: (accountId: string) => patch({ accountId }),
    onCategoryChange: (categoryId: string) => patch({ categoryId }),
    onClose: closeModal,
    onDelete: () => remove.mutate({ id: params.id!, scope }),
    onDeleteClose: () => setDeleteOpen(false),
    onDeleteOpen: () => setDeleteOpen(true),
    onEndDateChange: (value?: Date) => patch({ endDate: value }),
    onExDateChange: (value?: Date) => patch({ exDate: value }),
    onExDateOffsetChange: (exDateOffset: string) => patch({ exDateOffset }),
    onFrequencyChange: (frequency: RecurrenceFrequency) => patch({ frequency }),
    onMarkPastChange: (markPast: boolean) => patch({ markPast }),
    onNetChange: (cents: number) =>
      patch({ netAmount: cents, netTouched: true }),
    onNotesChange: (notes: string) => patch({ notes }),
    onPaymentDateChange: (value?: Date) =>
      value && patch({ paymentDate: value }),
    onPerUnitChange: (perUnit: string) => patch({ perUnit }),
    onQuantityChange: (quantity: string) => patch({ quantity }),
    onRepeatChange: (repeat: boolean) =>
      patch({ repeat, status: InvestmentIncomeStatus.PLANNED }),
    onSave,
    onScopeCancel: closeModal,
    onScopeSelect: (value: InvestmentIncomeScope) => setScope(value),
    onStatusChange: (status: InvestmentIncomeStatus) => patch({ status }),
    onTypeChange: (type: InvestmentIncomeType) => patch({ type }),
    onWithFinanceChange: (withFinance: boolean) => patch({ withFinance }),
    preview: {
      count: occurrenceCount,
      currentMonth: preview.data?.occurrences.currentMonth ?? 0,
      endsByPosition: preview.data?.endsByPosition
        ? formatDay(preview.data.endsByPosition, localeTag)
        : undefined,
      firstNet:
        preview.data?.firstNetAmount === null ||
        preview.data?.firstNetAmount === undefined
          ? undefined
          : formatMoney(preview.data.firstNetAmount, currency, localeTag),
      firstQuantity: preview.data?.firstQuantity ?? undefined,
      isLoading: preview.isFetching,
      next: (preview.data?.next ?? []).map((day) => formatDay(day, localeTag)),
      past: preview.data?.occurrences.past ?? 0,
    },
    repeatAllowed: !isEditing && !isApproving && !isSeriesEdit,
    saveDisabled: isSeries && (tooMany || !!preview.error || !preview.data),
    saveLabelKey:
      isSeries && occurrenceCount !== undefined
        ? ("investment.income.saveSeries" as const)
        : keys.save,
    saveLabelParams:
      occurrenceCount === undefined ? undefined : { count: occurrenceCount },
    scope,
    scopeDate: income.data ? formatDay(income.data.paymentDate, localeTag) : "",
    scopeDialogVisible: scopePending,
    seriesIncomeCount: series.data
      ? series.data.lastGeneratedNumber
      : undefined,
    showSeriesBlock,
    state,
    titleKey: keys.title,
    tooMany,
    typeOptions: INVESTMENT_INCOME_TYPES,
  };
}
