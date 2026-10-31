import { StyleSheet, View } from "react-native";

import { Spinner } from "@components";
import { useKitTheme } from "@components/utils/useKitTheme";
import { useTranslation } from "@presentation/i18n";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";

interface Props {
  children: React.ReactNode;
  updating?: boolean;
}

const DIMMED = 0.55;

// Spec 061 FR 7: a total keeps its old value, dimmed, with a small spinner until the API answered.
function UpdatingTotal(props: Props) {
  const { t } = useTranslation();
  const { spacing } = useKitTheme();
  const styles = StyleSheet.create({
    dimmed: { opacity: DIMMED },
    root: { alignItems: "center", flexDirection: "row", gap: spacing.xs },
  });

  if (!props.updating) {
    return <>{props.children}</>;
  }

  return (
    <View style={styles.root}>
      <View style={styles.dimmed}>{props.children}</View>
      <Spinner
        accessibilityLabel={t("financial.transactions.totals.updating")}
        testID={transactionsTestIds.totalsUpdating}
      />
    </View>
  );
}

export default UpdatingTotal;
