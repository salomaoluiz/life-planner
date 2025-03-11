import React, { createContext, useContext, useEffect, useState } from "react";
import UserProfileEntity from "@domain/entities/user/UserProfileEntity";
import { useProviderLoader } from "@providers/loader";
import { useCases } from "@application/useCases";

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
  const [logged, setLogged] = useState(false);
  const [data, setData] = useState<UserData | undefined>(undefined);

  async function getUserData() {
    const user = await useCases.getUserUseCase.execute();
    if (user instanceof UserProfileEntity) {
      setLogged(true);
      setData({ profile: user });
      setIsLoading(false, "user");
      return;
    }

    setLogged(false);
    setData(undefined);
    setIsLoading(false, "user");
  }

  async function update() {
    setIsLoading(true, "user");
    await getUserData();
  }

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <UserContext.Provider value={{ logged, data, update }}>
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
