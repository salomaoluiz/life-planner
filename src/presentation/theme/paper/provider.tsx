import React from "react";
import { PaperProvider } from "react-native-paper";
import { ThemeProp } from "react-native-paper/lib/typescript/types";

interface Props {
  children: React.ReactNode;
  theme: ThemeProp;
}

function PaperThemeProvider({ children, theme }: Props) {
  return <PaperProvider theme={theme}>{children}</PaperProvider>;
}

export default PaperThemeProvider;
