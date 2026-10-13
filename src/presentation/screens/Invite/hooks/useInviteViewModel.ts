import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";

import { useCases } from "@application/useCases";
import {
  FamilyMemberAlreadyExists,
  InviteEmailMismatch,
  InviteExpired,
  InviteNotFound,
} from "@domain/entities/errors";
import {
  invalidateFetcherData,
  useMutation,
  useQuery,
} from "@infrastructure/fetcher";
import { TranslationKeys } from "@presentation/i18n/types";

import InviteUIModel from "../models/InviteUIModel";

const HOME = "/(app)/(tabs)/index";

async function fetchInvite(token: string) {
  const dto = await useCases.getFamilyInviteUseCase.execute(token);

  return new InviteUIModel(dto);
}

function useInviteViewModel() {
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  // Anything but a plain string is treated as an invalid link (the use case rejects "").
  const token = typeof params.token === "string" ? params.token : "";

  // The token is a secret: it is NOT part of the cache key or the mutation variables,
  // because both are copied into error contexts. isFetching gates the UI, so a cached
  // invite of another link is never shown.
  const invite = useQuery<InviteUIModel>({
    cacheKey: [useCases.getFamilyInviteUseCase.uniqueName],
    fetch: async () => fetchInvite(token),
    retry: false,
  });

  // The key is constant, so a 2nd deep link that changes the token on this mounted route
  // must refetch by hand. loadedToken is the token the shown data belongs to: while it
  // differs from the route token the UI reports "loading" (never the old invite).
  const [loadedToken, setLoadedToken] = useState(token);
  const isStale = loadedToken !== token;

  const requestedToken = useRef(token);
  const { refetch } = invite;

  useEffect(() => {
    if (requestedToken.current === token) {
      return;
    }

    requestedToken.current = token;
    refetch().finally(() => setLoadedToken(token));
  }, [refetch, token]);

  const join = useMutation<void, void>({
    cacheKey: [useCases.joinFamilyMemberUseCase.uniqueName],
    fetch: async () =>
      useCases.joinFamilyMemberUseCase.execute({ inviteToken: token }),
  });

  useEffect(() => {
    if (join.status === "success") {
      // Navigate first: invalidating refetches active queries, and this screen's
      // invite query would 404 (the token is single-use) while still mounted.
      router.replace(HOME);
      invalidateFetcherData();
    }
  }, [join.status]);

  function getStatus() {
    if (isStale || invite.isFetching) {
      return "loading" as const;
    }

    if (invite.error instanceof InviteExpired) {
      return "expired" as const;
    }

    if (invite.error instanceof InviteNotFound) {
      return "notFound" as const;
    }

    if (invite.error) {
      return "error" as const;
    }

    return invite.data ? ("ready" as const) : ("loading" as const);
  }

  function getAcceptErrorKey(): TranslationKeys | undefined {
    const error = join.error;

    if (!error) {
      return undefined;
    }

    if (error instanceof FamilyMemberAlreadyExists) {
      return "invite.alreadyMember";
    }

    if (error instanceof InviteExpired) {
      return "invite.expired";
    }

    if (error instanceof InviteNotFound) {
      return "invite.notFound";
    }

    if (error instanceof InviteEmailMismatch) {
      return "invite.notForYou";
    }

    return "invite.acceptFailed";
  }

  function onAccept() {
    join.mutate();
  }

  function onDecline() {
    router.replace(HOME);
  }

  function onGoHome() {
    router.replace(HOME);
  }

  function onRetry() {
    invite.refetch();
  }

  return {
    acceptErrorKey: getAcceptErrorKey(),
    invite: invite.data,
    isAccepting: join.isFetching,
    onAccept,
    onDecline,
    onGoHome,
    onRetry,
    status: getStatus(),
  };
}

export default useInviteViewModel;
