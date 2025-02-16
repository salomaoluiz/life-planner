import { I18NProvider } from "@presentation/i18n";

import React from "react";

interface Props {
  children: React.ReactNode;
}

function PresentationProviders({ children }: Props) {
  return <I18NProvider>{children}</I18NProvider>;
}

export default PresentationProviders;
