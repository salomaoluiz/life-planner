import React, { createContext, useContext, useEffect, useMemo } from "react";

import { useCases } from "@application/useCases";
import UserProfileEntity from "@domain/entities/user/UserProfileEntity";
import { onSessionExpired } from "@infrastructure/api";
import { resetFetcherData, useQuery } from "@infrastructure/fetcher";
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

  // The API client clears the token/cache on a 401; resetting the queries makes the user
  // query fail (no token) so `logged` becomes false and the router sends the user to /login.
  useEffect(() => onSessionExpired(() => void resetFetcherData()), []);

  async function update() {
    setIsLoading(true, "user");
    // Callers (login/signup) need to know when loading the profile failed.
    await refetch({ throwOnError: true });
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
