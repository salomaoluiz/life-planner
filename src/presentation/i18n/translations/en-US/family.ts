const family = {
  archive: {
    action: "Archive family",
    confirm: "Archive",
    message:
      "It becomes read-only for every member and stops appearing when creating records. Its history stays.",
    title: "Archive this family?",
  },
  archived: {
    banner: "Archived family. Its data is read-only.",
    chip: "Archived",
    group: "Archived ({{count}})",
    note: "Read-only for every member. It does not appear when creating records or in All.",
    reactivate: "Reactivate family",
    readOnly: "This family is archived. Its data is read-only.",
  },
  blockers: {
    body: "Resolve these items first:",
    close: "OK",
    installments: "Installment plans in progress",
    installmentsItem_one: "{{description}} · 1 installment left",
    installmentsItem_other: "{{description}} · {{count}} installments left",
    invites: "Pending invites",
    invoices: "Unpaid invoices",
    invoicesItem: "{{name}} · {{month}} · {{amount}}",
    recurrences: "Active recurrences",
    recurrencesItem: "{{description}} · next on {{date}}",
    title: "This family can't be archived yet",
    unpaid: "Unpaid transactions",
    unpaidItem: "{{description}} · {{date}} · {{amount}}",
  },
  cancelInvite: {
    message: "The link stops working.",
    title: "Cancel invite for {{email}}?",
  },
  card: {
    invite: "Invite member",
    inviteExpiresIn: "Invite expires in {{count}} days",
    inviteExpiresToday: "Invite expires today",
    memberOptions: "Member options",
    members: "Members",
    membersOwner_one: "1 member · {{name}} is the owner",
    membersOwner_other: "{{count}} members · {{name}} is the owner",
    membersOwnerYou_one: "1 member · You are the owner",
    membersOwnerYou_other: "{{count}} members · You are the owner",
    ok: "OK",
    options: "Family options",
    optionsFor: "Options for {{name}}",
    you: "You",
  },
  delete: {
    confirm: "Delete family",
    message: "Members lose access to this family. This can't be undone.",
    title: "Delete {{name}}?",
  },
  deleteBlocked: {
    close: "OK",
    message:
      "This family still has stock items or financial records. Delete or move them to another owner first.",
    title: "Can't delete this family",
  },
  empty: {
    action: "Create family",
    message: "Share stock and finances with the people you live with.",
    title: "Create your family",
  },
  errors: {
    archived: "This family is archived",
  },
  form: {
    counter: "{{count}}/{{max}}",
    name: "Family name",
    nameRequired: "Enter a family name",
    submit: "Create family",
    title: "New family",
  },
  leave: {
    message: "You lose access to this family's stock and finances.",
    title: "Leave {{name}}?",
  },
  list: {
    newFamily: "New family",
    subtitle_one: "1 family",
    subtitle_other: "{{count}} families",
    title: "Family",
  },
  member: {
    cancelInvite: "Cancel invite",
    invite: {
      alreadyExists: "This email is already in the family or invited",
      copied: "Copied",
      copyLink: "Copy link",
      done: "Done",
      emailLabel: "Email",
      helper: "They need to sign in with this email to accept.",
      linkLabel: "Invite link",
      share: "Share…",
      submit: "Create invite",
      successMessage: "Share this link with {{email}}. It expires in 7 days.",
      successTitle: "Invite created",
    },
    leave: "Leave family",
    remove: "Remove member",
    role: {
      owner: "Owner",
    },
    status: {
      expired: "Invite expired",
      pending: "Pending",
    },
  },
  removeMember: {
    message: "They lose access to this family's stock and finances.",
    title: "Remove {{name}}?",
  },
};

export default family;
