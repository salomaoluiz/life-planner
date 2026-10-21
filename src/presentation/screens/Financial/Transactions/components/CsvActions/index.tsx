import { StyleSheet, View } from "react-native";

import { BottomSheet, Button, ListItem } from "@components";
import Icon, { IconButton } from "@components/Icon";
import { useKitTheme } from "@components/utils/useKitTheme";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";

interface Props {
  closeLabel: string;
  exportLabel: string;
  importLabel: string;
  menuLabel: string;
  menuOpen: boolean;
  onExport: () => void;
  onImport: () => void;
  onMenuClose: () => void;
  onMenuOpen: () => void;
  wide: boolean;
}

// Spec 047 FR 1: Import CSV and Export CSV. Web/tablet: two buttons in the toolbar; mobile: the items of an overflow menu.
function CsvActions(props: Props) {
  const { spacing } = useKitTheme();
  const styles = StyleSheet.create({
    row: {
      alignItems: "center",
      flexDirection: "row",
      gap: spacing.sm,
      justifyContent: "flex-end",
    },
  });

  if (props.wide) {
    return (
      <View style={styles.row}>
        <Button.Secondary
          icon={"upload"}
          label={props.importLabel}
          onPress={props.onImport}
          testID={transactionsTestIds.importButton}
        />
        <Button.Secondary
          icon={"download"}
          label={props.exportLabel}
          onPress={props.onExport}
          testID={transactionsTestIds.exportButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <IconButton
        accessibilityLabel={props.menuLabel}
        name={"dots-vertical"}
        onPress={props.onMenuOpen}
        testID={transactionsTestIds.moreActions}
        variant={"plain"}
      />
      <BottomSheet
        closeLabel={props.closeLabel}
        onClose={props.onMenuClose}
        presentation={"inline"}
        testID={transactionsTestIds.moreActionsSheet}
        title={props.menuLabel}
        visible={props.menuOpen}
      >
        <ListItem
          divider
          leading={<Icon name={"upload"} size={24} />}
          onPress={props.onImport}
          testID={transactionsTestIds.importButton}
          title={props.importLabel}
        />
        <ListItem
          leading={<Icon name={"download"} size={24} />}
          onPress={props.onExport}
          testID={transactionsTestIds.exportButton}
          title={props.exportLabel}
        />
      </BottomSheet>
    </View>
  );
}

export default CsvActions;
