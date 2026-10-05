const family = {
  cancelInvite: {
    message: "O link deixa de funcionar.",
    title: "Cancelar convite para {{email}}?",
  },
  card: {
    invite: "Convidar membro",
    inviteExpiresIn: "Convite expira em {{count}} dias",
    inviteExpiresToday: "Convite expira hoje",
    memberOptions: "Opções do membro",
    members: "Membros",
    membersOwner: "{{count}} membros · {{name}} é o dono",
    membersOwnerYou: "{{count}} membros · Você é o dono",
    ok: "OK",
    options: "Opções da família",
    optionsFor: "Opções de {{name}}",
    you: "Você",
  },
  delete: {
    confirm: "Excluir família",
    message:
      "Os membros perdem acesso a esta família. Essa ação não pode ser desfeita.",
    title: "Excluir {{name}}?",
  },
  deleteBlocked: {
    close: "OK",
    message:
      "Esta família ainda tem itens de estoque ou registros financeiros. Exclua ou mova esses itens para outro dono antes.",
    title: "Não é possível excluir esta família",
  },
  empty: {
    action: "Criar família",
    message: "Compartilhe estoque e finanças com quem mora com você.",
    title: "Crie sua família",
  },
  form: {
    counter: "{{count}}/{{max}}",
    name: "Nome da família",
    nameRequired: "Informe o nome da família",
    submit: "Criar família",
    title: "Nova família",
  },
  leave: {
    message: "Você perde acesso ao estoque e às finanças desta família.",
    title: "Sair de {{name}}?",
  },
  list: {
    newFamily: "Nova família",
    subtitle_one: "1 família",
    subtitle_other: "{{count}} famílias",
    title: "Família",
  },
  member: {
    addButton: "Adicionar membro",
    cancelInvite: "Cancelar convite",
    invite: {
      alreadyExists: "Este e-mail já está na família ou já foi convidado",
      cancel: "Cancelar",
      copied: "Copiado",
      copyLink: "Copiar link",
      done: "Concluir",
      emailLabel: "E-mail",
      helper: "A pessoa precisa entrar com este e-mail para aceitar.",
      linkLabel: "Link do convite",
      share: "Compartilhar…",
      submit: "Criar convite",
      successMessage:
        "Compartilhe este link com {{email}}. Ele expira em 7 dias.",
      successTitle: "Convite criado",
      title: "Convidar por e-mail",
    },
    leave: "Sair da família",
    remove: "Remover membro",
    role: {
      owner: "Dono",
    },
    status: {
      expired: "Convite expirado",
      pending: "Pendente",
    },
  },
  removeMember: {
    message: "Essa pessoa perde acesso ao estoque e às finanças desta família.",
    title: "Remover {{name}}?",
  },
};

export default family;
