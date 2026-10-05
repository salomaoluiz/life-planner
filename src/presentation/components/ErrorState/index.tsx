import StateBlock from "@components/StateBlock";

export interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  retryLabel: string;
  testID?: string;
  title?: string;
}

function ErrorState(props: ErrorStateProps) {
  return (
    <StateBlock
      actionLabel={props.retryLabel}
      actionVariant="secondary"
      icon="alert-circle-outline"
      message={props.message}
      onAction={props.onRetry}
      testID={props.testID}
      title={props.title}
      tone="expense"
    />
  );
}

export default ErrorState;
