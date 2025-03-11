import React from "react";
import { ReactQueryProvider } from "@infrastructure/fetcher/reactQuery";

interface Props {
  children: React.ReactNode;
}

function FetcherProvider({ children }: Props) {
  return <ReactQueryProvider>{children}</ReactQueryProvider>;
}

export default FetcherProvider;
