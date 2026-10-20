import { BottomSheet, Button } from "@components";

export interface Props {
  actionLabel: string;
  closeLabel: string;
  onAction: () => void;
  onClose: () => void;
  onSecondaryAction?: () => void;
  /** Optional non-destructive action shown above the destructive one (archive family). */
  secondaryLabel?: string;
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
      {props.secondaryLabel && props.onSecondaryAction ? (
        <Button.Secondary
          fullWidth
          label={props.secondaryLabel}
          onPress={props.onSecondaryAction}
          testID={`${props.testID}-archive-action`}
        />
      ) : null}
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
