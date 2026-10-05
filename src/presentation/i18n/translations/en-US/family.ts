const family = {
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
    membersOwner: "{{count}} members · {{name}} is the owner",
    membersOwnerYou: "{{count}} members · You are the owner",
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
    addButton: "Add family member",
    cancelInvite: "Cancel invite",
    invite: {
      alreadyExists: "This email is already in the family or invited",
      cancel: "Cancel",
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
      title: "Invite by email",
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
