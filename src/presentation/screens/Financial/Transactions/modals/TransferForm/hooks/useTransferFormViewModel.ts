import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import AccountDTO from "@application/dto/financial/AccountDTO";
import { financeKeys } from "@application/queryKeys/financeKeys";
import { useCases } from "@application/useCases";
import { CurrencyCode } from "@domain/entities/financial/Currency";
import { InstallmentScope } from "@domain/entities/financial/InstallmentPlanEntity";
import { RecurrenceFrequency } from "@domain/entities/financial/RecurrenceEntity";
import { markFetcherDataStale, useQuery } from "@infrastructure/fetcher";
import useOwners from "@presentation/hooks/useOwners";
import { TranslationKeys } from "@presentation/i18n/types";
import useActiveOwners from "@screens/Financial/hooks/useActiveOwners";
import { invalidateAfterWrite } from "@screens/Financial/Transactions/pending/writeCache";
import { getFinancialErrorMessageKey } from "@screens/Financial/utils/financialErrorMessage";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";
import { centsToDecimalString } from "@utils/money";
import { computeRate } from "@utils/transferRate";

import {
  changeDateIn,
  changeDateOut,
  createInitialState,
  daysLater,
  effectiveAmountInCents,
  isSameState,
  isValid,
  resetDateIn,
  stateFromTransfer,
  swapAccounts,
  toCreateParams,
  toUpdateParams,
  TransferFormState,
  validate,
} from "../models/transferFormState";

interface AccountOption {
  currency: CurrencyCode;
  description?: string;
  label: string;
  value: string;
}

// Account options grouped by owner (Personal first), only accounts of owners the user can write to (spec 098 FR 3).
function buildAccountOptions(
  accounts: AccountDTO[],
  owners: { id: string; name: string; type: string }[],
  selectedIds: (string | undefined)[],
): AccountOption[] {
  function rank(ownerId: string) {
    return owners.findIndex((owner) => owner.id === ownerId);
  }
  function ownerName(ownerId: string) {
    return owners.find((owner) => owner.id === ownerId)?.name;
  }

  return accounts
    .filter(
      (account) =>
        rank(account.ownerId) >= 0 &&
        (account.status !== "ARCHIVED" || selectedIds.includes(account.id)),
    )
    .sort(
      (a, b) =>
        rank(a.ownerId) - rank(b.ownerId) || a.name.localeCompare(b.name),
    )
    .map((account) => ({
      currency: account.currency,
      description: owners.length > 1 ? ownerName(account.ownerId) : undefined,
      label: `${account.name} · ${account.currency}`,
      value: account.id,
    }));
}

function useTransferFormViewModel() {
  const { closeModal } = useModalNavigation();
  const params = useLocalSearchParams<{ transferId?: string }>();
  const transferId = params.transferId;
  const isEditing = !!transferId;

  const owners = useActiveOwners();
  const allOwners = useOwners();
  const accounts = useQuery({
    cacheKey: financeKeys.accounts.raw(),
    enabled: !!allOwners.data,
    fetch: async () =>
      useCases.getFinancialAccountsUseCase.execute(
        (allOwners.data ?? []).map((owner) => owner.id),
      ),
  });
  const existing = useQuery({
    cacheKey: financeKeys.transfers.raw(transferId ?? ""),
    enabled: isEditing,
    fetch: async () =>
      useCases.getFinancialTransferUseCase.execute(transferId!),
  });

  const [state, setState] = useState<TransferFormState>();
  const [baseline, setBaseline] = useState<TransferFormState>();
  const [scope, setScope] = useState<InstallmentScope>("ONLY_THIS");
  const [submitted, setSubmitted] = useState(false);
  const [isBlocking, setBlocking] = useState(false);
  const [isSavingNext, setSavingNext] = useState(false);
  const [isSaved, setSaved] = useState(false);
  const [errorKey, setErrorKey] = useState<TranslationKeys>();
  const [isDiscardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // The form starts once: a new one from the first writable account, an edit from the stored transfer.
  useEffect(() => {
    if (state || !accounts.data || !owners.data) {
      return;
    }
    if (isEditing) {
      if (existing.data) {
        const loaded = stateFromTransfer(existing.data.transfer);

        setState(loaded);
        setBaseline(loaded);
      }

      return;
    }
    const writable = new Set(owners.data.map((owner) => owner.id));
    const favorite = accounts.data.find(
      (account) =>
        account.isFavorite &&
        writable.has(account.ownerId) &&
        account.status !== "ARCHIVED",
    );
    const initial = createInitialState(new Date(), {
      fromAccountId: favorite?.id,
    });

    setState(initial);
    setBaseline(initial);
  }, [accounts.data, existing.data, isEditing, owners.data, state]);

  const accountOptions = useMemo(
    () =>
      buildAccountOptions(accounts.data ?? [], owners.data ?? [], [
        state?.fromAccountId,
        state?.toAccountId,
      ]),
    [accounts.data, owners.data, state?.fromAccountId, state?.toAccountId],
  );
  const from = accountOptions.find((o) => o.value === state?.fromAccountId);
  const to = accountOptions.find((o) => o.value === state?.toAccountId);
  const currencyOut = from?.currency;
  const currencyIn = to?.currency;
  const sameCurrency = !from || !to || from.currency === to.currency;
  const ctx = { sameCurrency };

  const errors = state ? validate(state, ctx) : {};
  const amountInCents = state ? effectiveAmountInCents(state, ctx) : 0;
  const rate = state
    ? computeRate(state.amountOutCents, amountInCents)
    : undefined;
  const isDirty = !!state && !!baseline && !isSameState(state, baseline);
  const isRecurring = !!existing.data?.transfer.recurrenceId;

  function change(patch: Partial<TransferFormState>) {
    setState((current) => (current ? { ...current, ...patch } : current));
    setErrorKey(undefined);
  }

  // Changes that read the current state run on the latest one, so two events in a row never act on a stale render.
  function transform(fn: (current: TransferFormState) => TransferFormState) {
    setState((current) => (current ? fn(current) : current));
    setErrorKey(undefined);
  }

  async function finish(next: boolean) {
    // The lists, balances and forecasts moved; the Transactions screen refetches when it regains focus.
    await invalidateAfterWrite(
      { invoiceMonths: "all", listMonths: "all", projections: true },
      { refetch: false },
    );
    markFetcherDataStale(financeKeys.transfers.all());
    if (next && state) {
      // "Save and create another" keeps both accounts (spec 098 FR 4).
      const fresh = {
        ...createInitialState(new Date(), {
          fromAccountId: state.fromAccountId,
        }),
        toAccountId: state.toAccountId,
      };

      setState(fresh);
      setBaseline(fresh);
      setSubmitted(false);
      setSaved(true);

      return;
    }
    closeModal();
  }

  async function save(next: boolean) {
    setSubmitted(true);
    if (!state || !isValid(errors) || isBlocking) {
      return;
    }
    setBlocking(true);
    setSavingNext(next);
    setErrorKey(undefined);
    try {
      if (isEditing && baseline) {
        await useCases.updateFinancialTransferUseCase.execute({
          id: transferId!,
          scope: isRecurring ? scope : undefined,
          ...toUpdateParams(state, baseline, ctx),
        });
      } else {
        await useCases.createFinancialTransferUseCase.execute(
          toCreateParams(state, ctx),
        );
      }
      await finish(next);
    } catch (error) {
      setErrorKey(
        getFinancialErrorMessageKey(error) ?? "common.errors.generic",
      );
    } finally {
      setBlocking(false);
      setSavingNext(false);
    }
  }

  async function onDeleteConfirm() {
    setDeleteDialogOpen(false);
    setBlocking(true);
    try {
      await useCases.deleteFinancialTransferUseCase.execute({
        id: transferId!,
        scope: isRecurring ? scope : undefined,
      });
      await finish(false);
    } catch (error) {
      setErrorKey(
        getFinancialErrorMessageKey(error) ?? "common.errors.generic",
      );
    } finally {
      setBlocking(false);
    }
  }

  function onClose() {
    // Spec 061 FR 2: the modal cannot be closed while a blocking request runs.
    if (isBlocking) {
      return;
    }
    if (isDirty) {
      setDiscardDialogOpen(true);

      return;
    }
    closeModal();
  }

  const showErrors = submitted;

  return {
    accountOptions,
    amountInCents,
    amountInReadOnly: state?.rateMode === "RATE",
    canSaveAndNew: !isEditing,
    currencyIn,
    currencyOut,
    daysLater: state ? daysLater(state) : 0,
    errorKey,
    errors: showErrors ? errors : {},
    fromAccountId: state?.fromAccountId,
    isBlocking,
    isDeleteDialogOpen,
    isDirty,
    isDiscardDialogOpen,
    isEditing,
    isLoading: !state && !(isEditing && existing.error),
    isNotFound: isEditing && !!existing.error,
    isRecurring,
    isSaved,
    isSavingNext,
    onAccountSwap: () => transform(swapAccounts),
    onAmountInChange: (cents: number) =>
      change({ amountInCents: cents, rateMode: "AMOUNT_IN", rateText: "" }),
    onAmountOutChange: (cents: number) => change({ amountOutCents: cents }),
    onClose,
    onDateInChange: (date: Date) =>
      transform((current) => changeDateIn(current, date)),
    onDateOutChange: (date: Date) =>
      transform((current) => changeDateOut(current, date)),
    onDeleteCancel: () => setDeleteDialogOpen(false),
    onDeleteConfirm,
    onDeletePress: () => setDeleteDialogOpen(true),
    onDescriptionChange: (text: string) => change({ description: text }),
    onDiscardCancel: () => setDiscardDialogOpen(false),
    onDiscardConfirm: () => closeModal(),
    onFeeChange: (cents: number) => change({ feeCents: cents }),
    onFromAccountChange: (id: string) => change({ fromAccountId: id }),
    onNotesChange: (text: string) => change({ notes: text }),
    onPaidChange: (paid: boolean) => change({ paid }),
    onRateChange: (text: string) =>
      change({ rateMode: "RATE", rateText: text }),
    onRateModeChange: (mode: "AMOUNT_IN" | "RATE") =>
      change(
        mode === "RATE"
          ? {
              rateMode: "RATE",
              rateText: rate ? String(rate.base === "IN" ? rate.value : 0) : "",
            }
          : {
              amountInCents,
              rateMode: "AMOUNT_IN",
            },
      ),
    onRepeatEndChange: (date?: Date) => change({ repeatEnd: date }),
    onRepeatFrequencyChange: (frequency: RecurrenceFrequency) =>
      change({ repeatFrequency: frequency }),
    onRepeatToggle: (on: boolean) => change({ repeatOn: on }),
    onSameDate: () => transform(resetDateIn),
    onSave: async () => save(false),
    onSaveAndNew: async () => save(true),
    onSavedHide: () => setSaved(false),
    onScopeChange: (next: InstallmentScope) => setScope(next),
    onToAccountChange: (id: string) => change({ toAccountId: id }),
    rate,
    rateText: state?.rateText ?? "",
    scope,
    state,
    toAccountId: state?.toAccountId,
    typedAmountInText: centsToDecimalString(amountInCents),
  };
}

export default useTransferFormViewModel;
