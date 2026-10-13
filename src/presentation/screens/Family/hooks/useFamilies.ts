import { useIsFocused } from "@react-navigation/native";
import { useEffect } from "react";

import { useCases } from "@application/useCases";
import { useQuery } from "@infrastructure/fetcher";
import FamilyMemberUIModel from "@screens/Family/models/FamilyMemberUIModel";
import FamilyViewModel from "@screens/Family/models/FamilyViewModel";

async function queryFamilies() {
  const user = await useCases.getUserUseCase.execute();
  const families = await useCases.getFamiliesUseCase.execute();

  const familyMembers = await Promise.all(
    families.map(async (family) =>
      useCases.getFamilyMembersUseCase.execute(family.id),
    ),
  );

  return families.map((family, index) => {
    const viewer = {
      isFamilyOwner: family.ownerId === user.id,
      userId: user.id,
    };

    return new FamilyViewModel(
      family,
      familyMembers[index].map(
        (member) => new FamilyMemberUIModel(member, viewer),
      ),
      viewer,
    );
  });
}

function useFamilies() {
  const { data, error, isFetching, refetch, status } = useQuery({
    cacheKey: [
      useCases.getFamiliesUseCase.uniqueName,
      useCases.getFamilyMembersUseCase.uniqueName,
      useCases.getUserUseCase.uniqueName,
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
