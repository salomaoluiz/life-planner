// Per-record ids append `-<id>` (family id, or member id for `member`): `${familyTestIds.card}-${family.familyId}`.
const familyTestIds = {
  card: "family.card.container",
  cardOptions: "family.card.options",
  cardTitle: "family.card.title",
  cardToggle: "family.card.toggle",
  confirm: "family.card.confirm",
  emptyState: "family.list.empty-state",
  errorState: "family.list.error-state",
  inviteButton: "family.card.invite-button",
  member: "family.card.member",
  menu: "family.card.menu",
  newButton: "family.list.new-button",
  notice: "family.card.notice",
  screen: "family.list.screen",
  skeleton: "family.list.skeleton",
} as const;

export default familyTestIds;
