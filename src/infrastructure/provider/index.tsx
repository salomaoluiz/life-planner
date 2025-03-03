import { GoogleOAuth } from "@infrastructure/googleOAuth";
import React from "react";

interface Props {
  children: React.ReactNode;
}
function InfrastructureProvider({ children }: Props) {
  GoogleOAuth.initialize();
  return <>{children}</>;
}

export default InfrastructureProvider;
