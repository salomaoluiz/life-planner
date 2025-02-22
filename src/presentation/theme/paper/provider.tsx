import React from "react";
import { ThemeProp } from "react-native-paper/lib/typescript/types";
import { PaperProvider } from "react-native-paper";

interface Props {
  children: React.ReactNode;
  theme: ThemeProp;
}

const PaperThemeProvider = ({ children, theme }: Props) => {
  return <PaperProvider theme={theme}>{children}</PaperProvider>;
};

export default PaperThemeProvider;
