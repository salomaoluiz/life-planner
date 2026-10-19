import { View } from "react-native";

import { BottomSheet, Button, ConfirmDialog, RadioGroup } from "@components";
import { formatAmount } from "@components/AmountText/formatAmount";
import { RecurrenceHasPaidOccurrences } from "@domain/entities/errors";
import { RecurrenceScope } from "@domain/entities/financial/RecurrenceEntity";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import transactionFormTestIds from "@screens/Financial/Transactions/modals/NewTransactionModal/testIds";

interface Props {
  isAllConfirmOpen: boolean;
  isDeleting: boolean;
  onAllCancel: () => void;
  onAllConfirm: () => void;
  onClose: () => void;
  onDelete: () => void;
  onPaidCancel: () => void;
  onPaidConfirm: () => void;
  onScopeChange: (value: string) => void;
  paidConflict?: RecurrenceHasPaidOccurrences;
  scope: RecurrenceScope;
  visible: boolean;
}

// Delete of a recurring occurrence (spec 034 FR 28-31): three scopes; "All" confirms, and paid occurrences
// ask once more in the danger tone with the counts.
function RecurrenceDeleteSheet(props: Props) {
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const conflict = props.paidConflict;

  return (
    <>
      <BottomSheet
        closeLabel={t("common.actions.close")}
        footer={
          <Button.Destructive
            fullWidth
            label={t("financial.recurrence.delete")}
            loading={props.isDeleting}
            onPress={props.onDelete}
            size={"lg"}
            testID={transactionFormTestIds.recurrenceDeleteSheet}
          />
        }
        onClose={props.onClose}
        presentation={"inline"}
        title={t("financial.recurrence.deleteTitle")}
        visible={props.visible}
      >
        <View>
          <RadioGroup
            accessibilityLabel={t("financial.recurrence.deleteTitle")}
            onChange={props.onScopeChange}
            options={[
              {
                label: t("financial.recurrence.scope.onlyThis"),
                value: "ONLY_THIS",
              },
              {
                label: t("financial.recurrence.scope.thisAndNext"),
                value: "THIS_AND_NEXT",
              },
              { label: t("financial.recurrence.scope.all"), value: "ALL" },
            ]}
            testID={transactionFormTestIds.recurrenceDeleteScope}
            value={props.scope}
          />
        </View>
      </BottomSheet>
      <ConfirmDialog
        cancelLabel={t("common.actions.cancel")}
        closeLabel={t("common.actions.close")}
        confirmLabel={t("common.actions.delete")}
        loading={props.isDeleting}
        message={""}
        onCancel={props.onAllCancel}
        onConfirm={props.onAllConfirm}
        testID={transactionFormTestIds.recurrenceDeleteAllDialog}
        title={t("financial.recurrence.deleteAllConfirm")}
        visible={props.isAllConfirmOpen}
      />
      <ConfirmDialog
        cancelLabel={t("common.actions.cancel")}
        closeLabel={t("common.actions.close")}
        confirmLabel={t("financial.recurrence.deleteAnyway")}
        loading={props.isDeleting}
        message={
          conflict
            ? [
                t("financial.recurrence.deletePaidWarning", {
                  count: conflict.paidCount,
                  total: formatAmount(conflict.paidTotal, localeTag),
                }),
                conflict.detachedCount > 0
                  ? t("financial.recurrence.detachedWarning", {
                      count: conflict.detachedCount,
                    })
                  : "",
              ]
                .filter(Boolean)
                .join(" ")
            : ""
        }
        onCancel={props.onPaidCancel}
        onConfirm={props.onPaidConfirm}
        testID={transactionFormTestIds.recurrenceDeletePaidDialog}
        title={t("financial.recurrence.deleteAllConfirm")}
        visible={!!conflict}
      />
    </>
  );
}

export default RecurrenceDeleteSheet;
