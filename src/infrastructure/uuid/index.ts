// A random v4 uuid for client-generated ids (gestures and idempotency keys, spec 117). Not a secret: it only has to
// be unique, so `Math.random` is the fallback where `crypto.randomUUID` is missing (Hermes).
function uuidv4(): string {
  const cryptoApi = (globalThis as { crypto?: { randomUUID?: () => string } })
    .crypto;

  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);

    return (char === "x" ? random : (random % 4) + 8).toString(16);
  });
}

export { uuidv4 };
