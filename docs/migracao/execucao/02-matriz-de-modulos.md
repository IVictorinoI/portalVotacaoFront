# Matriz de módulos e cobertura

12/10/2026 — estado inicial do planejamento. Todos os módulos de produto: diagnóstico estático concluído, migração NÃO INICIADA, teste simulado NÃO EXECUTADO, integração real NÃO EXECUTADA, homologação/commit NÃO REALIZADOS. Build legado anterior não altera esses estados.

Referências: [plano](00-plano.md), [contratos](06-contratos-originais.md), [cenários](03-validacao.md). Dependências são internas ao frontend. Risco: A alto, M médio. D/M remetem às decisões/mudanças propostas do plano.

| Área / evidência original | Etapa / dependências | Fluxo e cobertura obrigatória | Risco / pendência |
| --- | --- | --- | --- |
| Testes/baseline; package.json, src/main/routes.jsx | FRONT-01 / preparação | Contratos HTTP/socket, fixtures sintéticas e falhas legadas separadas de correções | A; baseline FRONT-01 em migration-tests, sem integração real |
| Runtime/config/assets; webpack.config.js, src/index.jsx, public/index.html | FRONT-02 / 01 | Build, tema, providers, URLs públicas, protocolo socket, imports/case, fonts/logos | A; versões a escolher, D6 |
| Auth principal; src/auth/*, src/main/authOrApp.jsx | FRONT-03 / 02 | Login/validateToken/restauração/logout/expulsão, authorization direto, sem signup exposto | A; D2, M1–M3 |
| Shell/rotas/menu; src/common/template/*, src/main/routes.jsx | FRONT-03 / 02 | Hash/deep links/refresh/voltar/fallback, menus por tipo, teclado/mobile | A; D2/D6, M4 |
| Assembleia compartilhada; src/index.jsx, src/dashboard/dashboardReducer.js | FRONT-03 / 02 | Storage/usuário/ativo/default, geração da sessão, sem GET tardio alterar outro escopo | A; precedência D2 |
| Presença; src/confirmarpresenca/* | FRONT-04 / 03 | Filtros nome/procurador/ne, ordem, janela 5s, individual e lote filtrado → voto/credor/notificação/evento | A; D4/D5, M1/M2 |
| Votação; src/votar/* | FRONT-05 / 04 revisado | S/N/A, pendentes, pergunta/podeVotar, lote parcial, evento só após resposta | A; D4/D5, M1 |
| Dashboard; src/dashboard/* | FRONT-06 / 03,05 | quorum2/votos2, cards/charts/totais, 10s, classe '.', zero, BRL/cores | A; D3, M5 |
| Credores; src/credor/* | FRONT-07 / 04,05,06 | Grupos 1–4, total, CPF-CNPJ/procurador/online, joins confirmou/votou, pesquisa | A; D2, grandes listas |
| Consulta votos; src/voto/* | FRONT-07 / 04,05,06 | NomeCredor, sort=-ordem, filtrar tipos, moeda/percentual/data, vazio | M; vazio bruto versus renderizado |
| Tempo real; src/votacaotemporeal/* | FRONT-08 / 05,06,07 | 3s, ordem__gt, dedup/cursor/mesmo _id alterado, pergunta e reconexão | A; M5/política cursor |
| Resultado; src/resultado/* | FRONT-08 / 05,06,07 | tipoResultado V/demais, classes 1/4 versus 2/3, subtotais/total, precisão | A; D3 |
| Ata; src/aprovaata/* | FRONT-09 / 04,06,08 | POST sem corpo, classes/secretário/recuperanda, janela 5s, eventos, resumo presentes | A; D3/D4, Me/Epp/cores |
| Chat; src/chat/* | FRONT-10 / 03,04 | Histórico 300, Enter/envio/foco/rolagem, eco/ordem/dedup, payload destinatário, sem privado novo | A; M1–M3/M5, privacidade remota não garantida |
| Badge/leitura; src/notificacao/notificacaoActions.js, notificacaoReducer.js | FRONT-10 / 03,04 | data__gt, polling 5s, lastRead/contador compartilhados, troca de identidade | A; M3, chave global histórica |
| Online; src/onlines/* | FRONT-11 / 03,10 | connectedUsers/getConnectedUsers, expulsarId, cleanup e ações teclado | A; D2, limites de autorização servidor |
| Logs/heartbeat; src/logAcesso/*, src/main/app.jsx | FRONT-11 / 03,10 | Logs 300, 30s/register, expulsarTodos, distinguir ack de persistência | A; D2/D5 |
| Notificações administrativas; src/notificacao/notificacao.jsx/List | FRONT-11 / 03,10 | lido=false/mensagem regex, alternar/lote sequencial, parcial no erro | M; D2/M1/M2 |
| Links CRUD/úteis; src/link/*, src/link-util/* | FRONT-12 / 03,11 | Criar _id=null, PUT objeto original, excluir, reconsulta, nova aba e formulário inline | M; D2/M1/M2/M4 |
| Assembleias/classes; src/assembleia/*, src/classe/* | FRONT-12 / 03,11 | Rotas sem menu, param=true/regex/sort=-ativo e classes cálculo P | M; D1 |
| Login legado; src/login/Login.jsx | FRONT-12 / 03,11 | GET usuarios com senha, usuarioLogado/setUser, preservar ou retirar por decisão | A; D1, case import |
| Contato/marca; src/contato/*, src/auth/auth-contact.jsx | FRONT-12 / 03,11 | Texto/logos/links e rota Contato/contato; sem redesign não solicitado | M; D6/M4 |
| Store global; src/main/reducers.js, src/common/tab/* | FRONT-03/10/13 | Auth/escopo/badge preservados, remoto → Query, form → RHF; confirmar tabs sem consumidor antes de remover | A; M3 |
| Assets e arquivos auxiliares; public/*, src/login/signalR.js, cópias index/consts | FRONT-02/13 | Logos/fontes, identificar consumidor, retirar bundles/libs antigos só após cobertura | M; sem upload/exportação ativo encontrado |
| Build/CI/hospedagem; package.json/lock, Procfile | FRONT-13 / 01–12 | Instalação limpa/case, dist somente, scripts finitos/CI sem deploy, recursos/chunks | A; D6 |
| Regressão, release/reversão | FRONT-14 / 13 | API original real, dados históricos, volume/concurrency e rollback ensaiado | A; D1–D6 afetadas, ambiente exclusivo obrigatório |

## Estado/cache e invalidação propostos

Chave base de query: recurso + identidade estável + assembleia + filtros/ordem/limite/cursor usados. Nunca token/senha. Mesmo endpoint de dashboard sem A na URL deve ter chave por contexto; isso não modifica escopo remoto. Mudança de sessão elimina cache anterior, leituras tardias e conexão antiga. Sem persistência do cache no localStorage.

| Recurso | Leitura/refetch | Escrita/evento e invalidação |
| --- | --- | --- |
| Assembleia/janelas | Consulta inicial; janelas 5s nas telas que já usam; sem novo polling de páginas inativas | Troca de escopo cancela leituras e limpa derivados; não trocar silenciosamente durante lote |
| Credores/presença/votos | Filtros e ordenações originais; stale ao retornar à rota para reconsulta | Confirmar invalida presença, credores, votos, dashboard e resumo de ata; evento segue confirmação HTTP |
| Votação | Query de pendentes e janelas separadas | Votar invalida votos/credor/dashboard/acompanhamento/resultado; sem calcular apuração local |
| Dashboard | 10s enquanto página ativa; evitar refetch duplicado por foco | Invalidações por presença/voto; cleanup de gráficos |
| Tempo real | 3s, cursor explícito por assembleia; política merge aprovada | Reconciliar _id/ordem; não perder atualização já vista, sem inventar evento novo |
| Resultados | Ao montar/invalidation, sem polling novo arbitrário | Ler totais do servidor; preservar modo e precisão |
| Ata | Lista inicial/eventos; janela 5s; dashboard presente original | Invalida lista/resumo após sucesso/evento; sem emitir antes de confirmar |
| Chat/badge | Histórico 300/data; badge 5s + newMessage | Dedup/contador conforme M3/M5; evento de escrita só com documento retornado |
| Logs/notificações/links/classes/assembleias | Entrada/filtros/atualização explícita conforme legado | Marcar lido invalida notificações; links invalida CRUD e úteis; heartbeat sem retry automático |

Proposta inicial Query: staleTime=0 para dados de negócio; retry=false em leituras e escritas; refetchOnWindowFocus=false para não somar polling, cache só em memória. Confirmar políticas por fluxo no piloto; nova tentativa de leitura explícita M2. Recursos pequenos não ganham paginação artificial. Limites/defaults da API serão medidos, com volume D5; virtualização ou paginação adicional exige decisão sem alterar semântica de todos/totais.

## Cobertura transversal e registro futuro

Formulários: login/links/chat e pesquisas; session/storage; autorização menu/deep link/servidor; cache por escopo; listas/filtros/limites; datas/precisão/histórico; arquivos estáticos; teclado/foco; desktop/mobile/zoom; duplo clique/Enter/lotes/duas abas; erro/timeout/resposta fora de ordem. Não há upload/PDF/exportação ativa a inventar.

Ao executar cada módulo, atualizar esta matriz com: subetapa, arquivos, status implementado, comandos/testes simulados, integração real (ou motivo não executada), homologação, decisões e commit somente quando existente. Não substituir estado inicial por concluído apenas porque passou typecheck ou mock.


## Checkpoint FRONT-01 — 18/10/2026

Infraestrutura de testes implementada em migration-tests/ (runner/fixtures/servidor local/HTTP e socket doubles); fontes de produto não migradas. Unitários históricos datas/cores: 2/2 aprovados. Navegador simulado: 42/42 aprovados, exit 0 (42,2 s); resultado registrado no progresso. Nenhuma linha de módulo deve ser marcada migrada ou validada real por esses mocks. API real, MongoDB, protocolo socket, A11Y completa, dispositivo físico, CI remota e homologação permanecem não executados. D1–D6 e M1–M5 pendentes; FRONT-02 não iniciada.

Cobertura: 16 cenários de contrato e 4 diagnósticos originais, mais token restaurado inválido (17 contratos + 4 diagnósticos), cada um em desktop/mobile, e 2 unitários. Diagnósticos separados em specs/diagnostics.spec.cjs; não congelar falha/vulnerabilidade como requisito da candidata. Todos os arquivos de teste ainda sem commit nesta etapa.

## Checkpoint FRONT-02 — 18/10/2026

Runtime/config/assets implementados e verificados localmente em migration-ui, sem migrar módulos de produto. React/TS strict/Vite/MUI/Emotion/Query/RHF instalados em conjunto compatível e fixado; client HTTP/socket sob factories sem conexões automáticas no bootstrap. 15 testes de infraestrutura, tipos/formato/build aprovados; smoke candidato 4/4 desktop/mobile aprovado, rede de negócio bloqueada. Protocolo EIO3/namespace /api/ demonstrado somente com servidor Socket.IO 2.3 sintético em porta efêmera. Baseline do legado permanece protegida e foi reexecutada.

Auth/escopo/menus/formulários e fluxos continuam NÃO migrados; rotas candidatas são avisos de preparação. Assets selecionados copiados sem alterações; nenhum runtime legado removido. API real/protocolo do servidor original/MongoDB/CI remota/homologação do usuário não executados. D1–D6/M1–M5 pendentes. Commit não realizado; próxima etapa proposta FRONT-03 mediante revisão/autorização própria.

## Checkpoint FRONT-03 — 18/10/2026

Auth principal, sessão, precedência de escopo, shell/menus/hash/lazy implementados na candidata e verificados com API simulada; aguardam revisão, sem commit. D2/precedência e parte de M3 aprovadas conforme plano atualizado. Login/logout/restauração, token inválido, storage corrompido, ausência de ativo, cleanup, expulsão, heartbeat e identidade entre abas cobertos. Sem novos guards administrativos. Rotas inclusive ocultas e Contato/contato preservadas; unknown volta ao início. Módulos FRONT-04–12 continuam avisos de preparação: nenhum marcado concluído por navegação funcionar. Heartbeat técnico antecipado para seu dono de sessão; tela/consulta de logs ainda FRONT-11. Badge/chat não implementados, marcador M3 segue pendente. Integração real e homologação não executadas; resultados finais em progresso.

## FRONT-04 — piloto de presença

Fluxo completo implementado na candidata: consulta/regex/representação/ordenação, todas as colunas/BRL, janela 5s, confirmação individual e todos filtrado sequencial, POST {_id}, evento após sucesso, remoção local/invalidações e recuperação de falha sem repetir escrita. Guard local M1 aprovado, sem garantia de idempotência entre abas. Queries segregadas e canceláveis, polling encerra ao sair. Credor próprio continua filtro original de procurador: D2 de permissões não resolvida por esta migração. Estado técnico e commits no progresso; integração real/homologação não executadas.

## FRONT-05 — votação individual e lote

Fluxo de votar implementado e verificado simulado: todas as colunas/BRL, pergunta/janela, S/N/A, pesquisa e procurador, pendentes e lista filtrada, PUT exato/evento atualizado após sucesso, trava/parada/reconciliação sem retry automático. Presença→voto testado no mesmo contexto. Sem correção de permissões/regras remotas ou garantia de voto imutável entre clientes. Integração/homologação não realizadas; commit e checks no progresso.

## FRONT-06 — dashboard/quórum

Cards e gráficos de quorum/votos, metadados e aberturas implementados, com GET original sem filtro, polling 10s e cleanup declarativo. Preservados precisão, ponto/zeros, limiares distintos dos cards e gráficos, paleta e interpretação local dos horários. Texto escuro por contraste M4 aprovado; SVG substitui Chart imperativo sem eliminar dados/legenda/valores/títulos/tooltips. Mobile sem overflow da página, gráfico com rolagem própria. API real/homologação continuam não executadas. D3 permanece pendente para mudanças de regra.

## FRONT-07 — consultas credores/votos

Dois fluxos completos implementados/verificados: credores por quatro classes/totais, ordenação específica e joins por codigo de presença/voto/online, CPF-CNPJ/valor/procurador/indicadores; consulta de votos computados com filtro/ordem/precisão/horários originais. Sem filtro de papel novo, paginação ou limite artificial. Listener online/timer 500ms com cleanup; pesquisa/paineis/tabelas acessíveis com rolagem interna mobile. Queries escopadas/canceláveis. API real/homologação não executadas. Checks e commit no progresso.
