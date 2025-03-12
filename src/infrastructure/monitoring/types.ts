import React from "react";

export type AddBreadcrumb = (props: AddBreadcrumbProps) => void;

export interface AddBreadcrumbProps {
  category: string;
  data?: object;
  level: "error" | "info" | "warning";
  message: string;
}

export type CaptureException = (
  error: Error,
  extra?: Record<string, unknown>,
) => void;
export type CaptureMessage = (
  message: string,
  extra?: Record<string, unknown>,
) => void;

export interface ErrorBoundaryFallBackProps {
  error: unknown;
  retry: () => void;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  FallbackComponent: (props: ErrorBoundaryFallBackProps) => React.ReactNode;
}
export type ErrorBoundaryType = (props: ErrorBoundaryProps) => React.ReactNode;

export interface NavigationIntegration {
  name: string;
  registerNavigationContainer: (ref: unknown) => void;
}
export type SetContext = (key: string, value: Record<string, unknown>) => void;

export type SetTag = (key: string, value: string) => void;

export type SetUser = (props: SetUserProps) => void;

interface SetUserProps {
  id: string;
}
