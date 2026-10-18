# Instruções para agentes — portalVotacaoFront

## Escopo e autorização

Este chat/pacote trata somente do frontend em C:/Desenvolvimento/React/portalVotacaoFront. Não alterar o backend, seus documentos, branch, dependências ou dados. Instruções explícitas do usuário prevalecem. Ler [instruções da migração](docs/migracao/instrucoes.md), [plano](docs/migracao/execucao/00-plano.md), [progresso](docs/migracao/execucao/04-progresso.md), [matriz](docs/migracao/execucao/02-matriz-de-modulos.md), [validação](docs/migracao/execucao/03-validacao.md) e [contratos originais](docs/migracao/execucao/06-contratos-originais.md) antes de trabalhar na migração.

Plano aprovado em 12/10/2026 somente para executar preparação, mantendo D1–D6 e M1–M5 pendentes. Não inferir aprovação das mudanças funcionais a partir dessa aprovação. Preparação não implementa FRONT-01. Em 18/10/2026 o usuário autorizou especificamente FRONT-01, sem acessar backend ou fazer commit, mantendo D1–D6 e M1–M5 pendentes. Implementação exige ID autorizado pelo prompt 04; commits exigem validação do usuário e prompt 05. Não fazer commit, push, deploy ou operações de produção sem autorização correspondente. Não usar tempo decorrido como aprovação.

## Referência e preservação

Frontend original: 41478a83b74a8d27c7058a1d79b2ed1deab271c3; HEAD da preparação: e326a9c9b33cfc5e19553209a737d4c7285c8527. Backend original de referência: d1bd37e031d8b699a8dd5a33e039b4ef8a861c8a, somente fonte imutável/cópia isolada autorizada, nunca working tree em migração. Não depender de arquivos/commits produzidos pela outra migração.

Preservar métodos/URLs/barras/params/headers/payloads/status/errors[], token direto em authorization, rotas/deep links/hash atuais, campos, datas/precisão, filtros/limites, S/N/A, classes, representação e efeitos. Não remover recurso por estar oculto no menu; menu não garante autorização. D1–D6 e melhorias M1–M5 estão no plano: decisões impeditivas bloqueiam somente partes afetadas, sem inventar aprovação. Não corrigir Me/Epp, cores, timezone, cursor ou regras de acesso silenciosamente. Abortar HTTP não desfaz escrita; não reexecutar mutations automaticamente.

## Padrões da direção aprovada

React + TypeScript estrito + Vite + MUI/Emotion + React Hook Form + TanStack Query, conforme plano. Organização por funcionalidade; cliente HTTP/cache/sessão/escopo/socket compartilhados. RHF para formulário, Query para remoto, contexto para estado compartilhado legítimo, local para seleção/filtros. Não remover Redux antes de mapear e substituir consumidores.

Tipar fronteiras sem any indiscriminado ou suppressions para esconder erros. Tipagem estática não valida respostas em runtime. Query keys incluem identidade/assembleia/filtros pertinentes, nunca senha/token; não persistir cache sensível. Cancelar leituras antigas/descartar respostas tardias, limpar cache e conexão por identidade conforme mudanças aprovadas. Cleanup de listeners/timers/charts faz parte da etapa aplicável. Não impor dialogs, tabelas reduzidas, novos endpoints ou paginação inexistente.

Preservar marca/contato/assets e recursos de teclado/mobile. Escolher versões compatíveis verificadas na etapa de infraestrutura, sem copiar números da referência automaticamente. Diretórios/scripts candidatos descritos no plano são propostas ainda inexistentes: verificar sua criação antes de usá-los; não executar script presumido.

## Checks existentes e limites

Consultar package.json antes de executar comandos. Hoje só existem `npm.cmd run dev` (watcher, não check finito) e `npm.cmd run production` (Webpack finito, escreve public por padrão). No PowerShell usar npm.cmd sem mudar ExecutionPolicy. Para verificar legado sem alterar bundles versionados:

```powershell
$buildLegado = Join-Path $env:TEMP ('portal-votacao-legado-' + [guid]::NewGuid().ToString('N'))
npm.cmd run production -- --output-path $buildLegado
```

Não executar build/testes desnecessariamente em mudanças só documentais. A partir de FRONT-01 existe runner isolado em migration-tests: npm.cmd --prefix migration-tests run test:unit e npm.cmd --prefix migration-tests run test:baseline. Ler migration-tests/README.md antes de executar. Scripts da candidata (tipos/formato/Vite/E2E candidata) ainda são futuros; não existem e não devem ser relatados como executados. Conferir Git/diff, links e consistência para documentação. Após implementação executar checks adequados reais, registrar comandos/resultados e limitações sem enfraquecer testes. Build não equivale a homologação.

API simulada não valida CORS, MongoDB ou autorização real. Integração requer backend original isolado e banco/dados exclusivos identificados de teste; não iniciar fallback local, usar .env/segredos/dados de produção ou executar contra endpoint Heroku por padrão. Não inventar seed ou variável de teste inexistente no original. Sem ambiente, registrar R como não executado; migração do backend não é pré-requisito.

## Git, continuidade e encerramento

Branch preparada: migracao-arquitetura-front, já existente; não recriar/substituir automaticamente. Antes de editar, conferir status/branch/HEAD/diff e trabalhos parciais. Preservar alterações preexistentes/alheias. Sem reset/stash/clean/reversão automática. Nunca adicionar arquivos indiscriminadamente; documentos não rastreados também precisam de revisão de conteúdo.

Atualizar progresso após cada subetapa e antes de operação demorada: referência, estado parcial, arquivos, comando/cwd/resultado, processo/sessão/log se houver, checks não executados, bloqueios e próximo passo. Logs extensos em local ignorado sem segredos. Timeout/sessão perdida não prova falha: verificar processo e efeitos antes de repetir, não matar processos desconhecidos.

Distinguir implementado, validado simulado, validado real, homologado e commitado; identificar commits pelo histórico sem commits recursivos de hash. Ao concluir cada ID, revisar diff, atualizar matriz/progresso e parar para revisão. Uma entrega final conforme [publicação e reversão](docs/migracao/execucao/05-publicacao-e-reversao.md), sem publicar módulos parciais ou executar produção neste pacote.
