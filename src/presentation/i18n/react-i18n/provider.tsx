import React from "react";
import i18next from "i18next";

import { I18nextProvider } from "react-i18next";
import { useI18NInitializer } from "./hooks";

interface Props {
  children: React.ReactNode;
}

export function ReactI18NPProvider({ children }: Props) {
  useI18NInitializer();
  return <I18nextProvider i18n={i18next}>{children}</I18nextProvider>;
}
