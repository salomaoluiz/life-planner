import React from "react";

import { FetcherProvider } from "@infrastructure/fetcher";
import * as GoogleOAuth from "@infrastructure/googleOAuth";

interface Props {
  children: React.ReactNode;
}
function InfrastructureProvider({ children }: Props) {
  GoogleOAuth.initialize();
  return <FetcherProvider>{children}</FetcherProvider>;
}

export default InfrastructureProvider;
