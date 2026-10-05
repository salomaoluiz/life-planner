const family = {
  deleteBlocked: {
    close: "OK",
    message:
      "This family still has stock items or financial records. Delete or move them to another owner first.",
    title: "Can't delete this family",
  },
  member: {
    addButton: "Add family member",
    cancelInvite: "Cancel invite",
    invite: {
      alreadyExists: "This email is already in the family or invited",
      cancel: "Cancel",
      copyLink: "Copy link",
      emailLabel: "Email",
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
};

export default family;
