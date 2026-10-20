import { View } from "react-native";

import BottomSheet from "@components/BottomSheet";
import Button from "@components/Button";
import FormColumns from "@components/FormColumns";
import ListItem from "@components/ListItem";
import Text from "@components/Text";

export interface PendingItemsDialogProps {
  bodyLabel: string;
  closeLabel: string;
  /** Shown under the sections, e.g. "and N more you cannot see". */
  footnote?: string;
  okLabel: string;
  onClose: () => void;
  /** Empty sections are not rendered. */
  sections: PendingItemsSection[];
  testIDs: { dialog: string; ok: string };
  title: string;
}

export interface PendingItemsSection {
  items: { id: string; label: string }[];
  title: string;
}

// What blocks an archive (categories, families): display-only, the user resolves them from their own screens.
// The sections flow over two columns on wide layouts (FormColumns stacks them on phones).
function PendingItemsDialog(props: PendingItemsDialogProps) {
  const sections = props.sections.filter((section) => section.items.length > 0);
  const split = Math.ceil(sections.length / 2);

  function renderSection(section: PendingItemsSection) {
    return (
      <View key={section.title}>
        <Text.Caption tone={"secondary"} value={section.title} />
        {section.items.map((item) => (
          <ListItem
            key={item.id}
            testID={`pending-item-${item.id}`}
            title={item.label}
          />
        ))}
      </View>
    );
  }

  return (
    <BottomSheet
      closeLabel={props.closeLabel}
      footer={
        <Button.Primary
          fullWidth
          label={props.okLabel}
          onPress={props.onClose}
          size={"lg"}
          testID={props.testIDs.ok}
        />
      }
      onClose={props.onClose}
      size={"form"}
      testID={props.testIDs.dialog}
      title={props.title}
      visible
    >
      <Text.Body tone={"secondary"} value={props.bodyLabel} />
      <FormColumns
        left={<>{sections.slice(0, split).map(renderSection)}</>}
        right={
          <>
            {sections.slice(split).map(renderSection)}
            {props.footnote && (
              <Text.Caption tone={"secondary"} value={props.footnote} />
            )}
          </>
        }
      />
    </BottomSheet>
  );
}

export default PendingItemsDialog;
