import React, { createContext, useContext, useMemo, useState } from "react";

export const loaderContexts = {
  i18n: true,
  theme: true,
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
export const LoaderProvider = ({ children }: Props) => {
  const [isContextLoading, setContextIsLoading] = useState(loaderContexts);

  const isLoading = useMemo(() => {
    return Object.values(isContextLoading).some((value) => value);
  }, [isContextLoading]);

  const setIsLoading = (
    isLoading: boolean,
    context: keyof typeof loaderContexts,
  ) => {
    if (!loaderContexts[context]) {
      throw new Error(`Context ${context} not found`);
    }

    setContextIsLoading((prevState) => ({
      ...prevState,
      [context]: isLoading,
    }));
  };

  return (
    <LoaderContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </LoaderContext.Provider>
  );
};

export function useProviderLoader() {
  const context = useContext(LoaderContext);

  if (Object.keys(context).length === 0) {
    throw new Error("useLoader must be used within an LoaderProvider");
  }

  return context;
}
