import { I18NProvider } from "@presentation/i18n";

import React from "react";
import { ThemeProvider } from "@presentation/theme";

interface Props {
  children: React.ReactNode;
}

function PresentationProviders({ children }: Props) {
  return (
    <ThemeProvider>
      <I18NProvider>{children}</I18NProvider>
    </ThemeProvider>
  );
}

export default PresentationProviders;
