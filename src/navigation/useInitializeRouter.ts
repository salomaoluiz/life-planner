import { useNavigationContainerRef } from "expo-router";
import { useEffect } from "react";

import { monitoring } from "@infrastructure";
import { useProviderLoader } from "@providers/loader";

function useInitializeRouter() {
  monitoring.initializeMonitoring();
  const { isLoading } = useProviderLoader();
  const ref = useNavigationContainerRef();

  useEffect(() => {
    if (ref?.current) {
      monitoring.navigationIntegration.registerNavigationContainer(ref);
    }
  }, [ref]);

  return {
    isLoading,
  };
}

export default useInitializeRouter;
