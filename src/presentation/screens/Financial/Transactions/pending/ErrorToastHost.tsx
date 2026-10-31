import { Platform, StyleSheet, View } from "react-native";

import { Toast } from "@components";
import { useKitTheme } from "@components/utils/useKitTheme";
import { useTranslation } from "@presentation/i18n";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import { PendingFailure } from "./pendingChanges";
import { usePendingFailures } from "./usePendingChanges";

const ERROR_DURATION_MS = 6000;
// Mobile: above the FAB (56) with its margin.
const FAB_CLEARANCE = 96;

// Spec 061 FR 9-11: a failed optimistic change shows here, on whatever screen is active.
function ErrorToastHost() {
  const { t } = useTranslation();
  const { spacing } = useKitTheme();
  const { dismiss, failure } = usePendingFailures();
  const message = failure ? messageOf(failure) : "";

  function messageOf(item: PendingFailure) {
    if (item.messageKey) {
      return t(item.messageKey);
    }

    return t(
      item.kind === "delete"
        ? "financial.transactions.error.delete"
        : "financial.transactions.error.save",
      { description: item.description },
    );
  }

  return (
    <View pointerEvents={"box-none"} style={StyleSheet.absoluteFill}>
      <Toast
        actionLabel={t("financial.transactions.error.retry")}
        actionTestID={transactionsTestIds.errorToastRetry}
        bottom={Platform.OS === "web" ? spacing.md : FAB_CLEARANCE}
        durationMs={ERROR_DURATION_MS}
        icon={"alert-circle-outline"}
        key={failure?.id}
        message={message}
        onAction={() => {
          failure?.retry();
          dismiss();
        }}
        onHide={dismiss}
        testID={transactionsTestIds.errorToast}
        visible={!!failure}
      />
    </View>
  );
}

export default ErrorToastHost;
