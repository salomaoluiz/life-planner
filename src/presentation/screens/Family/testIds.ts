// Per-record ids append `-<id>` (family id, or member id for `member`): `${familyTestIds.card}-${family.familyId}`.
const familyTestIds = {
  archivedChip: "family.card.archived-chip",
  archivedGroup: "family.list.archived-group",
  archivedToggle: "family.list.archived-toggle",
  blockers: "family.card.blockers",
  blockersOk: "family.card.blockers-ok",
  card: "family.card.container",
  cardOptions: "family.card.options",
  cardTitle: "family.card.title",
  cardToggle: "family.card.toggle",
  confirm: "family.card.confirm",
  deleteButton: "family.card.delete-button",
  emptyState: "family.list.empty-state",
  errorState: "family.list.error-state",
  inviteButton: "family.card.invite-button",
  member: "family.card.member",
  menu: "family.card.menu",
  newButton: "family.list.new-button",
  notice: "family.card.notice",
  reactivateButton: "family.card.reactivate-button",
  screen: "family.list.screen",
  skeleton: "family.list.skeleton",
} as const;

export default familyTestIds;
