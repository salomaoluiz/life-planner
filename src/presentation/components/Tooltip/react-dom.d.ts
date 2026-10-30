// Only what the web tooltip uses: the project has no @types/react-dom (react-dom ships with react-native-web).
declare module "react-dom" {
  import { ReactNode, ReactPortal } from "react";

  export function createPortal(
    children: ReactNode,
    container: Element,
  ): ReactPortal;
}
