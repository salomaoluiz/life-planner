// Spec 124: every notification query key lives here, under one root, so a write invalidates exactly what it moves.
type Key = string[];

const ROOT = "notification";

export const notificationKeys = {
  all: (): Key => [ROOT],
  devices: (): Key => [ROOT, "devices"],
  list: (filter: string): Key => [ROOT, "list", filter],
  preferences: (): Key => [ROOT, "preferences"],
  preview: (): Key => [ROOT, "preview"],
  unread: (): Key => [ROOT, "unread"],
};
