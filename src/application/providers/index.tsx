import React from "react";

import { UserProvider } from "./user";

interface Props {
  children: React.ReactNode;
}

function ApplicationProviders(props: Props) {
  return <UserProvider>{props.children}</UserProvider>;
}

export default ApplicationProviders;
