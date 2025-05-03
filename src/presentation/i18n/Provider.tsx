import React from "react";

import { ReactI18NPProvider } from "./react-i18n";

interface Props {
  children: React.ReactNode;
}

function I18NProvider({ children }: Props) {
  return <ReactI18NPProvider>{children}</ReactI18NPProvider>;
}

export default I18NProvider;
