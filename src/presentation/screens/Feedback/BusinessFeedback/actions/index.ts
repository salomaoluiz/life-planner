import handleCopyToClipboard from "./copyToClipboard";
import handleNavigation from "./navigation";
import { FeedbackActions, FeedbackButtonAction } from "./types";

async function handleAction(props: FeedbackButtonAction) {
  switch (props.action) {
    case FeedbackActions.COPY_TO_CLIPBOARD:
      return handleCopyToClipboard(props);
    case FeedbackActions.NAVIGATION:
      return handleNavigation(props);
    default:
      throw new Error("Invalid action type");
  }
}

export default handleAction;
