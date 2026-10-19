# Instruções para agentes — portalVotacaoFront

## Escopo e autorização

Este chat/pacote trata somente do frontend em C:/Desenvolvimento/React/portalVotacaoFront. Não alterar o backend, seus documentos, branch, dependências ou dados. Instruções explícitas do usuário prevalecem. Ler [instruções da migração](docs/migracao/instrucoes.md), [plano](docs/migracao/execucao/00-plano.md), [progresso](docs/migracao/execucao/04-progresso.md), [matriz](docs/migracao/execucao/02-matriz-de-modulos.md), [validação](docs/migracao/execucao/03-validacao.md) e [contratos originais](docs/migracao/execucao/06-contratos-originais.md) antes de trabalhar na migração.

Plano aprovado em 12/10/2026 somente para executar preparação, mantendo D1–D6 e M1–M5 pendentes. Não inferir aprovação das mudanças funcionais a partir dessa aprovação. Preparação não implementa FRONT-01. Em 18/10/2026 o usuário autorizou especificamente FRONT-01, sem acessar backend ou fazer commit, mantendo D1–D6 e M1–M5 pendentes. Em 18/10/2026 “Pode avançar” autorizou somente FRONT-02 após proposta explícita dessa etapa, sem commit ou acesso ao backend. Implementação exige ID autorizado pelo prompt 04; commits exigem validação do usuário e prompt 05. Não fazer commit, push, deploy ou operações de produção sem autorização correspondente. Não usar tempo decorrido como aprovação.

## Referência e preservação

Frontend original: 41478a83b74a8d27c7058a1d79b2ed1deab271c3; HEAD da preparação: e326a9c9b33cfc5e19553209a737d4c7285c8527. Backend original de referência: d1bd37e031d8b699a8dd5a33e039b4ef8a861c8a, somente fonte imutável/cópia isolada autorizada, nunca working tree em migração. Não depender de arquivos/commits produzidos pela outra migração.

Preservar métodos/URLs/barras/params/headers/payloads/status/errors[], token direto em authorization, rotas/deep links/hash atuais, campos, datas/precisão, filtros/limites, S/N/A, classes, representação e efeitos. Não remover recurso por estar oculto no menu; menu não garante autorização. D1–D6 e melhorias M1–M5 estão no plano: decisões impeditivas bloqueiam somente partes afetadas, sem inventar aprovação. Não corrigir Me/Epp, cores, timezone, cursor ou regras de acesso silenciosamente. Abortar HTTP não desfaz escrita; não reexecutar mutations automaticamente.

## Padrões da direção aprovada

React + TypeScript estrito + Vite + MUI/Emotion + React Hook Form + TanStack Query, conforme plano. Organização por funcionalidade; cliente HTTP/cache/sessão/escopo/socket compartilhados. RHF para formulário, Query para remoto, contexto para estado compartilhado legítimo, local para seleção/filtros. Não remover Redux antes de mapear e substituir consumidores.

Tipar fronteiras sem any indiscriminado ou suppressions para esconder erros. Tipagem estática não valida respostas em runtime. Query keys incluem identidade/assembleia/filtros pertinentes, nunca senha/token; não persistir cache sensível. Cancelar leituras antigas/descartar respostas tardias, limpar cache e conexão por identidade conforme mudanças aprovadas. Cleanup de listeners/timers/charts faz parte da etapa aplicável. Não impor dialogs, tabelas reduzidas, novos endpoints ou paginação inexistente.

Preservar marca/contato/assets e recursos de teclado/mobile. Escolher versões compatíveis verificadas na etapa de infraestrutura, sem copiar números da referência automaticamente. FRONT-02 criou migration-ui isolada, com infraestrutura apenas; ler migration-ui/README.md e manifesto antes de usar scripts. Rotas candidatas são avisos de preparação, não módulos migrados. Não executar scripts futuros presumidos.

## Checks existentes e limites

Consultar package.json antes de executar comandos. Hoje só existem `npm.cmd run dev` (watcher, não check finito) e `npm.cmd run production` (Webpack finito, escreve public por padrão). No PowerShell usar npm.cmd sem mudar ExecutionPolicy. Para verificar legado sem alterar bundles versionados:

```powershell
$buildLegado = Join-Path $env:TEMP ('portal-votacao-legado-' + [guid]::NewGuid().ToString('N'))
npm.cmd run production -- --output-path $buildLegado
```

Não executar build/testes desnecessariamente em mudanças só documentais. A partir de FRONT-01 existe runner isolado em migration-tests: npm.cmd --prefix migration-tests run test:unit e npm.cmd --prefix migration-tests run test:baseline. Ler migration-tests/README.md antes de executar. FRONT-02 disponibiliza na candidata typecheck, format:check, test:unit e build; no runner separado test:candidate. Executar com npm.cmd --prefix migration-ui ou migration-tests conforme README. Integração real continua ausente; não relatá-la como executada. Conferir Git/diff, links e consistência para documentação. Após implementação executar checks adequados reais, registrar comandos/resultados e limitações sem enfraquecer testes. Build não equivale a homologação.

API simulada não valida CORS, MongoDB ou autorização real. Integração requer backend original isolado e banco/dados exclusivos identificados de teste; não iniciar fallback local, usar .env/segredos/dados de produção ou executar contra endpoint Heroku por padrão. Não inventar seed ou variável de teste inexistente no original. Sem ambiente, registrar R como não executado; migração do backend não é pré-requisito.

## Git, continuidade e encerramento

Branch preparada: migracao-arquitetura-front, já existente; não recriar/substituir automaticamente. Antes de editar, conferir status/branch/HEAD/diff e trabalhos parciais. Preservar alterações preexistentes/alheias. Sem reset/stash/clean/reversão automática. Nunca adicionar arquivos indiscriminadamente; documentos não rastreados também precisam de revisão de conteúdo.

Atualizar progresso após cada subetapa e antes de operação demorada: referência, estado parcial, arquivos, comando/cwd/resultado, processo/sessão/log se houver, checks não executados, bloqueios e próximo passo. Logs extensos em local ignorado sem segredos. Timeout/sessão perdida não prova falha: verificar processo e efeitos antes de repetir, não matar processos desconhecidos.

Distinguir implementado, validado simulado, validado real, homologado e commitado; identificar commits pelo histórico sem commits recursivos de hash. Ao concluir cada ID, revisar diff, atualizar matriz/progresso e parar para revisão. Uma entrega final conforme [publicação e reversão](docs/migracao/execucao/05-publicacao-e-reversao.md), sem publicar módulos parciais ou executar produção neste pacote.

## Atualização FRONT-03 — 18/10/2026

FRONT-02 validada e commitada em 4c57aa4dc5e11c229e4cca066aa502628ff125a9. “Revisado, pode comitar e avançar” autorizou somente iniciar FRONT-03, sem commit automático desta nem FRONT-04. Usuário decidiu que assembleia ativa da API prevalece sobre storage/usuário/default e aprovou recuperação de storage inválido, limpeza de cache/socket por identidade/assembleia e descarte de respostas antigas. D2 resolvida somente na precedência; permissões adicionais pendentes. M3 parcialmente aprovada para sessão; marcador de leitura continua FRONT-10. Demais D/M pendentes.

A candidata agora tem login RHF, restauração/validação, escopo pela API, shell/menus/hash/lazy e dono de socket/heartbeat em src/auth/session-controller.ts. Não presumir módulos de presença/voto/chat prontos: ainda exibem aviso, sem suas consultas/escritas. Não remover legado. Heartbeat 30s preserva POST sem corpo; cleanup impede novos ciclos, não desfaz escrita em voo. Regras de rede de login/validação originais preservadas; M2 ainda pendente. Testes candidatos permitem HTTP simulado e fixture Socket.IO 2 em 127.0.0.1:19300, nunca backend real. Parar após FRONT-03 para revisão.

## Mandato de avanço autônomo — 18/10/2026

Usuário solicitou trabalhar o máximo possível sem sua presença, com commits locais e checkpoints Markdown recuperáveis após interrupção. Esta instrução explícita prevalece sobre a exigência anterior de parar a cada ID: autorizado implementar/revisar/testar/commitar unidades sucessivas do frontend com comportamento aprovado/preservado, sem declarar homologação do usuário. Não é aprovação das decisões D/M ainda pendentes. Sem backend, push/deploy/produção, dados reais ou retirada prematura do legado. Não iniciar integração real nem concluir FRONT-13/14 sem pré-requisitos/decisões. Se um check falhar, corrigir ou registrar trabalho parcial; não commitar como aprovado.

Avanço possível: FRONT-04 piloto e FRONT-05 após revisão técnica/testes do piloto; FRONT-06–12 por dependências, preservando fórmulas/cores/datas/permissões enquanto decisões abertas. FRONT-12/login legado D1 exige decisão antes de mudar/remover. FRONT-13 depende cobertura integral e D6; FRONT-14 bloqueada por D5/D6 e homologação. Perguntas D4/M1, melhorias M2/M4/M5 e marcador M3 enviadas ao usuário; não presumir respostas. Trabalho independente: caracterização e tipos/adapters compatíveis da FRONT-04.

FRONT-03 commitada: 7a34593 (obter hash completo por git log). Branch limpa antes desta unidade, original frontend 41478a83b74a8d27c7058a1d79b2ed1deab271c3. Próximo checkpoint FRONT-04.A/B. Retomar lendo este registro, o último checkpoint e Git; não repetir operações/processos sem verificar estado.

## Decisões funcionais aprovadas para avanço autônomo — 18/10/2026

Respostas explícitas do usuário: D4/M1 aprovadas — trava contra envios simultâneos, todos sobre lista filtrada, sequencial, parar na primeira falha e consultar após incerteza sem repetir POST/PUT automaticamente. M2/M4/M5 aprovadas — erros/retry manual de leitura, rascunho após falha, acessibilidade/mobile sem perder recursos, cleanup de timers/listeners e invalidação após sucesso. Restante de M3 aprovado — marcador de leitura por usuário/assembleia sem reutilizar marcador global antigo. Não inclui correções de fórmulas, cores, datas ou cursor. Permissões remotas/novos guards continuam sem decisão; preservar filtros/menu atuais. D1/D3/D5/D6 ainda pendentes nos pontos afetados. As aprovações valem para etapas correspondentes sem nova confirmação a cada recurso; não autorizam backend/produção.

## Decisões complementares explícitas — 18/10/2026

D1: preservar o fluxo antigo /#/login por compatibilidade, incluindo segunda sessão e contrato GET original; não substituir pelo login principal. D6: aprovado preparar URLs hash, build dist e servidor estático exclusivamente dist, sem publicar. Hospedagem/subpath/browsers e homologação continuam pendentes. Cursor FRONT-08: aprovado usar maior ordem recebida e atualizar registros existentes por _id preservando posições, sem repetir escritas. Estas respostas substituem somente as pendências correspondentes dos registros históricos. Fórmulas/cores/datas e novas permissões continuam sem aprovação.

## Estado de retomada após FRONT-12/13.A — 18/10/2026

FRONT-12 funcional na candidata e verificada (52 unitários, 124 cenários desktop/mobile); commit 13db3ab encerra sua validação. FRONT-13.A prepara servidor exclusivamente dist, sem novas dependências, com instalação limpa/build/unitários/HTTP estático aprovados em Windows e Linux case-sensitive. Ler [checkpoint de consolidação](docs/migracao/execucao/08-consolidacao.md). Há scripts reais serve:dist e test:static em migration-ui; não executá-los antes de build. Registros antigos de módulos placeholder são históricos, arquivo PendingPage sem consumidor. Não remover legado nem alterar runtime/Procfile raiz antes de adaptar baseline original e concluir gate de consolidação. D6 host/subpath/browsers ainda sem resposta; D5/API real/homologação/produção não executadas. Mandato autônomo de commits locais persiste para partes autorizadas, sem backend/push/deploy.

## Autorização de consolidação — 18/10/2026

Usuário confirmou Heroku, frontend na raiz em http://portal.gladiusconsultoria.com.br/#/votar, somente Chrome, FRONT-14 adiada e sem acesso ao backend. Em seguida autorizou avançar e seguir commitando autonomamente. Isto autoriza concluir FRONT-13 e seus checks/commits locais, não publicar, push, alterar Heroku/DNS/config vars reais, acessar o domínio produtivo ou iniciar FRONT-14. D2/D3: preservar permissões/fórmulas/cores/datas; não inferir autorização para corrigir regras. Referência inicial desta execução 05cf894, branch migracao-arquitetura-front, sem alterações preexistentes.
