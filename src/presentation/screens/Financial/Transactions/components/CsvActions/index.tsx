import { BottomSheet, ListItem, Menu } from "@components";
import Icon, { IconButton } from "@components/Icon";
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

// Spec 050: the "More actions" (⋮) button of the page header, on every breakpoint, with Import CSV and Export CSV.
// Web/tablet: an anchored menu under the button; mobile: a bottom sheet.
function CsvActions(props: Props) {
  const trigger = (
    <IconButton
      accessibilityLabel={props.menuLabel}
      name={"dots-vertical"}
      onPress={props.onMenuOpen}
      testID={transactionsTestIds.moreActions}
      variant={props.wide ? "raised" : "plain"}
    />
  );
  const items = (
    <>
      <ListItem
        divider
        inset
        leading={<Icon name={"upload"} size={24} />}
        onPress={props.onImport}
        testID={transactionsTestIds.importButton}
        title={props.importLabel}
      />
      <ListItem
        inset
        leading={<Icon name={"download"} size={24} />}
        onPress={props.onExport}
        testID={transactionsTestIds.exportButton}
        title={props.exportLabel}
      />
    </>
  );

  if (props.wide) {
    return (
      <Menu
        anchor={trigger}
        onDismiss={props.onMenuClose}
        visible={props.menuOpen}
      >
        {items}
      </Menu>
    );
  }

  // The default (modal) presentation: an inline sheet inside the list header collapsed to a ~40 px strip.
  return (
    <>
      {trigger}
      <BottomSheet
        closeLabel={props.closeLabel}
        onClose={props.onMenuClose}
        testID={transactionsTestIds.moreActionsSheet}
        title={props.menuLabel}
        visible={props.menuOpen}
      >
        {items}
      </BottomSheet>
    </>
  );
}

export default CsvActions;
