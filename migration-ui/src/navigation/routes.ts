export const routes: Record<string, string> = {
  '/': 'Início',
  '/assembleias': 'Assembleias',
  '/classes': 'Classes',
  '/credores': 'Credores',
  '/votos': 'Votos',
  '/confirmarPresenca': 'Confirmar presença',
  '/votar': 'Votar',
  '/login': 'Login legado',
  '/votacaoTempoReal': 'Votação em tempo real',
  '/chat': 'Chat',
  '/online': 'Usuários online',
  '/logacesso': 'Logs de acesso',
  '/notificacoes': 'Notificações',
  '/resultado': 'Resultado',
  '/aprovaAta': 'Aprovação da ata',
  '/Contato': 'Contato',
  '/contato': 'Contato',
  '/links': 'Links',
  '/links-uteis': 'Links úteis',
};
export const commonMenu = [
  '/',
  '/confirmarPresenca',
  '/votar',
  '/votacaoTempoReal',
  '/resultado',
  '/chat',
  '/aprovaAta',
  '/contato',
  '/links-uteis',
];
export function consultationMenu(tipo: number) {
  return [
    '/credores',
    '/votos',
    ...(tipo === 1 ? ['/online', '/logacesso', '/notificacoes', '/links'] : []),
  ];
}
export function hashRoute(hash: string) {
  const path = (hash.slice(1) || '/').split('?')[0] ?? '/';
  return Object.hasOwn(routes, path) ? path : '/';
}
