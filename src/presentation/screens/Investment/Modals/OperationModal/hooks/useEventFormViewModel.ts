import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { investmentKeys } from "@application/queryKeys/investmentKeys";
import { useCases } from "@application/useCases";
import { todayCalendarDate } from "@data/models/financial/calendarDate";
import {
  INVESTMENT_EVENT_TYPES,
  InvestmentOperationType,
} from "@domain/entities/investment/enums";
import {
  InvestmentAssetDetail,
  InvestmentOperation,
} from "@domain/entities/investment/InvestmentEntities";
import { previewEvent } from "@domain/entities/investment/position";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import { useLocaleTag } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";
import {
  addedShares,
  bonusEvery,
} from "@screens/Investment/Events/models/eventInfo";
import invalidateInvestments from "@screens/Investment/hooks/invalidateInvestments";
import {
  formatDay,
  formatMoney,
  formatQuantity,
  formatUnitPrice,
} from "@screens/Investment/models/format";
import getInvestmentErrorMessage from "@screens/Investment/utils/investmentErrorMessage";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

import {
  defaultDraft,
  draftFromOperation,
  draftFromSuggestion,
  EventDraft,
  hasEventErrors,
  isSameDraft,
  nonEmpty,
  toApproveParams,
  toCreateParams,
  toUpdateParams,
  validateDraft,
} from "../models/eventFormState";

export type EventFormVM = ReturnType<typeof useEventFormViewModel>;

interface PreviewRow {
  after: string;
  before: string;
}

export default useEventFormViewModel;

// Spec 108 section 8: the "Evento" segment of the operation modal. It creates an event, edits one (the type is fixed,
// FR 7), approves a suggestion with the values on screen (FR 29) or rejects it; deleting an event also deletes its
// fraction sale, which the confirmation lists. The preview is computed with the port of the API's event math; the
// API result is the source of truth.
// "31" new shares of a bonus, the whole position after a split or a reverse split (the text of the fraction box).
function newSharesOf(
  type: InvestmentOperationType | undefined,
  before: string,
  after: string,
): string {
  return type === InvestmentOperationType.BONUS
    ? addedShares(before, after)
    : after;
}

function titleKeyOf(suggestion: boolean, editing: boolean): TranslationKeys {
  if (suggestion) {
    return "investment.event.approveTitle";
  }

  return editing
    ? "investment.form.operation.editTitle"
    : "investment.form.operation.newTitle";
}

function useEventFormViewModel(
  asset: InvestmentAssetDetail | undefined,
  operation: InvestmentOperation | undefined,
  readOnly: boolean,
) {
  const { closeModal } = useModalNavigation();
  const localeTag = useLocaleTag();
  const params = useLocalSearchParams<{
    assetId: string;
    id?: string;
    suggestionId?: string;
  }>();
  const suggestionId = params.suggestionId;
  const isEditing = !!params.id && !!operation;

  const suggestions = useQuery({
    cacheKey: [...investmentKeys.all(), "event-suggestions", params.assetId],
    enabled: !!suggestionId,
    fetch: async () =>
      useCases.getInvestmentEventSuggestionsUseCase.execute({
        assetId: params.assetId,
      }),
  });
  const suggestion = suggestionId
    ? suggestions.data?.find((item) => item.id === suggestionId)
    : undefined;

  const initial = useMemo(() => {
    if (isEditing && operation) {
      return draftFromOperation(operation);
    }
    if (suggestion) {
      return draftFromSuggestion(suggestion);
    }

    return suggestionId ? undefined : defaultDraft();
  }, [isEditing, operation, suggestion, suggestionId]);

  const [edited, setEdited] = useState<EventDraft>();
  const [submitted, setSubmitted] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const draft = edited ?? initial;
  const isDirty = !!edited && !!initial && !isSameDraft(edited, initial);

  const create = useMutation({
    cacheKey: [useCases.createInvestmentEventUseCase.uniqueName],
    fetch: useCases.createInvestmentEventUseCase.execute,
  });
  const update = useMutation({
    cacheKey: [useCases.updateInvestmentOperationUseCase.uniqueName],
    fetch: useCases.updateInvestmentOperationUseCase.execute,
  });
  const approve = useMutation({
    cacheKey: [useCases.approveInvestmentEventSuggestionUseCase.uniqueName],
    fetch: useCases.approveInvestmentEventSuggestionUseCase.execute,
  });
  const reject = useMutation({
    cacheKey: [useCases.rejectInvestmentEventSuggestionUseCase.uniqueName],
    fetch: useCases.rejectInvestmentEventSuggestionUseCase.execute,
  });
  const remove = useMutation({
    cacheKey: [useCases.deleteInvestmentOperationUseCase.uniqueName],
    fetch: useCases.deleteInvestmentOperationUseCase.execute,
  });

  useEffect(() => {
    if (
      [create, update, approve, reject, remove].some(
        (mutation) => mutation.status === "success",
      )
    ) {
      void invalidateInvestments();
      closeModal();
    }
  }, [
    create.status,
    update.status,
    approve.status,
    reject.status,
    remove.status,
  ]);

  const errors = draft ? validateDraft(draft) : {};
  const valid = !!draft && !hasEventErrors(errors);
  const currency = asset?.currency ?? "BRL";
  const preview = useMemo(() => {
    if (!asset || !draft || !valid) {
      return undefined;
    }

    return previewEvent(
      asset.operations.filter((item) => item.id !== params.id),
      asset.assetClass,
      {
        bonusPercent: draft.bonusPercent,
        bonusUnitCost: nonEmpty(draft.bonusUnitCost),
        date: todayCalendarDate(draft.date),
        ratioFrom: draft.ratioFrom,
        ratioTo: draft.ratioTo,
        type: draft.type,
      },
    );
  }, [asset, draft, valid, params.id]);

  const sale = operation
    ? asset?.operations.find(
        (item) => item.fractionOfOperationId === operation.id,
      )
    : undefined;
  const failure = getInvestmentErrorMessage(
    create.error ??
      update.error ??
      approve.error ??
      reject.error ??
      remove.error,
    (day) => formatDay(day, localeTag),
  );

  function money(cents: number) {
    return formatMoney(cents, currency, localeTag);
  }
  function price(value: null | string) {
    return value ? formatUnitPrice(value, currency, localeTag, 2) : "—";
  }

  function rowsOf(): null | {
    averagePrice: PreviewRow;
    cost: PreviewRow;
    quantity: PreviewRow;
  } {
    if (!preview) {
      return null;
    }

    return {
      averagePrice: {
        after: price(preview.averagePriceAfter),
        before: price(preview.averagePriceBefore),
      },
      cost: {
        after: money(preview.costAfter),
        before: money(preview.costBefore),
      },
      quantity: {
        after: formatQuantity(preview.quantityAfter, localeTag),
        before: formatQuantity(preview.quantityBefore, localeTag),
      },
    };
  }

  function change(next: Partial<EventDraft>) {
    if (draft) {
      setEdited({ ...draft, ...next });
    }
  }

  function onSave() {
    setSubmitted(true);

    if (!draft || !asset || readOnly || !valid) {
      return;
    }

    if (suggestion) {
      approve.mutate(toApproveParams(suggestion.id, draft));
    } else if (isEditing && params.id) {
      update.mutate(toUpdateParams(params.id, draft));
    } else {
      create.mutate(toCreateParams(asset.id, draft));
    }
  }

  const fractionQuantity = preview?.fractionQuantity ?? "0";

  return {
    bonusEvery: draft ? bonusEvery(draft.bonusPercent) : "",
    bonusPercent: draft?.bonusPercent ?? "",
    bonusUnitCost: draft?.bonusUnitCost ?? "",
    date: draft?.date ?? new Date(),
    deleteBodyLines: sale
      ? [
          {
            key: "investment.event.deleteFraction" as TranslationKeys,
            params: {
              date: formatDay(sale.date, localeTag),
              quantity: formatQuantity(sale.quantity, localeTag),
              value: money(sale.gross),
            },
          },
          ...(sale.transactionId
            ? [
                {
                  key: "investment.event.deleteEntry" as TranslationKeys,
                  params: {},
                },
              ]
            : []),
        ]
      : [],
    deleteDate: operation ? formatDay(operation.date, localeTag) : "",
    deleteOpen,
    deleteType: operation?.type,
    discardOpen,
    errors: submitted ? errors : {},
    eventTypes: INVESTMENT_EVENT_TYPES,
    failure,
    fractionQuantity: formatQuantity(fractionQuantity, localeTag),
    hasFraction: Number(fractionQuantity) > 0,
    isDeleting: remove.isFetching,
    isEditing,
    isLoading: !draft,
    isSaving:
      create.isFetching ||
      update.isFetching ||
      approve.isFetching ||
      reject.isFetching,
    isSuggestion: !!suggestion,
    newShares: formatQuantity(
      preview
        ? newSharesOf(
            draft?.type,
            preview.quantityBefore,
            preview.quantityAfter,
          )
        : "0",
      localeTag,
    ),
    noPosition: valid && !preview,
    noPositionDate: draft
      ? formatDay(todayCalendarDate(draft.date), localeTag)
      : "",
    onBonusPercentChange: (value: string) => change({ bonusPercent: value }),
    onBonusUnitCostChange: (value: string) => change({ bonusUnitCost: value }),
    onClose: () => (isDirty ? setDiscardOpen(true) : closeModal()),
    onDateChange: (value?: Date) => value && change({ date: value }),
    onDeleteCancel: () => setDeleteOpen(false),
    onDeleteConfirm: () => {
      setDeleteOpen(false);
      if (params.id) {
        remove.mutate(params.id);
      }
    },
    onDeleteOpen: () => setDeleteOpen(true),
    onDiscardCancel: () => setDiscardOpen(false),
    onDiscardConfirm: () => closeModal(),
    onRatioFromChange: (value: string) => change({ ratioFrom: value }),
    onRatioToChange: (value: string) => change({ ratioTo: value }),
    onReject: () => suggestion && reject.mutate(suggestion.id),
    onSave,
    onTypeChange: (value: string) =>
      change({ type: value as InvestmentOperationType }),
    preview: rowsOf(),
    ratioFrom: draft?.ratioFrom ?? "",
    ratioTo: draft?.ratioTo ?? "",
    readOnly,
    saveKey: (suggestion
      ? "investment.event.approve"
      : "investment.event.save") as TranslationKeys,
    ticker: asset ? (asset.ticker ?? asset.name) : "",
    titleKey: titleKeyOf(!!suggestion, isEditing),
    type: draft?.type ?? InvestmentOperationType.SPLIT,
  };
}
