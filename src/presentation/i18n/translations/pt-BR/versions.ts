const versions = {
  action: {
    back: "Voltar",
    checkNow: "Verificar agora",
    close: "Fechar",
    reload: "Recarregar agora",
    viewRelease: "Ver release {{version}}",
    whatChanged: "Ver o que mudou",
  },
  banner: {
    apk: "App {{latest}} publicado. Este APK é o {{current}}.",
    dismiss: "Dispensar aviso",
    reload:
      "Uma versão nova do app ({{version}}) já está no ar. Recarregue para atualizar.",
    viewRelease: "Ver release",
  },
  card: {
    api: "API",
    appAndroid: "APP (ANDROID)",
    appIos: "APP (IOS)",
    appWeb: "APP (WEB)",
  },
  changes: {
    added: "Adicionado",
    changed: "Alterado",
    empty: "Nenhuma versão mais nova.",
    fixed: "Corrigido",
    latest: "Última",
    openGithub: "Ver no GitHub",
    removed: "Removido",
    running: "Rodando {{version}}",
    security: "Segurança",
    titleApi: "Novidades da API",
    titleApp: "Novidades do app",
    truncated: "Mostrando as 10 versões mais recentes",
  },
  checkedAgo: "Verificado há {{time}}",
  checkedNever: "Sem verificação",
  env: {
    development: "Desenvolvimento",
    production: "Produção",
    staging: "Staging",
  },
  field: {
    build: "Build",
    latest: "Última no GitHub",
    liveSince: "No ar desde",
    liveVersion: "No ar",
    released: "Publicada",
  },
  footer: "App {{app}} · API {{api}}",
  hint: {
    apiPending:
      "A {{version}} foi publicada no GitHub e ainda não foi deployada na API.",
    apkBehind: "A versão {{version}} foi publicada. Este APK é mais antigo.",
    appPending:
      "A {{version}} foi publicada no GitHub e ainda não foi deployada.",
    reload:
      "A versão {{version}} já foi publicada no servidor. Esta aba ainda roda a anterior.",
  },
  status: {
    apiDown: "API indisponível",
    apkBehind: "APK desatualizado",
    deployPending: "Deploy pendente",
    reload: "Recarregar",
    unknown: "Sem verificação",
    updates_one: "1 atualização",
    updates_other: "{{count}} atualizações",
    upToDate: "Atualizado",
  },
  timeAgo: {
    days: "{{count}} d",
    hours: "{{count}} h",
    minutes: "{{count}} min",
    now: "menos de um minuto",
  },
  title: "Versões",
  unavailableValue: "—",
};

export default versions;
