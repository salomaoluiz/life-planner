import { ProgressChip } from "@components";
import { useTranslation } from "@presentation/i18n";
import { PendingState } from "@screens/Financial/Transactions/models/TransactionUIModel";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";

interface Props {
  state: PendingState;
}

// Spec 061 FR 4, 6: "Saving" / "Deleting" next to a row whose request is still running.
function PendingChip(props: Props) {
  const { t } = useTranslation();

  return (
    <ProgressChip
      label={
        props.state === "deleting"
          ? t("financial.transactions.pending.deleting")
          : t("financial.transactions.pending.saving")
      }
      testID={transactionsTestIds.pendingChip}
    />
  );
}

export default PendingChip;
