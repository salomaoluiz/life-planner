import React from "react";

import ApplicationProviders from "@application/providers";
import InfrastructureProvider from "@infrastructure/provider";
import PresentationProviders from "@presentation/providers";

import { LoaderProvider } from "./loader";

interface Props {
  children: React.ReactNode;
}

function GlobalProviders({ children }: Props) {
  return (
    <LoaderProvider>
      <InfrastructureProvider>
        <ApplicationProviders>
          <PresentationProviders>{children}</PresentationProviders>
        </ApplicationProviders>
      </InfrastructureProvider>
    </LoaderProvider>
  );
}

export default GlobalProviders;
