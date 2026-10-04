import React from "react";

import { FetcherProvider } from "@infrastructure/fetcher";

interface Props {
  children: React.ReactNode;
}
function InfrastructureProvider({ children }: Props) {
  return <FetcherProvider>{children}</FetcherProvider>;
}

export default InfrastructureProvider;
