import { BottomSheet, Button } from "@components";

export interface Props {
  actionLabel: string;
  closeLabel: string;
  onAction: () => void;
  onClose: () => void;
  subtitle: string;
  testID: string;
  title: string;
  visible: boolean;
}

function ActionSheet(props: Props) {
  return (
    <BottomSheet
      closeLabel={props.closeLabel}
      onClose={props.onClose}
      subtitle={props.subtitle}
      testID={props.testID}
      title={props.title}
      visible={props.visible}
    >
      <Button.Destructive
        fullWidth
        label={props.actionLabel}
        onPress={props.onAction}
        testID={`${props.testID}-action`}
      />
    </BottomSheet>
  );
}

export default ActionSheet;
