import { useIsFocused } from "@react-navigation/native";
import { useEffect } from "react";

import { useCases } from "@application/useCases";
import { useQuery } from "@infrastructure/fetcher";
import FamilyMemberViewModel from "@screens/Family/models/FamilyMembersViewModel";
import FamilyViewModel from "@screens/Family/models/FamilyViewModel";

async function queryFamilies() {
  const families = await useCases.getFamiliesUseCase.execute();

  const familyMembersPromises = families.map(async (family) => {
    return useCases.getFamilyMembersUseCase.execute(family.id);
  });

  const familyMembers = await Promise.all(familyMembersPromises);

  const usersPromises = familyMembers.flat().map(async (member) => {
    if (member.userId) {
      return useCases.getUserByUserIdUseCase.execute(member.userId);
    }
    return undefined;
  });

  const users = await Promise.all(usersPromises);

  return families.reduce((acc, family, index) => {
    const familyMembersViewModels = familyMembers[index].map((familyMember) => {
      const user = users.find((u) => u?.id === familyMember.userId);
      return new FamilyMemberViewModel(familyMember, user);
    });

    const familyViewModel = new FamilyViewModel(
      family,
      familyMembersViewModels,
    );

    return [...acc, familyViewModel];
  }, [] as FamilyViewModel[]);
}

function useFamilies() {
  const { data, error, isFetching, refetch, status } = useQuery({
    cacheKey: [
      useCases.getFamiliesUseCase.uniqueName,
      useCases.getFamilyMembersUseCase.uniqueName,
      useCases.getUserByUserIdUseCase.uniqueName,
    ],
    fetch: queryFamilies,
  });

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused]);

  return {
    error,
    families: data,
    isFetching,
    refetch,
    status,
  };
}

export default useFamilies;
