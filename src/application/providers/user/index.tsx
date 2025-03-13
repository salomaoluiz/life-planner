import React, { createContext, useContext, useEffect, useMemo } from "react";

import { useCases } from "@application/useCases";
import UserProfileEntity from "@domain/entities/user/UserProfileEntity";
import { useQuery } from "@infrastructure/fetcher";
import { useProviderLoader } from "@providers/loader";

interface IUserContext {
  data?: UserData;
  logged: boolean;
  update: () => Promise<void>;
}

interface Props {
  children: React.ReactNode;
}

interface UserData {
  profile: UserProfileEntity;
}

const UserContext = createContext<IUserContext | undefined>(undefined);

function UserProvider(props: Props) {
  const { setIsLoading } = useProviderLoader();

  const { data, isFetching, refetch, status } = useQuery<UserProfileEntity>({
    cacheKey: [useCases.getUserUseCase.uniqueName],
    fetch: useCases.getUserUseCase.execute,
    retry: false,
  });

  function getUserData() {
    if (status === "success" && data) {
      return { profile: data };
    }
  }

  useEffect(() => {
    setIsLoading(isFetching, "user");
  }, [isFetching]);

  async function update() {
    setIsLoading(true, "user");
    await refetch();
  }

  const providerValue = useMemo(
    () => ({ data: getUserData(), logged: !!data, update }),
    [status],
  );

  return (
    <UserContext.Provider value={providerValue}>
      {props.children}
    </UserContext.Provider>
  );
}

function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within an UserProvider");
  }

  return context;
}

export { UserProvider, useUser };
