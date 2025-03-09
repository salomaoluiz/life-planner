import React, { createContext, useContext, useEffect } from "react";
import UserProfileEntity from "@domain/entities/user/UserProfileEntity";
import { useProviderLoader } from "@providers/loader";
import { useCases } from "@application/useCases";
import { useQuery } from "@infrastructure/fetcher";

interface Props {
  children: React.ReactNode;
}

interface UserData {
  profile: UserProfileEntity;
}

interface IUserContext {
  logged: boolean;
  data?: UserData;
  update: () => Promise<void>;
}

const UserContext = createContext<IUserContext | undefined>(undefined);

function UserProvider(props: Props) {
  const { setIsLoading } = useProviderLoader();

  const { data, status, refetch, isFetching } = useQuery<UserProfileEntity>({
    cacheKey: [useCases.getUserUseCase.uniqueName],
    fetch: useCases.getUserUseCase.execute,
    retry: false,
  });

  const getUserData = () => {
    if (status === "success" && data) {
      return { profile: data };
    }
  };

  useEffect(() => {
    setIsLoading(isFetching, "user");
  }, [isFetching]);

  async function update() {
    setIsLoading(true, "user");
    await refetch();
  }

  return (
    <UserContext.Provider
      value={{ logged: !!data, data: getUserData(), update }}
    >
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
