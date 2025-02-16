import React from "react";
import { LoaderProvider } from "./loader";

import PresentationProviders from "@presentation/providers";

interface Props {
  children: React.ReactNode;
}

function GlobalProviders({ children }: Props) {
  return (
    <LoaderProvider>
      <PresentationProviders>{children}</PresentationProviders>
    </LoaderProvider>
  );
}

export default GlobalProviders;
