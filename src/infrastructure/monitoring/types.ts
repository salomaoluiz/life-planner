import React from "react";
import { GenericError } from "@domain/entities/errors";

export interface AddBreadcrumbProps {
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

export type SetContext = (key: string, value: Record<string, unknown>) => void;
export type SetTag = (key: string, value: string) => void;

interface SetUserProps {
  id: string;
}
export type SetUser = (props: SetUserProps) => void;

export interface ErrorBoundaryFallBackProps {
  error: unknown;
  retry: () => void;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  FallbackComponent: (props: ErrorBoundaryFallBackProps) => React.ReactNode;
  beforeCapture: (scope: unknown, error: GenericError) => void;
}

export type ErrorBoundaryType = (props: ErrorBoundaryProps) => React.ReactNode;
