import { Unmatched, useLocalSearchParams } from "expo-router";

import { isModalName } from "@screens/Navigation/models/modalPath";

import { MODAL_ROUTES } from "./modalRoutes";

// Catch-all route of `(modals)`: the last URL segment is the modal, the rest is the screen behind.
function ModalRoute() {
  const { modal } = useLocalSearchParams<{ modal?: string | string[] }>();
  const segments = Array.isArray(modal) ? modal : [modal ?? ""];
  const name = segments[segments.length - 1];

  if (!isModalName(name)) {
    return <Unmatched />;
  }

  const Modal = MODAL_ROUTES[name];

  return <Modal />;
}

export default ModalRoute;
