import React, { createContext, useContext, useMemo, useState } from "react";

export const loaderContexts = {
  i18n: true,
  theme: true,
  user: true,
};

interface LoaderContextData {
  isLoading: boolean;
  setIsLoading: (
    isLoading: boolean,
    context: keyof typeof loaderContexts,
  ) => void;
}

const LoaderContext = createContext<LoaderContextData>({} as LoaderContextData);

interface Props {
  children: React.ReactNode;
}
export function LoaderProvider({ children }: Props) {
  const [isContextLoading, setIsContextLoading] = useState(loaderContexts);

  const contextValue = useMemo(() => {
    return {
      isLoading: Object.values(isContextLoading).some((value) => value),
      setIsLoading,
    };
  }, [isContextLoading]);

  function setIsLoading(
    isLoading: boolean,
    context: keyof typeof loaderContexts,
  ) {
    if (!loaderContexts[context]) {
      throw new Error(`Context ${context} not found`);
    }

    setIsContextLoading((prevState) => ({
      ...prevState,
      [context]: isLoading,
    }));
  }

  return (
    <LoaderContext.Provider value={contextValue}>
      {children}
    </LoaderContext.Provider>
  );
}

export function useProviderLoader() {
  const context = useContext(LoaderContext);

  if (Object.keys(context).length === 0) {
    throw new Error("useLoader must be used within an LoaderProvider");
  }

  return context;
}
