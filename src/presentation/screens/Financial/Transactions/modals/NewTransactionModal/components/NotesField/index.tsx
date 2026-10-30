import { TextField, useSheetLayout } from "@components";
import { useTranslation } from "@presentation/i18n";
import { MAX_NOTES } from "@screens/Financial/Transactions/modals/NewTransactionModal/models/transactionFormState";
import transactionFormTestIds from "@screens/Financial/Transactions/modals/NewTransactionModal/testIds";

interface Props {
  onChange: (text: string) => void;
  // The form renders the field in both columns; only the one that fits the layout shows (spec 059 FR 6):
  // the last field of the left column when the sheet is wide, the last field before the footer when compact.
  placement: "left" | "right";
  value: string;
}

function NotesField(props: Props) {
  const { t } = useTranslation();
  const { columns, fluid } = useSheetLayout();
  const wide = columns === 2 || !!fluid;

  if ((props.placement === "left") !== wide) {
    return null;
  }

  return (
    <TextField
      counter={`${props.value.length}/${MAX_NOTES}`}
      helper={t("financial.transactions.form.notesHelper")}
      label={t("financial.transactions.form.notes")}
      maxLength={MAX_NOTES}
      minLines={wide ? 4 : 3}
      multiline
      onChangeText={props.onChange}
      testID={transactionFormTestIds.notesInput}
      value={props.value}
    />
  );
}

export default NotesField;
