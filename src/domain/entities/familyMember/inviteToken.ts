// 32 random bytes encoded as base64url (what the API generates).
const INVITE_TOKEN_REGEX = /^[A-Za-z0-9_-]{43}$/;

function isValidInviteToken(token: unknown): token is string {
  return typeof token === "string" && INVITE_TOKEN_REGEX.test(token);
}

export { isValidInviteToken };
