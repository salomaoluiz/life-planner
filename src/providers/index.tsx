import React from "react";
import { LoaderProvider } from "./loader";

import PresentationProviders from "@presentation/providers";
import InfrastructureProvider from "@infrastructure/provider";

interface Props {
  children: React.ReactNode;
}

function GlobalProviders({ children }: Props) {
  return (
    <LoaderProvider>
      <InfrastructureProvider>
        <PresentationProviders>{children}</PresentationProviders>
      </InfrastructureProvider>
    </LoaderProvider>
  );
}

export default GlobalProviders;
