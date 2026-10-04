import cache from "@infrastructure/cache";
import { tokenStorage } from "@infrastructure/token";

type Listener = () => void;

const listeners = new Set<Listener>();
let handlingToken: null | string = null;
let expiredNotice = false;

function clearSessionExpiredNotice() {
  expiredNotice = false;
}

// `sentToken` is the token the failed request was sent with. Parallel 401s share it,
// so the first one wins; a stale 401 after re-login carries an old token and is ignored.
async function handleSessionExpired(sentToken: string) {
  if (handlingToken === sentToken) {
    return;
  }
  handlingToken = sentToken;

  try {
    if ((await tokenStorage.getToken()) !== sentToken) {
      return;
    }
    await tokenStorage.clearToken();
    cache.invalidateAll();
    expiredNotice = true;
    listeners.forEach((listener) => listener());
  } finally {
    handlingToken = null;
  }
}

function hasSessionExpiredNotice() {
  return expiredNotice;
}

function onSessionExpired(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export {
  clearSessionExpiredNotice,
  handleSessionExpired,
  hasSessionExpiredNotice,
  onSessionExpired,
};
