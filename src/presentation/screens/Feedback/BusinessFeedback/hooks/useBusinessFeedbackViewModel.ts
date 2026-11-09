import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import handleAction from "../actions";
import { RouteDecryptedProps } from "../types";
import { decodeRouteParams } from "../utils";

export type BusinessFeedbackVM = ReturnType<
  typeof useBusinessFeedbackViewModel
>;

function useBusinessFeedbackViewModel() {
  const [params, setParams] = useState<null | RouteDecryptedProps>(null);
  const routeParams = useLocalSearchParams<{ feedback: string }>();

  async function decodeParams() {
    const decoded = await decodeRouteParams(routeParams);
    setParams(decoded);
  }

  useEffect(() => {
    if (routeParams) {
      decodeParams();
    }
  }, []);

  async function onPrimaryButtonPress() {
    if (params) {
      await handleAction(params.primaryButton);
    }
  }

  function onCloseButtonPress() {
    if (params) {
      handleAction(params.closeButton);
    }
  }

  return { onCloseButtonPress, onPrimaryButtonPress, params };
}

export default useBusinessFeedbackViewModel;
