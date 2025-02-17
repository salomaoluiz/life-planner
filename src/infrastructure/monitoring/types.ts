interface AddBreadcrumbProps {
  message: string;
  category: string;
  level: "error" | "warning" | "info";
  data?: object;
}

export type AddBreadcrumb = (props: AddBreadcrumbProps) => void;

export interface NavigationIntegration {
  name: string;
  registerNavigationContainer: (ref: unknown) => void;
}
export type CaptureException = (
  error: Error,
  extra?: Record<string, unknown>,
) => void;

export type CaptureMessage = (
  message: string,
  extra?: Record<string, unknown>,
) => void;
