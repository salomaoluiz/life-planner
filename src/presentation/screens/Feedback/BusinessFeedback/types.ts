import {
  CloseButton,
  FeedbackButton,
} from "@screens/Feedback/BusinessFeedback/actions/types";

export enum FeedbackType {
  Error = "Error",
  Information = "Information",
  Success = "Success",
  Warning = "Warning",
}
export interface RouteDecryptedProps {
  closeButton: CloseButton;
  message: string;
  primaryButton: FeedbackButton;
  title: string;
  type: FeedbackType;
}
