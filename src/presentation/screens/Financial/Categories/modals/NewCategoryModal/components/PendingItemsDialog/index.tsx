import { View } from "react-native";

import { BottomSheet, Button, FormColumns, ListItem, Text } from "@components";

interface Props {
  bodyLabel: string;
  closeLabel: string;
  hiddenLabel?: string;
  okLabel: string;
  onClose: () => void;
  plans: { id: string; label: string }[];
  plansTitle: string;
  recurrences: { id: string; label: string }[];
  recurrencesTitle: string;
  testIDs: { dialog: string; ok: string };
  title: string;
}

// What still uses the category (spec 041 FR 8): display-only, the user resolves them from their own screens.
function PendingItemsDialog(props: Props) {
  const sections = [
    { items: props.recurrences, title: props.recurrencesTitle },
    { items: props.plans, title: props.plansTitle },
  ].filter((section) => section.items.length > 0);

  function renderSection(section: (typeof sections)[number]) {
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
        left={sections[0] && renderSection(sections[0])}
        right={
          <>
            {sections[1] && renderSection(sections[1])}
            {props.hiddenLabel && (
              <Text.Caption tone={"secondary"} value={props.hiddenLabel} />
            )}
          </>
        }
      />
    </BottomSheet>
  );
}

export default PendingItemsDialog;
