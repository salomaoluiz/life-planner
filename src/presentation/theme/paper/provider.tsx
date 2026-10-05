import React from "react";
import { PaperProvider } from "react-native-paper";

import { PaperAppTheme } from "./buildPaperTheme";

interface Props {
  children: React.ReactNode;
  theme: PaperAppTheme;
}

function PaperThemeProvider({ children, theme }: Props) {
  return <PaperProvider theme={theme}>{children}</PaperProvider>;
}

export default PaperThemeProvider;
