function toOwnerQuery(ownerIds: string[]): string {
  if (ownerIds.length === 0) {
    return "";
  }

  return `?${ownerIds.map((id) => `ownerId=${encodeURIComponent(id)}`).join("&")}`;
}

export default toOwnerQuery;
