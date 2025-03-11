import React from "react";
import { LoaderProvider } from "./loader";

import PresentationProviders from "@presentation/providers";
import InfrastructureProvider from "@infrastructure/provider";
import ApplicationProviders from "@application/providers";

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
