import * as GoogleOAuth from "@infrastructure/googleOAuth";
import React from "react";
import { FetcherProvider } from "@infrastructure/fetcher";

interface Props {
  children: React.ReactNode;
}
function InfrastructureProvider({ children }: Props) {
  GoogleOAuth.initialize();
  return <FetcherProvider>{children}</FetcherProvider>;
}

export default InfrastructureProvider;
