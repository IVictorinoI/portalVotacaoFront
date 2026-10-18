# Progresso da migração do frontend

Última atualização: 18/10/2026 (America/Sao_Paulo). Histórico inicial de 11/10 preservado.

## Autorização e referências

- Repositório autorizado: `C:/Desenvolvimento/React/portalVotacaoFront`.
- Branch: `migracao-arquitetura-front`.
- HEAD inicial: `e326a9c9b33cfc5e19553209a737d4c7285c8527`.
- Original executável: `41478a83b74a8d27c7058a1d79b2ed1deab271c3`; `git diff 41478a8 HEAD -- src package.json webpack.config.js` vazio. Entre esse commit e HEAD há somente documentação de migração.
- Git inicial: `git status --short` vazio; nenhuma alteração preexistente versionada ou não rastreada apresentada. Existem `node_modules` e logs ignorados, não utilizados como evidência funcional.
- Backend consultado somente com `git show` no original `d1bd37e031d8b699a8dd5a33e039b4ef8a861c8a`, anterior aos commits de documentação. O working tree do backend tem alterações de documentação; não foi usado nem alterado.
- Lidos: instruções, arquitetura-destino, exemplos frontend/backend e prompt de diagnóstico. Não encontrados AGENTS.md nos diretórios pesquisados do frontend e ancestrais consultados.

## Etapa e checkpoints

Etapa atual: FRONT-02 — infraestrutura candidata implementada e verificada localmente, aguardando revisão do usuário, sem commit. FRONT-01 commitada em 64453ae. Histórico anterior preservado; FRONT-03 não iniciada.

| Subetapa/área | Estado | Evidência/resultado |
| --- | --- | --- |
| Instruções e Git | Analisado | Escopo exclusivo do frontend e originais identificados |
| Infraestrutura, dependências, build e implantação | Analisado | package.json, lock v1, Webpack, public/index.html, Procfile; build temporário concluído com avisos |
| Rotas, layout, sessão, autorização e estado | Analisado estaticamente | src/main, src/auth, src/common, src/index.jsx |
| Dashboard, assembleias e classes | Analisado estaticamente | src/dashboard, src/assembleia, src/classe |
| Credores, presença, voto e tempo real | Analisado estaticamente | src/credor, src/confirmarpresenca, src/votar, src/voto, src/votacaotemporeal |
| Resultados e assinatura da ata | Analisado estaticamente | src/resultado, src/aprovaata |
| Chat, notificações, online e logs | Analisado estaticamente | src/chat, src/notificacao, src/onlines, src/logAcesso |
| Links, contato e login legado | Analisado estaticamente | src/link, src/link-util, src/contato, src/login |
| Contratos do backend original | Conferidos parcialmente por fonte imutável | Rotas, auth, votos, ata, chat, links, notificações, logs, CORS; sem servidor/banco |
| Testes, teclado, responsividade e integração | Lacunas registradas | Sem suíte versionada; sem execução no navegador ou API real |

## Comandos e resultados

- `git status --short`, `git branch --show-current`, `git rev-parse HEAD`, `git log -5 --oneline`: concluídos; referência acima.
- `rg --files` e buscas por Axios, sockets, storage, timers, campos e formulários: concluídas. Uma busca com globs no argumento de caminho falhou no Windows; refeita com `rg ... src -g ...`.
- `git ls-files '*test*' '*spec*' '.github/*'`: nenhum teste/CI encontrado. Não há scripts test, lint ou typecheck em package.json.
- `node --version`: v24.21.0. `npm --version` bloqueado pela política PowerShell para npm.ps1; `npm.cmd --version`: 11.19.0, sem alterar a política.
- Execução padrão e Node REPL falharam na inicialização do sandbox (`setup refresh had errors`). Leitura local e build executados com ferramenta de shell fora do sandbox autorizada pelo mecanismo de revisão.
- Build finito iniciado: `npm.cmd run production -- --output-path $diagnosticoBuild`, onde `$diagnosticoBuild = Join-Path $env:TEMP ('portal-votacao-front-diagnostico-' + [guid]::NewGuid().ToString('N'))`. Usa dependências já instaladas e saída temporária exclusiva. Sessão de acompanhamento inicial: 41369; concluído com exit 0, Webpack 1.14.0, hash adda313c43a66ad871e2, 18628 ms (18,628 s), app.js ~1,53 MB/CSS 352 kB; avisos UglifyJs. Sessão encerrada. Saída: C:/Users/victo/AppData/Local/Temp/portal-votacao-front-diagnostico-a8df356611bb4c3e9f110a3dcac21ce3. Não executar novamente por perder a sessão sem conferir processo/artefatos.

## Arquivos desta etapa

Somente `docs/migracao/execucao/01-diagnostico.md`, `04-progresso.md` e `06-contratos-originais.md`. Documentação anterior não sobrescrita. Sem instalação, alteração de código/dados, commit, push ou deploy.

## Verificações não executadas

- Testes unitários e E2E: inexistentes no projeto; não criados nesta etapa.
- Navegador, deep links, teclado/foco e dispositivos: não executados; análise estática não equivale à homologação.
- API simulada: nenhum teste executado. API real: nenhum teste executado.
- Backend original em teste: fonte disponível, mas não há ambiente exclusivo de teste validado nem fixtures/credenciais sintéticas fornecidas. Não iniciar o backend com fallback de banco local nem apontar para produção.
- Instalação limpa, CI remota, hospedagem atual e equivalência do bundle public/app.js ao fonte: não verificadas.

## Encerramento do diagnóstico anterior (11/10/2026)

Diagnóstico e contratos gravados e conferidos; build concluído. Git final mostra somente docs/migracao/execucao/ não rastreado; diff de código/dependências/artefatos vazio. Os três documentos existem e não havia conteúdo anterior a conciliar. Parar para revisão. Perguntas D1–D6 no diagnóstico. Após respostas/revisão, executar somente o prompt 02 quando solicitado. A migração do backend não é pré-requisito.



## Planejamento — checkpoint P1 (12/10/2026)

Prompt 02 retomado exclusivamente no frontend; HEAD/branch inalterados. Preexistentes: 01-diagnostico.md, 04-progresso.md e 06-contratos-originais.md não rastreados, preservados. Nenhuma resposta D1–D6 recebida. Instruções, referências, diagnóstico, contratos, progresso e prompts de continuidade relidos; package.json conferido.

A tentativa anterior de gravar o plano não foi executada: revisão automática falhou por limite de uso, sem determinação de insegurança. Em 12/10 a revisão voltou a permitir a operação. P1 concluído: 00-plano.md criado como proposta FRONT-01–14, piloto presença, transição isolada, mudanças M1–M5 e bloqueios. P2: matriz e validação. Nenhuma implementação/instalação/commit/produção.

P2 concluído: 02-matriz-de-modulos.md e 03-validacao.md criados. Cobertura de todas as áreas/rotas, cache/invalidação, scripts atuais versus futuros, unitários/navegador simulado/API real e ambiente exclusivo separados. Nenhum check de aplicação reexecutado nesta etapa documental. P3 seguinte: publicação/reversão e conferência final.

P3 concluído: 05-publicacao-e-reversao.md criado, com compatibilidade, artefatos/backup, restauração em teste, reversão sem rollback automático de dados e gate de autorização de produção. P4 seguinte: conferir documentos/links/IDs e Git; parar para revisão.


## Planejamento — encerramento P4 (12/10/2026)

P4 concluído: sete documentos existem; todos os links Markdown locais conferidos (zero ausentes); FRONT-01–14 têm um cabeçalho cada. git diff --exit-code para src/public/package.json/package-lock.json/webpack.config.js/Procfile retornou 0; git diff --check sem apontamentos em arquivos rastreados. Documentos novos continuam não rastreados, portanto esse último check não representa validação de diff desses arquivos. Branch/HEAD preservados.

Arquivos desta etapa: criados 00-plano.md, 02-matriz-de-modulos.md, 03-validacao.md e 05-publicacao-e-reversao.md; atualizado somente 04-progresso.md com histórico de checkpoints preservado. 01-diagnostico.md e 06-contratos-originais.md não alterados. Git mostra apenas os sete documentos de execucao não rastreados; os três do diagnóstico já eram preexistentes.

Comandos desta etapa: leituras locais Get-Content, inventário Get-ChildItem/rg, consultas Git, gravação dos documentos e conferência de links/IDs por PowerShell. O rg sem AGENTS.md encontrado retornou 1 no levantamento anterior, sem impedir leitura das instruções locais. Nenhuma execução de build/testes, navegador/API simulada/API real, instalação, alteração de código/dados, commit, push ou deploy nesta etapa. O build aprovado anotado acima pertence exclusivamente ao diagnóstico de 11/10.

Estado: planejamento documentado para revisão, não aprovado; FRONT-01–14 não iniciadas. D1–D6 continuam sem resposta; M1–M5 propostas para decisão. D5 bloqueia integração real e D6 o ensaio definitivo de hosting, sem impedir partes independentes do plano. Nenhuma dependência da migração do backend.

Próximo passo: usuário revisar plano/decisões, esclarecer pendências impeditivas e aprovar explicitamente o escopo da preparação. Somente então solicitar prompt 03-preparacao; ele não implementa FRONT-01 e não faz commit. Após preparação revisada, prompt 05 para commit local validado. Parar neste ponto.


## Preparação — checkpoint PREP-A/B (12/10/2026)

Aprovação explícita: usuário respondeu “sim” à pergunta “Você aprova o plano para executar somente a preparação, mantendo essas decisões pendentes?”. Incorporado esse limite: plano aprovado para preparação; D1–D6 e M1–M5 continuam sem decisão, sem autorização funcional implícita.

Repositório autorizado: C:/Desenvolvimento/React/portalVotacaoFront. Branch existente migracao-arquitetura-front, HEAD e326a9c9b33cfc5e19553209a737d4c7285c8527. Referência original frontend 41478a83b74a8d27c7058a1d79b2ed1deab271c3 e contratos 06-contratos-originais.md preservados; backend original d1bd37e031d8b699a8dd5a33e039b4ef8a861c8a permanece apenas referência, sem acesso/modificação nesta preparação.

PREP-A concluído: Git/instruções/plano/progresso conferidos. Preexistentes os sete documentos de execucao não rastreados, provenientes das etapas anteriores; nenhum diff de código rastreado, nenhuma alteração alheia adicional observada no frontend. Não há motivo para trocar/criar branch; mantida a existente, sem stash/reset/clean.

PREP-B concluído: criado AGENTS.md na raiz (não havia arquivo local nem regras em AGENTS.md dos ancestrais consultados), com escopo, preservação, padrões, checks reais versus futuros, continuidade e limites de autorização. Atualizado cabeçalho do plano para registrar aprovação restrita. Não alterados diagnóstico, contratos, matriz, validação ou publicação; suas propostas/pendências continuam válidas.

Primeira etapa futura: FRONT-01 — proteção dos comportamentos críticos, somente depois de preparação revisada, commit validado autorizado pelo prompt 05 e autorização do ID no prompt 04. Não iniciada; nenhuma biblioteca/harness/fixture/código criada nesta preparação. PREP-C seguinte: conferir links/consistência/estado final e parar para revisão da preparação.

## Preparação — encerramento PREP-C (12/10/2026)

Preparação concluída para revisão do usuário. Links Markdown locais de AGENTS.md e sete documentos conferidos: zero ausentes. Git diff --exit-code de src/public/package.json/package-lock.json/webpack.config.js/Procfile retornou 0. Branch/HEAD inalterados. Git final: AGENTS.md e sete documentos de execucao não rastreados; os sete documentos já existiam antes desta preparação, sem inclusão no index.

Arquivos alterados nesta etapa: AGENTS.md criado; 00-plano.md e 04-progresso.md atualizados. Nenhum outro documento, código, dependência, dado ou arquivo do backend alterado. Não executados build/testes/navegador/integração por se tratar apenas de preparação documental; o resultado de build anterior pertence ao diagnóstico. Sem commit/push/deploy/produção.

Próximo passo: usuário revisar/validar a preparação e autorizar prompt 05-commit-validado com escopo explícito. O conjunto de documentação anterior continua não commitado e deve ser incluído apenas no escopo validado pelo usuário, sem git add indiscriminado. Depois desse commit, primeira implementação proposta FRONT-01 exige autorização própria; não iniciada automaticamente. D1–D6 e M1–M5 permanecem pendentes.

## FRONT-01.A — proteção do original — 18/10/2026

Autorização explícita recebida para somente FRONT-01, sem acessar backend e sem commit. Branch migracao-arquitetura-front; HEAD inicial 1cd0ce66650ef9a2811fa66248182bb032a61829 (plano de migracao), Git inicialmente limpo. Esse commit já contém AGENTS.md e sete documentos: substitui os registros históricos de documentação não commitada. Original frontend 41478a83b74a8d27c7058a1d79b2ed1deab271c3 preservado; comparação de código/dependências original/HEAD previamente vazia.

D1–D6 e M1–M5 pendentes. Nenhum acesso ao backend permitido nesta execução. FRONT-01.A: inspecionados fontes consumidores de sessão/presença/voto/resultado/ata, instruções/plano/matriz/validação; runner isolado em migration-tests com package/lock próprios, sem alterar manifesto/lock/runtime da raiz. Playwright 1.64.1 consultado no registry (Node >=20, local v24.21.0) e documentação oficial de configuração/interceptação. Instalação local de teste e Chromium seguintes; logs e artefatos ignorados. Não confundir simulação de respostas com evidência de servidor.

FRONT-01.B parcial: harness/fixtures e testes críticos criados. Primeira execução da baseline detectou erro do harness: Webpack resolveu entrada relativamente a migration-tests, sem iniciar servidor/navegador; ajustado cwd para a raiz frontend (sem editar config da aplicação). Runner aguardado em sessão 3088, log ignorado migration-tests/baseline-run.log; não houve chamadas reais. Próxima execução após correção, unitários de datas/cores originais e revisão dos cenários diagnósticos.

FRONT-01.B checkpoint: unitários `npm.cmd --prefix migration-tests run test:unit` passaram 2/2, sem skips. Execução de navegador anterior falhou na verificação estrita de rede porque AdminLTE solicita CSS fonts.googleapis.com: endpoint conhecido passou a ser respondido com CSS vazio local, sem acesso remoto. O seed de sessão do teste também foi corrigido para ocorrer uma vez por context, evitando apagar a sessão em reload do login original. Falhas foram do harness; nenhum fonte de produção alterado. Suíte ampliada em execução (sessão 50784, log ignorado migration-tests/baseline-run.log), com perfis admin/próprio/procurador, segunda assembleia, lote filtrado, janelas e diagnósticos de duplo envio/ata. Sem backend ou dados reais.

FRONT-01.C checkpoint: suíte anterior relatou 40/40 aprovados (42,9 s) após corrigir espera do evento aprovarata; entretanto a sessão PowerShell com redirecionamento retornou 1 apesar do relatório, com NativeCommandError de warnings stderr. Não registrar exit 0 por suposição: próxima execução captura LASTEXITCODE explicitamente. Incluído caso de token restaurado inválido e alinhado filtro de votos no mock; nova execução necessária após essa alteração. Sem alteração de expectativas de contrato ou produção.

## FRONT-01.C — encerramento para revisão — 18/10/2026

Implementado somente FRONT-01. Runner/lock/config próprios em migration-tests; fixtures admin/credor próprio/procurador, duas assembleias, classes/representação e dados inteiramente sintéticos. Build original isolado sem alterar public; 17 cenários de contratos + 4 diagnósticos separados em desktop/mobile, mais unitários das funções puras originais. Fluxo simulado presença → voto → resultado → ata; filtros/Enter/lotes/janelas/status de erro/payload/evento/precisão/sessão caracterizados. Resultado fixture é estático: não comprova fórmula de apuração, autorização/persistência remotas ou protocolo real.

Resultados finais:
- npm.cmd --prefix migration-tests run test:unit: 2/2 aprovados, exit 0, sem skips (12,16 s incluindo carga do compilador).
- npm.cmd --prefix migration-tests run test:baseline: 42/42 aprovados (42,2 s), retries=0, sem skips; LASTEXITCODE capturado explicitamente, NPM_BASELINE_EXIT=0, sessão 68558 encerrada. Warning NO_COLOR/FORCE_COLOR não representa falha. Log ignorado: migration-tests/baseline-run.log.
- Build via node server.cjs/Webpack API: webpackHash 596322a5f23070608f2e. Manifesto ignorado migration-tests/.baseline/manifest.json registra original/HEAD e SHA-256: app.js 324cbc111e2a1cdc5c25d980e915b87532ec2d8b1911938575d7ef31bd8b2f61; app.css 70c549ff1da0c8be1bb18684a466a30872c3396a4b53b6d7ee0ffc9fb21116f6. Servidor apenas 127.0.0.1:18181, encerrado pelo runner; teste de bind posterior confirmou porta livre.
- node --check em todos os CJS novos: sem erros; UTF-8/whitespace conferidos diretamente inclusive arquivos não rastreados, sem problemas. git diff --check sem erro (avisos de normalização LF/CRLF); links locais de AGENTS/docs/harness: zero ausentes.
- git diff --exit-code de src/public/package.json/package-lock.json/webpack.config.js/Procfile: 0, produção intacta. Dependências novas somente do runner, instaladas sob migration-tests/node_modules; artefatos/logs/browser resultados ignorados, confirmados por git check-ignore. Branch/HEAD continuam migracao-arquitetura-front/1cd0ce66650ef9a2811fa66248182bb032a61829.

Arquivos desta etapa: novos migration-tests/.gitignore, README.md, package.json, package-lock.json, playwright.config.cjs, server.cjs, unit.test.cjs, support/fixtures.cjs, support/baseline.cjs, specs/critical.spec.cjs e specs/diagnostics.spec.cjs. Atualizados AGENTS.md e docs de execução 00/01/02/03/04/06 para autorização restrita, comandos reais, evidência/limites e checkpoint. Doc 05 preservado. Ajustada codificação UTF-8/EOF dos documentos editados. Nenhuma alteração preexistente/alheia identificada no início; Git final tem somente esse escopo modificado/não rastreado.

Diagnósticos reproduzidos sem corrigir: login inicial recarrega após socket ausente; credor próprio é filtrado como procurador; Me/Epp conta não aprovado; clique concorrente gera dois requests. Esses casos estão separados das expectativas úteis de regressão e não impõem manter bugs/crashes na candidata. Decisões D1–D6 e melhorias M1–M5 continuam pendentes, sem aprovação implícita.

Não executados: backend/API real/MongoDB/protocolo Socket.IO, CI remota, ensaio de produção/restauração, dispositivo físico, auditoria completa de teclado/responsividade, homologação manual do usuário. Nenhuma leitura/acesso do repositório backend, nenhum dado/segredo real, commit, push ou deploy. Simulação não equivale à integração real; D5 permanece bloqueio somente das verificações reais posteriores.

Estado final FRONT-01: implementada e verificada automaticamente em baseline simulada, aguardando revisão/validação do usuário, NÃO commitada. Roteiro manual acompanhado: comandos e limitações em migration-tests/README.md; opcional execução --project=desktop --headed para observar os mesmos cenários sintéticos. Próximo passo: revisar entrega e, se validada, autorizar prompt 05 para commit local apenas desse escopo. FRONT-02 necessita autorização própria posterior, não iniciada. Parar aqui para revisão.

## FRONT-01 — validação e commit autorizado — 18/10/2026

Usuário autorizou explicitamente: “Pode fazer o commit”, após entrega dos resultados 2 unitários e 42 casos de navegador aprovados. Escopo validado: harness isolado migration-tests e documentação/instruções associadas da FRONT-01. Resultados e relatório local conferidos, failedTests vazio, código/dependências de produção preservados; não houve mudança funcional desde a execução final que justifique repetir toda a suíte. Nenhum unitário adicional criado apenas para ampliar contagem. Regras puras relevantes atuais protegidas; priorizar testes de novos adaptadores/estado na etapa correspondente, mantendo a baseline de navegador.

Commit local desta entrega contém este registro; obter seu hash pelo histórico Git, sem criar outro commit só para escrever o próprio hash. Nenhum log, node_modules, .baseline, screenshot ou test-results incluído. D1–D6 e M1–M5 permanecem pendentes. Sem backend, push, deploy ou dados de produção.

Próximo passo recomendado: FRONT-02 — infraestrutura mínima candidata (React/TypeScript/Vite/MUI/Emotion/Query/RHF), mediante autorização específica pelo ID. FRONT-02 não iniciada neste pedido. Revisar decisões afetadas antes de implementar mudanças funcionais. A autorização de commit não autoriza avanço automático.

## FRONT-02.A — início autorizado — 18/10/2026

Usuário respondeu “Pode avançar” após proposta explícita FRONT-02. Autorizado somente infraestrutura mínima candidata, sem commit/avanço FRONT-03. Git inicialmente limpo, branch migracao-arquitetura-front, HEAD 64453aeba35dcc725d1995903fe64aad580cfd01 (FRONT-01 já commitada). D1–D6 e M1–M5 continuam pendentes. Sem acesso ao repositório backend.

Conferidos AGENTS/plano/progresso/validação/matriz e package da raiz. Dependências candidatas terão lock/node_modules próprios em migration-ui, sem substituir legado. Registry e documentação oficial Vite/MUI/Socket.IO consultados para engines/peers. public/socket.io.js identifica Socket.IO 2.3.0: candidato manterá essa versão em adapter sem conexão automática; ensaio de protocolo em servidor sintético local, sem importar/iniciar backend do produto. Checkpoint seguinte: arquivos candidatos/providers/tema/config/adapters/testes e instalação isolada.

FRONT-02.B parcial: arquivos candidatos, providers/tema/marca, validação de configuração sem fallback, clientes HTTP/Socket e testes criados. Cópia de assets inicialmente encontrou diretório public candidato ausente; diretório criado e cópia concluída, sem alterar originais. Corrigida codificação UTF-8 da geração via pipeline PowerShell antes dos checks. Instalação isolada em execução (sessão 47749, log ignorado migration-ui/install.log); primeiro typecheck/unit tentou antes de binários estarem disponíveis e falhou por comando ausente, não por erro de aplicação. Não repetir instalação; aguardar conclusão e executar checks reais. Smoke separado para configuração válida/ausente e rede de negócio bloqueada em migration-tests/candidate; baseline legado preservada. Socket 2.3 mantido por compatibilidade apresenta avisos de dependências transitivas antigas; não atualizar major unilateralmente, documentar limite.

FRONT-02.C checkpoint: instalação concluiu com exit 0. Primeira tipagem identificou Stack.alignItems removido na API MUI e acesso interno io.engine sem contrato público nas declarations; ajustados para sx e handshake de conexão pública socket.request. Typecheck posterior passou. Unitários 15/15 aprovados (4 arquivos); teste socket após ajuste final reexecutado isoladamente, 1/1, exit 0. npm ls identificou yaml extraneous; npm prune apenas no node_modules candidato removeu 1 pacote, ls final sem missing/invalid/extraneous. Nenhuma alteração das dependências legadas.

Formato passou. Build Vite 8.3.4 + tsc passou (4,16 s Vite, 1010 módulos, JS 385,46 kB / gzip 122,78 kB). Smoke candidato 4/4 aprovados em 21,5 s, CANDIDATE_SMOKE_EXIT=0 (sessão 82233). Baseline legada concluída com BASELINE_EXIT=0 (sessão 83551); contagem final no log a conferir no fechamento. Capturas desktop/mobile da candidata inspecionadas visualmente, marca/textos/aviso sem cortes; nenhuma tela funcional de produto migrada. Logs ignorados migration-ui/install.log, migration-tests/candidate-run.log e baseline-run.log. Sem acesso ao backend ou APIs reais.


FRONT-02.C ajuste final de composição: InfrastructureProvider adicionado para disponibilizar factories HTTP/socket sem leitura de storage/rede automática; garante que ambos adapters também sejam compilados/carregados pelo browser candidato, não somente por teste Node. Typecheck/build final passaram (1119 módulos, JS 510,60 kB / gzip 161,16 kB, Vite 1,91 s). Aviso de chunk >500 kB preservado; lazy de páginas/performance permanecem etapas posteriores, sem aumentar limite. Smoke candidato reexecutando após essa composição; nenhum fluxo funcional adicionado. Baseline legada reexecutada: 42/42 aprovados em 59,2 s, exit 0. Próximo: revisão de arquivos/links/ignore/ports e encerramento, sem commit.

## FRONT-02.C — encerramento para revisão — 18/10/2026

FRONT-02 implementada e verificada localmente, NÃO commitada. Fonte legado intacta; candidata ainda é infraestrutura/aviso de preparação, sem migração de login/sessão/menus/formulários/consultas ou escrita de produto. D1–D6 e M1–M5 continuam pendentes. Nenhum acesso ao backend nesta execução; servidor Socket.IO dos testes é fixture sintética local de devDependency.

Resultados finais:
- npm.cmd --prefix migration-ui run typecheck: exit 0 (também integrado ao build final).
- npm.cmd --prefix migration-ui run format:check: exit 0 após documentação/correções de encoding/EOF; sem erro git diff --check, somente avisos LF/CRLF.
- npm.cmd --prefix migration-ui run test:unit: 15/15 aprovados em 4 arquivos, exit 0 (17,44 s na primeira execução); após ajuste da API pública tipada, npm.cmd --prefix migration-ui run test:unit -- tests/socket.test.ts passou 1/1, exit 0 (0,982 s). Nenhum skip/retry para esconder falha.
- npm.cmd --prefix migration-ui run build: exit 0, TS estrito + Vite 8.3.4, 1119 módulos, JS 510,60 kB/gzip 161,16 kB, Vite 1,91 s. Aviso >500 kB registrado, sem suprimir limiar; lazy/performance ficam etapas pertinentes. dist fica ignorado e não será servido em produção nesta entrega.
- npm.cmd --prefix migration-tests run test:candidate: última execução após InfrastructureProvider passou 4/4 em 13,5 s, CANDIDATE_SMOKE_EXIT=0, sessão 22365 encerrada. Dois builds com/sem env sintético e zero chamadas de negócio; adapters carregados no bundle de navegador sem conexões no bootstrap. Capturas desktop/mobile inspecionadas, apenas aviso/brand.
- npm.cmd --prefix migration-tests run test:baseline: 42/42 em 59,2 s, BASELINE_EXIT=0, sessão 83551 encerrada. Relatórios ignorados de baseline/candidata status passed e failedTests vazio.
- npm ls --depth=0 em migration-ui: coerente, sem missing/invalid/extraneous após prune de 1 pacote yaml não utilizado. Instalação inicial exit 0; não houve npm ci de release, CI remota ou auditoria de segurança/atualização forçada dos pacotes legados.
- Git diff --exit-code para src/public/package.json/package-lock.json/webpack.config.js/Procfile: 0. Logos/logo_login/profile copiados com SHA-256 idêntico ao original. Portas 18181/18182/18183 livres depois dos runners. Links Markdown locais de docs/AGENTS/READMEs: zero ausentes; node --check nos 3 CJS novos aprovado. Dependências, logs, dist, screenshots e saídas .candidate-* ignorados.

Arquivos desta etapa: candidata migration-ui (package/lock/engines, TS/Vite/Prettier/config, .env.example sintético, marca pública selecionada, providers/tema/aviso de rotas, factories HTTP/Query/socket e 4 arquivos de testes), mais migration-tests/candidate-server.cjs, candidate.config.cjs, candidate/smoke.spec.cjs, novo script test:candidate e regras ignore/README associados. Atualizados AGENTS.md e execução 00/02/03/04 para autorização restrita, comandos reais e estado. Diagnóstico/contratos/release e código legados preservados. Nenhum staging/commit/push/deploy. Branch/HEAD continuam migracao-arquitetura-front/64453aeba35dcc725d1995903fe64aad580cfd01; início limpo, sem alterações alheias.

Roteiro manual revisável em migration-ui/README.md: env.example → .env.local somente na candidata com endpoints fictícios, dev em 127.0.0.1:18182, abrir /#/votar e conferir aviso/brand em desktop/mobile; sem config verificar Portal indisponível. Watcher é revisão manual opcional, não evidência de check finito. Nenhuma API real ou dispositivo físico validado, nem homologação funcional, acessibilidade completa, banco, CI, release ou restauração. Socket 2.3/transitivos antigos preservados por compatibilidade, não declaração de segurança ou aprovação de política remota.

Próximo passo: usuário revisar/validar FRONT-02 e, se satisfeito, autorizar prompt 05 para commit somente deste escopo. Próxima implementação proposta FRONT-03 — sessão/escopo/rotas/shell — depende de autorização própria e decisões D2/M3 pertinentes; não iniciada automaticamente. Nenhuma aprovação de políticas foi inferida de “Pode avançar”. Parar aqui para revisão.

## FRONT-02 — validação e commit autorizado — 18/10/2026

Usuário declarou “Revisado, pode comitar e avançar”. FRONT-02 validada para commit local do escopo entregue e autorização para iniciar a próxima FRONT-03; não implica responder D1–D6/M1–M5. Conferidos diff/checks/relatórios da entrega e ausência de alterações de produção ou alheias. Nenhuma alteração funcional desde checks finais que justifique repetir toda a suíte apenas para commitar. O hash deste registro deve ser obtido pelo histórico, sem commit recursivo para gravá-lo.

Commit inclui candidata/lock/fixtures e documentos associados da FRONT-02. Exclui node_modules, dist, logs, .candidate-*, screenshots/resultados e .env locais. Sem push/deploy/backend. Após commit, FRONT-03 prossegue somente em partes independentes; perguntas sobre precedência de assembleia (D2) e proteção de sessão (parte de M3) apresentadas ao usuário, sem presumir respostas.

## FRONT-03.A — autorização e decisões — 18/10/2026

FRONT-02 revisada e commitada em 4c57aa4dc5e11c229e4cca066aa502628ff125a9. Início limpo, sem alterações alheias, branch migracao-arquitetura-front. Usuário autorizou avançar somente FRONT-03. Respondeu: usar assembleia ativa da API; aprovou recuperação de storage inválido, limpeza de cache/socket por identidade/assembleia e descarte de respostas antigas. D2 resolvida apenas quanto à precedência; demais permissões continuam pendentes. M3 aprovada apenas nas proteções de sessão; marcador do chat fica FRONT-10. Demais D/M continuam pendentes. Sem backend, push/deploy ou novo commit autorizado.

A: contratos conferidos em src/auth/*, src/main/authOrApp.jsx, app.jsx, menu.jsx e logAcessoRegister.js. Login POST /oapi/login {login,senha}; restauração POST /oapi/validateToken {token}, valid boolean; assembleia GET /api//assembleias/?ativo=true; heartbeat POST /api//logsAcessos/register sem corpo. Primeira assembleia retornada, como consumidor original, agora fonte única aprovada; sem resultado válido não usar storage/usuário/default. UI de indisponibilidade permite consultar novamente ou sair; não inventa código. Efeitos só após validação/restauração ou login confirmado e escopo disponível. Socket 2 e namespace preservados. Proteção limpa também expulsarId, que antes redirecionava mantendo sessão: aplicação da limpeza de sessão aprovada. Nenhum novo guard por tipo.

B em execução: controller testável de geração, provider e RHF login, shell/menus/deep links e lazy boundaries. Rotas de módulos ainda não migrados continuam avisos explícitos. Heartbeat existente incluído no dono da sessão; consulta administrativa permanece FRONT-11, chat/badge FRONT-10. Não declarar módulo-placeholder concluído.

FRONT-03.B checkpoint: controller/provider/login RHF/shell/menus/hash/fallback/lazy implementados na candidata. Primeiro typecheck encontrou ambiguidade Session.tsx/session.ts no Windows e propriedade Typography incompatível; controller renomeado session-controller.ts e alinhamento pela API aceita. Typecheck posterior exit 0. Unitários 22/22 (5 arquivos), exit 0, 799 ms. Novos 7 casos cobrem validação antes de protegidos, API acima de storage/usuário, falta de ativo, geração tardia, cache/listeners/heartbeat, troca de identidade, expulsões e menus/rotas. Cache não persiste. Iniciando Q navegador/build: fixture Socket.IO 2 local 127.0.0.1:19300, HTTP produto interceptado; sem backend real. Sem alterar legado ou dependências.

## FRONT-03.C — encerramento para revisão — 18/10/2026

FRONT-03 implementada e verificada localmente, NÃO commitada. FRONT-02 anterior já revisada/commitada em 4c57aa4dc5e11c229e4cca066aa502628ff125a9; branch migracao-arquitetura-front permanece nessa HEAD. Início limpo, sem alterações alheias. Somente frontend acessado. Nenhum push/deploy/produção/backend/banco ou segredo real.

Implementado: login RHF {login,senha}, restauração com validateToken antes de protegidos, logout e storage entre abas; código ativo da API como única fonte de escopo aprovada, sem fallback antigo; falta de ativo/rede de escopo mantém páginas desmontadas e oferece consulta explícita/sair. Cache somente em memória cancelado/limpo por geração; socket/listeners/heartbeat 30s com cleanup por identidade/escopo. getUser/setUser e expulsões/notificações preservados; expulsarId também elimina sessão/cache conforme proteção aprovada. Login não depende mais do socket global ausente no original. errors[] e reload em erro de login sem envelope preservados, validação falha encerra sessão como original; não antecipar M2. Revisão identificou rejeição tardia de login antigo que poderia alcançar o reload de outra sessão: resposta/rejeição agora descartadas por geração e teste específico acrescentado.

Shell MUI conserva marca/perfil/nome/email quando disponível, menus por tipo, contato, rotas hash inclusive sem menu/Contato/contato, histórico/fallback; Auth e página pendente lazy com Suspense/erro de chunk. Não criou guard por papel nem cadastro. FRONT-04–12 continuam pendentes com aviso explícito nas páginas, sem seus requests/escritas; presença/voto/resultado/ata/chat NÃO migrados. Badge/leitura segue FRONT-10 e telas administrativas FRONT-11. Heartbeat foi incluído no dono de sessão por exigência da FRONT-03; seu ACK não comprova persistência e cleanup não desfaz POST em voo.

Resultados finais (cwd raiz frontend; Node 24.21.0; npm.cmd):
- npm.cmd --prefix migration-ui run test:unit: 23/23, 5 arquivos, exit 0, 824 ms. Inclui 8 testes de sessão/rotas e 15 anteriores. Sem skips/retries.
- npm.cmd --prefix migration-ui run typecheck: exit 0; também executado pelo build final.
- npm.cmd --prefix migration-ui run format:check: exit 0 após formatação final.
- npm.cmd --prefix migration-ui run build: exit 0, TS + Vite, 1126 módulos, 483 ms Vite; entry 477,41 kB/gzip 147,16; AuthPage 94,17 kB e PendingPage 0,44 kB em chunks separados. Sem aviso >500 kB neste build, limiar não alterado.
- npm.cmd --prefix migration-tests run test:candidate: 24/24, desktop/mobile, 26,6 s, CANDIDATE_EXIT=0, sessão 82073 encerrada. HTTP interceptado + fixture local Socket.IO 2 em 19300; não integração de produto. Rodada anterior 24/24 em 26,7 s; repetição final justificada pela proteção adicional de rejeição tardia. Screenshots do shell desktop/mobile inspecionados visualmente, sem cortes; não auditoria A11Y completa.
- npm.cmd --prefix migration-tests run test:baseline: 42/42, 40,7 s, BASELINE_EXIT=0, sessão 67215 encerrada; inclui build original isolado, sem alterar public. Não repetida depois de mudança exclusiva do controller candidato. Unitários históricos 2/2 da FRONT-01 preservados; não reexecutados nesta etapa porque fontes/testes originais não mudaram.
- git diff --exit-code 41478a83b74a8d27c7058a1d79b2ed1deab271c3 -- src public package.json package-lock.json webpack.config.js Procfile: exit 0. Nenhuma mudança de dependência/lock nesta etapa.
- node --check dos CJS novos/alterados: aprovado. Links Markdown/UTF-8/whitespace inclusive arquivos não rastreados: zero problemas. git diff --check sem erro (avisos LF/CRLF apenas). Build/logs/resultados confirmados ignorados. Portas 18181/18182/18183/19300 livres ao terminar os runners.

Arquivos: novos migration-ui/src/auth/{session-controller.ts,Session.tsx,AuthPage.tsx}, src/navigation/{routes.ts,PendingPage.tsx}, tests/session.test.ts e migration-tests/candidate/session.spec.cjs. Alterados App.tsx/main.tsx, runner candidate-server.cjs e smoke.spec.cjs, READMEs, AGENTS e documentos 00/02/03/04. Diagnóstico, contratos originais 06 e publicação/reversão 05 preservados como referências históricas. Sem staging ou novo commit depois da FRONT-02.

Decisões: D2 resolvida só para precedência API; demais permissões pendentes. M3 aprovada somente na proteção de sessão/storage/cache/socket/respostas antigas; marcador de leitura segue pendente FRONT-10. D1/D3–D6 e demais M1/M2/M4/M5 seguem pendentes fora dessas proteções. Não afirmar ACL/isolamento remoto por ocultação do menu ou cache local.

Não executados: API/backend original real, MongoDB, autorização/persistência do produto, CORS real, CI remota, dispositivo físico, auditoria A11Y completa, ensaio de release/restauração/reversão ou homologação do usuário. D5 bloqueia somente validação real; não usar fallback localhost/Heroku do legado. Nenhuma entrega parcial para publicação.

Próximo passo: revisar FRONT-03. Roteiro opcional e inteiramente sintético: npm.cmd --prefix migration-tests run test:candidate -- --project=desktop --headed (ou --project=mobile); portas livres e dependências do runner/candidata necessárias. Exercita login/Enter, refresh /#/votar, menu/histórico/rotas ocultas, storage inválido, API ativa acima de usuário/storage, logout/outro usuário, sessão entre abas e expulsão. Não executado em modo headed nesta entrega. Após validação, autorizar commit local deste escopo; FRONT-04 (piloto confirmação de presença) requer autorização própria e decisões D4/M1 pertinentes. Parar aqui para revisão, sem avançar automaticamente.

## FRONT-03 — commit validado — 18/10/2026

Usuário autorizou “Pode commitar” após entrega revisável da FRONT-03. Conferidos escopo/diff/resultados acima, sem mudanças funcionais posteriores aos checks finais. Commit local somente dos 18 arquivos da entrega (candidata, harness e documentação). Não incluir artefatos/logs/segredos nem alterações do legado. Hash deste registro disponível pelo histórico, sem commit recursivo. Usuário também solicitou trabalhar autonomamente o máximo possível, com commits/checkpoints recuperáveis; análise e limites desse novo mandato serão registrados na próxima unidade, sem inferir respostas a decisões funcionais pendentes.

## Mandato de avanço autônomo — 18/10/2026

Usuário solicitou trabalhar o máximo possível sem sua presença, com commits locais e checkpoints Markdown recuperáveis após interrupção. Esta instrução explícita prevalece sobre a exigência anterior de parar a cada ID: autorizado implementar/revisar/testar/commitar unidades sucessivas do frontend com comportamento aprovado/preservado, sem declarar homologação do usuário. Não é aprovação das decisões D/M ainda pendentes. Sem backend, push/deploy/produção, dados reais ou retirada prematura do legado. Não iniciar integração real nem concluir FRONT-13/14 sem pré-requisitos/decisões. Se um check falhar, corrigir ou registrar trabalho parcial; não commitar como aprovado.

Avanço possível: FRONT-04 piloto e FRONT-05 após revisão técnica/testes do piloto; FRONT-06–12 por dependências, preservando fórmulas/cores/datas/permissões enquanto decisões abertas. FRONT-12/login legado D1 exige decisão antes de mudar/remover. FRONT-13 depende cobertura integral e D6; FRONT-14 bloqueada por D5/D6 e homologação. Perguntas D4/M1, melhorias M2/M4/M5 e marcador M3 enviadas ao usuário; não presumir respostas. Trabalho independente: caracterização e tipos/adapters compatíveis da FRONT-04.

FRONT-03 commitada: 7a34593 (obter hash completo por git log). Branch limpa antes desta unidade, original frontend 41478a83b74a8d27c7058a1d79b2ed1deab271c3. Próximo checkpoint FRONT-04.A/B. Retomar lendo este registro, o último checkpoint e Git; não repetir operações/processos sem verificar estado.

## FRONT-04.A/B — piloto em execução — 18/10/2026

Usuário respondeu explicitamente: aprovar D4/M1 (trava simultânea, todos filtrado/sequencial, parar em falha, reconsultar sem repetir escrita), M2/M4/M5 (erros/tentativa manual/rascunho/acessibilidade/mobile/cleanup/invalidação) e restante M3 (leitura por usuário/assembleia sem herdar global). Não aprovou mudanças de fórmulas/cores/datas/cursor/permissões. Respostas ficam autorizadas para os respectivos módulos, sem depender de nova confirmação enquanto ausente.

Caracterizados consumidores originais de presença/voto e baseline; rotas e corpos preservados, filtros codigoProcurador inclusive comportamento de credor próprio mantidos até decisão de permissão. Implementado piloto PresencePage com todas as colunas, pesquisa RHF Enter, janela 5s, lista case insensitive, individual/todos, bloqueio síncrono, parada/consulta após falha, evento somente após sucesso, geração de sessão/cache/cleanup. Acrescentados BatchRunner, API de assembleia/presença e acesso tipado ao socket/HTTP da sessão; não mudou dependências/legado. Preparados 4 unitários e 6 cenários de navegador x desktop/mobile (incluem resposta perdida e logout em voo). Iniciando checks; estado ainda não validado/commitado. Fixture HTTP é sintética, controle/eventos Socket.IO somente loopback. Próximo: corrigir eventuais falhas, revisar piloto, commitar unidade aprovada pelo mandato autônomo e seguir FRONT-05.

## FRONT-04.C — piloto verificado e commit autônomo — 18/10/2026

Resultados: npm.cmd --prefix migration-ui run test:unit 27/27 (6 arquivos, 684 ms), build com tsc exit 0 (1132 módulos, Vite 408 ms), format:check exit 0. npm.cmd --prefix migration-tests run test:candidate 36/36 em 40,0 s, exit 0; após acrescentar teste de polling/cleanup e capturas, -- presence.spec.cjs passou 14/14 em 23,2 s, PRESENCE_EXIT=0, sessão 84725 encerrada. Soma de cenários atuais: 38 (24 anteriores + 14 de presença), executados em rodadas documentadas. Baseline original 42/42 em 36,5 s, exit 0, sessão 46748 encerrada. Logs ignorados front04-* e autonomia-baseline.log. Capturas desktop/mobile inspecionadas: colunas completas no desktop, rolagem horizontal focável no mobile, nenhum recurso retirado. API simulada/fixture socket não validam persistência/ACL/CORS do produto.

Revisão técnica do piloto: tipos/HTTP/keys com identidade-assembleia-geração-filtros, sinal de cancelamento de leituras, lote compartilhado síncrono, eventos pós-sucesso e encerramento de polling verificados. Comportamentos originais e mudanças aprovadas separados. Nenhuma alteração de src/public/package/lock/config/Procfile originais (diff contra 41478a8 exit 0). CJS com node --check e git diff --check aprovados após remover blank line em EOF documental; avisos LF/CRLF apenas. Sem dependências novas. Integração real/homologação humana/CI/deploy não executados.

Commit local desta unidade autorizado pelo mandato autônomo; obter hash pelo histórico. Inclui piloto, helpers estritamente usados, testes/harness e docs. Nenhum artefato/log/.env/node_modules. Próximo FRONT-05, reutilizando o piloto revisado tecnicamente; não declarar homologação humana nem integração real. Pendências D1/D2 permissões/D3/D5/D6 preservadas. Retomada: ler 07-retomada-autonoma.md e último checkpoint antes de continuar.

## FRONT-05.A/B — votação em execução — 18/10/2026

FRONT-04 commitada em f3a5a9a, branch limpa antes da unidade. Mandato autônomo vigente. Contratos originais de votar.jsx/List conferidos: GET /api/votos sem barra final, regex nomeCredor, procurador para tipo!=1; PUT /api/votos/votar somente {_id,tipo}; evento votou com objeto local atualizado; somente pendentes no lote e sem ordem nova. Implementados API/tipos/VotingPage lazy, pesquisa RHF, todas as colunas, pergunta/janela 5s, S/N/A individual/todos, trava/lote/parada/reconciliação e descarte por geração. Três unitários de contrato/seleção/payload e oito cenários navegador x2 (inclui presença→voto) preparados. Fixture de sessão adaptada explicitamente para as novas leituras reais da rota votar, mantendo asserts dos contratos. Iniciando Q, ainda sem commit. Fontes/locks legados intactos, integração real ausente.

## FRONT-05.C — verificada e commit autônomo — 18/10/2026

Checks exit 0: test:unit 30/30 (7 arquivos, 710 ms); build com typecheck (Vite 425 ms, 1134 módulos conforme log; VotingPage lazy 4,83 kB); format:check e node --check do spec. test:candidate 54/54 em 1,1 min, CANDIDATE_EXIT=0, sessão 18649 encerrada. Capturas desktop/mobile de presença→voto inspecionadas, sem recurso retirado. Logs ignorados front05-*. Baseline/build original 42/42 da unidade anterior reaproveitados porque não houve alteração de fonte/teste/manifesto legado; não executados novamente sem necessidade. Nenhuma integração real/homologação humana/CI/deploy.

Revisão técnica concluída: contratos/payloads/token/filtros/colunas preservados, melhorias aprovadas rastreadas, sem retry de escrita, geração e janela checadas a cada item. Sem mudanças de dependências, src/public/locks originais. Commit local desta unidade conforme mandato; consultar histórico para hash. Próximo FRONT-06 — dashboard/quórum, preservando diferenças de cor, percentuais e recorte local de horários (D3 pendente), sem alterar apuração. FRONT-03/04/05 funcionais na candidata; demais rotas ainda pendentes. Sem processos de teste ativos desta unidade.

## FRONT-06.A/B — dashboard em execução — 18/10/2026

FRONT-05 commitada em 21f278e; início limpo. Evidência src/dashboard/dashboard.jsx/Actions/Reducer e common/widget/valueBox.jsx/contentHeader.jsx. Preservados GET /api//votos/dashboard sem filtro e ativo, quorum2/votos2, quatro classes, omissão de '.', seis casas nos cards, esperado zero mantido no card/omitido no gráfico, limiares distintos (voto card=100, gráficos=50), paleta e recorte local de horário. Implementado dashboard lazy com cards e dois gráficos de barras SVG declarativos, legenda/valores/tooltip nativo e escala 0–100, sem nova dependência ou instância Chart global. Dados/paleta/limiares preservados; React desmonta gráficos sem acumular instâncias/timers. Summary poll 10s; alteração de assembleia ativa passa pelo controller e limpa escopo antes de liberar outra sessão. Erro/vazio/releitura manual conforme M2, painéis recolhíveis e mobile/rolagem conforme M4. Testes de projeção e browser preparados; ainda não validado/commitado. Sem backend/produção/dados reais.

FRONT-06.C revisão parcial: unitários 34/34 e build/typecheck passaram; primeira suíte candidata 62/62 em 1,2 min, exit 0. Inspeção visual revelou grid do gráfico alargando a página mobile para 448px (viewport 390). Corrigido minWidth e minmax das colunas, mantendo rolagem somente dentro do gráfico, com assert de largura de página acrescentado. Texto dos cards ajustado para escuro por contraste M4 aprovado; cores de fundo/limiares de domínio continuam originais. Reexecutando checks afetados/dashboard antes de commitar; não declarar essa primeira captura como responsividade concluída.

## FRONT-06.C — verificada e commit autônomo — 18/10/2026

Q aprovado: unitários 34/34 em 709 ms; build final com tsc exit 0 (1136 módulos, Vite 462 ms); format:check aprovado antes do ajuste e formato reaplicado após. Candidata completa 62/62 em 1,2 min, exit 0; após corrigir overflow/contraste e acrescentar assert, dashboard isolado 8/8 em 13,5 s, DASHBOARD_EXIT=0, sessão 55863 encerrada. Captura mobile final reinspecionada; largura interna dos gráficos contida, página preserva viewport. Logs ignorados front06-*. Baseline original 42/42 do checkpoint anterior reaproveitada porque nenhuma fonte/harness legado mudou; sem nova execução redundante.

Revisão de regra/DOM/cache concluída, sem corrigir D3. Sem novas dependências, backend ou integração real. Commit autônomo desta unidade; hash pelo histórico. Próxima FRONT-07 consultas de credores e votos por fluxos completos, mantendo joins/colunas/ordenação/precisão. Estado de produto: FRONT-03–06 funcionais na candidata, FRONT-07–12 pendentes; não publicável ainda.

## FRONT-07.A/B — consultas em execução — 18/10/2026

FRONT-06 commitada em d1c88f8; início limpo. Caracterizados src/credor/credor.jsx/List e voto/voto.jsx/List. Implementadas consultas completas lazy, credores por classes 1–4 (1–3 nomes case insensitive; Me/Epp ordem remota), totais/CPF-CNPJ/procurador/online/votou/confirmou e joins estritos por codigo; nomes iguais ao procurador ficam vazios como original. Consulta de votos mantém sort=-ordem, apenas tipo preenchido, precisão 4–6 e sentinela/horário sem fuso. APIs separadas com sinais e keys escopadas, regex de nome/nomeCredor pareadas; indicador socket com listener/timer 500ms limpos. Painéis recolhíveis, tabela inteira com rolagem focável e estados de erro/vazio conforme M2/M4. Nenhuma paginação/truncamento ou filtro de permissão novo. Fixture de domínio distingue filtro de presença de consulta geral, sem mudar baseline original. Iniciando checks; sem commit/integração real ainda.

## FRONT-07.C — verificada e commit autônomo — 18/10/2026

Checks exit 0: unitários 37/37 (9 arquivos, 849 ms), build/typecheck (1142 módulos, Vite 476 ms), format:check, node --check CJS e git diff --check. Candidata 70/70 em 1,4 min, CANDIDATE_EXIT=0, sessão 4251 encerrada. Capturas desktop/mobile reinspecionadas: todas as colunas e totais no desktop; rolagem horizontal focável interna no mobile, sem overflow da página. Logs ignorados front07-*. Zero alteração do legado/locks/dependências; baseline original 42/42 anterior válida, sem repetir fontes inalteradas. API/ACL/CORS/persistência reais, CI/homologação não executados.

Revisão técnica dos dois fluxos concluída, sem simplificar tabela ou unir ordens/filtros. Commit autônomo desta unidade, hash pelo histórico. Próximo FRONT-08 — acompanhamento/resultado; preservar política original de cursor e destacar lacuna sem corrigir silenciosamente. FRONT-03–07 funcionais na candidata, demais módulos pendentes. Sem operação de produção/backend.

## FRONT-08.A/B — resultados e análise do acompanhamento — 18/10/2026

FRONT-07 commitada em f2cdab8; início limpo. Leitura de resultado.jsx/List/Box e votacaoTempoReal.jsx/List originais. Resultados implementados com todas as colunas, diferenças classes 1/4 versus 2/3, modo V subtotal/total do primeiro item, pergunta ativa, percentuais 4–6 casas/BRL e destaques originais. Nada de apuração recalculada no cliente. Queries por escopo, painéis e mobile, erro/vazio/manual conforme aprovações.

Acompanhamento: original usa cursor da lista anterior e ignora atualização de _id existente. Pergunta específica enviada sobre corrigir maior ordem recebida e atualização por _id; sem resposta, não presumir aprovação. Resultados e seus testes são independentes e continuam. Etapa FRONT-08 ainda parcial, não commitada; próxima ação implementar acompanhamento conforme resposta ou preservar política original documentada. Nenhum backend acessado.

FRONT-08.B continuidade sem resposta de cursor: preservada política original explicitamente, sem inferir aprovação da correção. mergeOriginalFeed agrega novos _id antes da lista anterior e calcula cursor pela lista anterior; atualização de _id conhecido continua limitação documentada, não requisito definitivo a perpetuar. Pergunta ainda aberta e pode ajustar somente essa política se usuário responder. Query agregada guarda cursor junto ao feed por identidade/assembleia/geração; HTTP incremental mantém ordem__gt/sort, polling 3s e cleanup. Resultado independente já passou 39 unitários/build; agora verificando etapa completa com acompanhamento e resultados. Nenhuma escrita ou apuração nova.

## FRONT-08.C — verificada e commit autônomo — 18/10/2026

Checks exit 0: unitários 41/41 (11 arquivos, 1,16 s), build/typecheck (1146 módulos, Vite 502 ms), format:check, node --check dos specs e git diff --check. Candidata 80/80 em 1,7 min, CANDIDATE_EXIT=0, sessão 46549 encerrada; sem skips/retries. Capturas de resultado desktop/mobile inspecionadas, colunas integrais/rolagem interna sem overflow da página. Logs ignorados front08-*. Baseline original reaproveitada (42/42) porque não mudou fonte/harness legado; sem repetir checks inalterados. Sem dependências novas/integração real/homologação/CI/deploy.

Commit autônomo da unidade compatível, com limitação explícita de cursor/_id até resposta pendente. Não declara a política original correta. Nenhuma autorização de correção de cursor foi inferida do mandato. Próxima FRONT-09 — assinatura/ata, mantendo Me/Epp/cores/contagens D3 originais; resultados são apenas apresentação de apuração remota. FRONT-03–08 funcionais na candidata, demais módulos pendentes. Backend não acessado.

## FRONT-09.A/B — assinatura e acompanhamento de ata em execução — 18/10/2026

FRONT-08 commitada em ebbe149. Consumidores aprovaAta.jsx/List/votoAction/resultadoQuant/boxResultadoQuant/secretarioRecuperandaBox/Service/CSS conferidos exclusivamente no frontend. Implementado POST sem corpo, evento aprovarata após HTTP, trava/erro ambíguo/reconsulta sem retry; podeAta por janela 5s; grupos/roles/contagens/cores/datas originais, inclusive Me/Epp conta todo registro e limiar >=2 verde (D3 pendente). Lista filtrada, secretário/recuperanda, resConfPres via caminho com barra final preservada. Nenhum PDF/upload/reprovação nova. Eventos aprovou/reprovou removidos no cleanup e reconsultam filtro atual sem refetch concorrente. Unitários 43/43 aprovados; primeiro node --check encontrou parêntese extra no spec, corrigido antes de rodar browser. Build/typecheck acompanhado na sessão 58598. Agora validar navegador/fluxo completo, sem commit até checks aprovados. Fixtures sem backend/produção.

FRONT-09.C primeira rodada: 83 passaram e 7 falharam, exit 1, 3,0 min. Evidência mostrou tabelas corretas no DOM mas aria-label apenas no contêiner; aplicado nome no próprio elemento Table, mantendo expectativas por papel/nome. Teste de janela instalava relógio depois dos timers (falhou desktop e passou mobile por tempo real): movido antes de goto, como os outros testes de polling, sem aumentar tolerância. Nenhum contrato/expectativa de escrita relaxado. Orçamento global do runner ampliado de 180s para 360s porque suíte cresceu de 4 para 90 casos; timeout por teste 15s, workers=1 e retries=0 preservados, sem ocultar falhas individuais. Reexecutar minuto isolado e depois suíte completa.

## FRONT-09.C — corrigida, verificada e commit autônomo — 18/10/2026

Unitários 43/43 (12 arquivos, 1,39 s) e build/typecheck final exit 0 (1148 módulos, Vite 479 ms). Após corrigir nomes acessíveis/relógio, minutos isolado 10/10 em 22,0 s, MINUTES_EXIT=0, sessão 82862 encerrada; suíte candidata completa final 90/90 em 1,9 min, CANDIDATE_EXIT=0, sessão 33539 encerrada. Primeira rodada 7 falhas/83 passes foi registrada e não contada como sucesso. format:check, sintaxe CJS e git diff --check aprovados. Capturas desktop/mobile finais inspecionadas: informação integral e rolagem interna, sem retirar colunas. Logs ignorados front09-*; nenhum artefato no commit.

Sem mudança em dependências/legado, baseline original anterior 42/42 reaproveitada sem repetição. Backend/API/ACL/persistência/CORS reais, CI/homologação/produção não executados. Revisão técnica da unidade concluída; commit autônomo conforme mandato, hash pelo histórico. Próxima FRONT-10 — chat e badge; M3 de marcador por usuário/assembleia já aprovada, assim como rascunho/erro/cleanup/invalidação. D1/D2 permissões/D3/D5/D6 e correção de cursor ainda pendentes. FRONT-03–09 funcionais na candidata, chat/admin/referências ainda pendentes.

## FRONT-10.A/B — chat/badge em execução — 18/10/2026

FRONT-09 commitada em f013573, início limpo. Consumidores chat.jsx/List/CSS e notificacaoActions/Reducer conferidos. Implementados ChatProvider por geração autenticada (badge/cursor/ids compartilhados), ChatPage RHF/Query, histórico 300, POST DTO exato com privateMessageTo={} e destinatário undefined omitido, evento com documento retornado, echo dedup por _id, foco/rolagem e rascunho após falha. Poll badge inicial após 5s e a cada 5s, cursor de busca separado de leitura, cache só memória. Chave nova _chat_notify_last_read:<id codificado>:<assembleia>, sem herdar/apagar global legado; marcador/caches/listeners limpos por contexto e leitura sincronizada entre abas. Eventos com codigoAssembleia divergente são descartados do contexto local conforme M3, sem promessa de ACL/privacidade no servidor. Nenhuma seleção privada nova. Payload/limite/regex temporal originais preservados; erros/releitura/duplo envio conforme M1/M2/M5. Fixtures anteriores recebem apenas novo poll global explícito. Iniciando unitários/tipos/build e depois navegador, sem commit antes de validar.

FRONT-10.C parcial: 47 unitários e build/typecheck passaram. Chat+smoke primeira rodada: 12 passaram/2 falharam. Evidência visual confirmou badge=1, mas MUI oculta número da árvore acessível; link nomeado só Chat. Extraído ChatMenuItem com aria-label do contador no próprio link (M4), sem alterar contagem nem afrouxar teste. Teste aguarda primeiro GET/retomada do relógio após 5s e marcador via expect.poll. Rodada diagnóstica isolada com UI antiga confirmou que somente sincronização não resolve nome acessível. Agora rebuild/testes; falhas não são sucesso.

FRONT-10.C checkpoint: correção acessível confirmada; chat+smoke 14/14 em 17,0 s, CHAT_EXIT=0 (sessão 78735 encerrada). Primeiro diagnóstico e duas falhas anteriores mantidos nos logs. Acrescentado teste de marcador de outra identidade e troca ativa 6→7 sem reaproveitar histórico/cache. Iniciando regressão completa candidata (102 casos esperados); nenhuma alteração da baseline original/dependências. Logs ignorados front10-*.

## FRONT-10.C — verificada e commit autônomo — 18/10/2026

Checks exit 0: 47 unitários (13 arquivos, 982 ms), build/typecheck final (1151 módulos, Vite 496 ms), format:check, node --check CJS e git diff --check. Chat+smoke corrigidos 14/14 em 17 s; nova cobertura de troca de identidade/assembleia validada na suíte completa 102/102 em 2,1 min, CANDIDATE_EXIT=0, sessão 28026 encerrada. Rodadas anteriores com 2 falhas de nome acessível não foram contadas como sucesso. Capturas desktop/mobile inspecionadas, mensagens/foco e largura corretos. Logs ignorados front10-*. Baseline original 42/42 anterior reaproveitada porque fontes/harness legado não mudaram. Nenhuma dependência nova ou acesso ao backend.

Revisão técnica concluída: nenhuma senha/token nas query keys, cache não persistido, marker contém data segregada, old global não atribuído a outra pessoa, eco/reenvio/late response controlados. HTTP/Socket.IO do produto, CORS/ACL/volume/persistência reais, CI e homologação não executados. Commit autônomo desta unidade conforme mandato, hash pelo histórico. Próxima FRONT-11 — online/logs/notificações; heartbeat já pertence à sessão, manter um ciclo de 30s. D1/D2 permissões/D3/D5/D6 e correção de cursor continuam pendentes. FRONT-03–10 funcionais, admin/referências restantes.

## FRONT-11.A/B — administração em execução — 18/10/2026

FRONT-10 commitada em d6f5f6a, início limpo. Fontes online.jsx/List, logAcesso.jsx/List/Register e notificacao.jsx/List analisadas. Implementados online/getConnectedUsers após 500ms/expulsarId, logs 300/ordem/horários/expulsarTodos e notificações regex/lido/toggle/todos filtrado sequencial com trava/parada/releitura. Heartbeat continua único no SessionController, sem scheduler de página novo. Preservados menu por tipo e deep links sem novo guard; não prometer ACL do servidor. Reset da pesquisa ao alternar apenas não lidos mantém query original e agora limpa input para não exibir filtro inativo (M4). Toggle local mantém linha como original até nova consulta, invalidação marca stale sem refetch automático nesse sucesso. Iniciando Q; testes com ações só em fixture de socket local, sem expulsar usuários reais. Ainda sem commit/integração real.

## Decisões complementares explícitas — 18/10/2026

D1: preservar o fluxo antigo /#/login por compatibilidade, incluindo segunda sessão e contrato GET original; não substituir pelo login principal. D6: aprovado preparar URLs hash, build dist e servidor estático exclusivamente dist, sem publicar. Hospedagem/subpath/browsers e homologação continuam pendentes. Cursor FRONT-08: aprovado usar maior ordem recebida e atualizar registros existentes por _id preservando posições, sem repetir escritas. Estas respostas substituem somente as pendências correspondentes dos registros históricos. Fórmulas/cores/datas e novas permissões continuam sem aprovação.

## FRONT-11.C — regressão verificada — 18/10/2026

Unitários 49/49 (14 arquivos), build/typecheck exit 0 (740 ms), format:check e git diff --check aprovados. Administração inicial 10/10 em 22,9 s (sessão 7181 encerrada, ADMIN_EXIT=0). Regressão completa 112/112 em 2,4 min, CANDIDATE_EXIT=0, sessão 56301 encerrada; logs ignorados front11-*. Capturas desktop/mobile inspecionadas; tabela integral com rolagem interna. Acrescentado cenário Enter + lote somente filtrado; rodada final administrativa na sessão 53214. Sem novos pacotes/alteração do legado/backend/integração real/CI/homologação/deploy. Próximo: correção aprovada de cursor em unidade própria, depois FRONT-12.

FRONT-11.C final: administração 12/12 em 22,2 s, ADMIN_EXIT=0, sessão 53214 encerrada; cenário adicional filtrado passou nos dois viewports. Unidade revisada e pronta para commit autônomo autorizado.

## FRONT-08.D — correção aprovada em execução — 18/10/2026

FRONT-11 commitada 40aadf8; início limpo. Aplicando resposta explícita: cursor máximo do lote recebido, sem regressão; Map por _id atualiza registros existentes na posição anterior e novos precedem lista na ordem recebida. Nenhuma escrita/retry novo. Unitários cobrem lote vazio/atrasado/duplicado e imutabilidade; browser cobrirá ordem__gt 0→1→2→3 e mudança de voto conhecido. Próxima validar e commitar separadamente antes da FRONT-12.

FRONT-08.D verificada: 49 unitários aprovados, build/typecheck final exit 0 (520 ms); falha inicial TS2532 restrita ao acesso do teste registrada e corrigida com acesso opcional, sem relaxar expectativa. Acompanhamento 4/4 em 11,9 s, LIVE_EXIT=0, sessão 27817 encerrada; prova atualização por _id e cursor máximo na próxima consulta sem escrita. Logs cursor-* ignorados. Baseline e regressão completa FRONT-11 reaproveitadas para áreas inalteradas. Format/diff conferidos. Mudança intencional aprovada, não contrato original. API incremental só permite atualizar registro que o servidor devolve; correções remotas sem ordem maior ainda dependem do protocolo existente, não prometer cobertura inexistente. Commit separado; próximo FRONT-12.

## FRONT-12.A/B — referências e compatibilidade em execução — 18/10/2026

Cursor commitado 8dfb661; início limpo. Consumidores originais link/linkList, link-util/list, assembleia/list, classe/list, contato e login/Login conferidos no frontend. Implementados CRUD links (documento inteiro, _id null em criação, campos omitidos versus editados vazios), links úteis, consultas read-only e aliases Contato/contato. Preservar GET login secundário com senha conforme D1, doc completo no storage/evento, sem chamar login principal ou criar regra de senha. M3: storage inválido não quebra tela, marcador local de dono primário impede herdar login secundário de outra pessoa; registro antigo sem dono só restaurado se _id coincide com principal; logout principal limpa secundário, logout secundário não encerra principal. M2: erro de link mantém rascunho e reconsulta sem repetir escrita. Sem confirmação modal/guard novo. Etapa parcial, iniciando testes antes de commit.
