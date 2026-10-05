import StateBlock from "@components/StateBlock";

export interface EmptyStateProps {
  actionLabel?: string;
  icon?: string;
  message: string;
  onAction?: () => void;
  testID?: string;
  title: string;
  tone?: "accent" | "expense";
}

function EmptyState(props: EmptyStateProps) {
  return (
    <StateBlock
      actionLabel={props.actionLabel}
      actionVariant="primary"
      icon={props.icon ?? "inbox-outline"}
      message={props.message}
      onAction={props.onAction}
      testID={props.testID}
      title={props.title}
      tone={props.tone ?? "accent"}
    />
  );
}

export default EmptyState;
