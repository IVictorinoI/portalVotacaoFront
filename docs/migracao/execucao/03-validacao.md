# Validação da migração do frontend

12/10/2026 — ROTEIRO PROPOSTO, não executado nesta etapa. Fontes: [plano](00-plano.md), [matriz](02-matriz-de-modulos.md), [contratos](06-contratos-originais.md). Estado original em 12/10: nenhum script de teste. Atualização FRONT-01 em 18/10: runner isolado existente em migration-tests; scripts da raiz continuam apenas dev/production. Ver comandos efetivos abaixo.

## Comandos atuais e pré-requisitos

Raiz autorizada: `C:/Desenvolvimento/React/portalVotacaoFront`. Git/Node/npm e dependências já instaladas. Node v24.21.0 e npm.cmd 11.19.0 observados no diagnóstico, não engines já homologadas para a candidata. Usar npm.cmd no PowerShell sem alterar ExecutionPolicy. Não instalar/atualizar lockfiles durante planejamento.

```powershell
git status --short
git branch --show-current
git rev-parse HEAD
git diff -- src public package.json package-lock.json webpack.config.js Procfile
node --version
npm.cmd --version
```

Somente scripts atuais: `npm.cmd run dev` (watcher, não check finito) e `npm.cmd run production` (Webpack finito, sobrescreve public por padrão). Para L usar saída exclusiva temporária:

```powershell
$buildLegado = Join-Path $env:TEMP ('portal-votacao-legado-' + [guid]::NewGuid().ToString('N'))
npm.cmd run production -- --output-path $buildLegado
```

Não executar o bundle production para testar contra host real: ele contém URL Heroku. Testes de navegador baseline devem interceptar HTTP e socket e falhar em qualquer tráfego não simulado; integração real precisa de cópia configurada explicitamente para teste. Build sozinho não chama API. Resultado histórico: exit 0, hash adda313c43a66ad871e2, avisos UglifyJs; não repetido no planejamento.

## Comandos futuros — ainda NÃO existentes

FRONT-01 criará `migration-tests/` com harness Playwright/configuração, scripts `test:baseline` e `test:e2e`; FRONT-02 criará scripts em `migration-ui/`. Instalar somente após etapa autorizada e versões compatíveis escolhidas. Uma instalação limpa futura ocorre em cópia/candidata isolada, nunca substitui node_modules do legado por conveniência.

| Local / etapa | Comando futuro | Definição proposta / pré-requisito |
| --- | --- | --- |
| migration-tests, FRONT-01 | npm.cmd ci | Lockfile próprio já criado e revisado; rede/instalação autorizada na etapa |
| migration-tests, FRONT-01 | npm.cmd exec -- playwright install chromium | Pacote Playwright já fixado; não usar npx para baixar versão arbitrária |
| migration-tests | npm.cmd run test:baseline | Playwright baseline isolado, fixtures HTTP/socket; servidor legado de teste acompanhado e rede externa bloqueada |
| migration-ui, FRONT-02 | npm.cmd run typecheck | tsc --noEmit, strict/noUncheckedIndexedAccess; zero suppressions sem justificativa |
| migration-ui | npm.cmd run format:check | prettier --check nos arquivos configurados, sem reformatar legado fora de escopo |
| migration-ui | npm.cmd run test:unit | vitest run, execução finita; runner é proposta a escolher/fixar |
| migration-ui | npm.cmd run build | Typecheck + vite build; saída migration-ui/dist |
| migration-tests | npm.cmd run test:e2e | Playwright candidata build atualizado, API e socket simulados, desktop/mobile |
| migration-tests, FRONT-14 | npm.cmd run test:integration | Projeto Playwright separado sem interceptar endpoints; ambiente real exclusivo e guardas de configuração |
| raiz consolidada, FRONT-13 | npm.cmd ci; depois os scripts finitos acima | Executar separadamente em cópia limpa; revisar scripts e atualizar caminho exato antes da execução |

Os nomes acima são especificação a implementar, não afirmação de que existem. FRONT-13 registra o mapeamento definitivo após consolidação; não executar comandos ausentes. Q = typecheck + format:check + build + test:unit relevantes + test:e2e dos fluxos prontos. CI proposta executa os mesmos comandos finitos em ambiente com filesystem sensível à caixa; não adiciona deploy automático. CI real só conta com URL/status do run observado. Logs/traces devem ser ignorados e conter apenas dados sintéticos, sem token/senha; integração real não grava bodies de login/storage.

Servidores necessários ao harness são infraestrutura acompanhada, não checks que passam por timeout. Registrar porta/PID/sessão/log, readiness e encerramento do processo criado. Não matar processos desconhecidos ou repetir escrita após sessão perdida. Em interrupção, inspecionar processo/efeitos e salvar checkpoint.

## Camadas de evidência

1. Unitários: lógica pura de payload, escopo/transições, seleção/lote, joins/cursor/formatadores e contagens. Assert de regra/resultado, não detalhes internos.
2. Navegador com API simulada: DOM, navegação, foco, responsividade, estado/cache, requests/status/erros simulados e socket controlado. Não valida CORS, MongoDB ou autorização real.
3. Integração real: browser → HTTP/Socket.IO originais → MongoDB de teste; sem mocks dos endpoints sob teste. Conferir persistência/efeitos e escopo, não só toast.
4. Homologação manual: perfis/volumes/browser acordados, dados históricos anonimizados, ensaio release/reversão. Um teste ignorado não equivale a sucesso.

Baseline que reproduz bug deve registrar falha existente e caso específico; correção futura tem expectativa aprovada separada. Não transformar requisito em sucesso artificial com skip, snapshots novos indiscriminados ou testes de mock que já assumem a correção.

## Pré-requisitos da integração real (D5)

Cópia isolada do backend ORIGINAL `d1bd37e031d8b699a8dd5a33e039b4ef8a861c8a`, sem checkout/reset no diretório em migração; sem dependência de Nest ou etapas de backend. Provisionamento fora do frontend precisa de escopo de teste autorizado: nenhum arquivo do backend será alterado por este plano. Segredo sintético local fora do Git; não copiar .env original. MONGODB_URI explícita para banco exclusivo aleatório identificado como teste e PORT separado. Original aceita essas variáveis, mas possui fallback local: não iniciar sem verificar URI real e identidade do banco. TEST_MONGODB_URI não é variável implementada pelo backend legado e não deve ser presumida.

Após provisionamento validado, entrypoint original conhecido: `node src/loader.js`, executado na cópia e com ambiente de teste, nunca no checkout em alteração. Instalação original e seed devem ser documentados com comandos reais no ensaio; não há seed/restauração/test script original comprovado a inventar. Validar cada comando antes de executar, limitar limpeza ao banco comprovadamente exclusivo e não usar comandos globais. Sem esses pré-requisitos, R fica NÃO EXECUTADO e FRONT-14 impedida.

Fixtures: admin tipo=1; credor próprio; procurador com vários representados; usuário sem vínculo; duas assembleias (uma ativa), classes 1–4, presença pendente/confirmada, S/N/A e vazio, ata secretário/recuperanda, zero/null/omitido, datas sentinelas e offsets, limites 299/300/301 mensagens/logs, nomes longos/acentos e volume acordado D5. Não criar usuários/assembleias por endpoints administrativos no ambiente desconhecido. Snapshot sintético antes de cada ensaio; original/candidata escrevem em bancos distintos com fixtures equivalentes quando comparação exigir reset.

## Cenários técnicos e roteiro manual

| ID / etapas | Execução e resultado esperado |
| --- | --- |
| V01 / 01–03 | Capturar requests login/validateToken e header token direto; erros 400/403 conforme original, rede sem response; sem expor signup. Restaurar/sair/outro usuário e bloquear respostas da identidade anterior |
| V02 / 03,13 | Abrir cada rota do catálogo abaixo com sessão/restauração; refresh, voltar/avançar, desconhecida → raiz; comparar menu e caixa Contato/contato; nenhuma página omitida |
| V03 / 03,11 | Admin/comum/próprio/procurador/sem vínculo via menu e deep link; validar matriz aprovada, registrar acesso permitido no servidor original sem alegar proteção por menu |
| V04 / 03–05,10 | Trocar identidade e assembleia com GET retardado, sem ativo/storage inválido/duas abas; query keys sem token e cache limpo. Precedência D2 com exemplo aprovado, nunca atualização tardia em outro escopo |
| V05 / 04 | Filtrar subconjunto de credores; confirmar individual e todos; conferir ne=true, procuração, ordem, janela 5s, voto vazio criado/credor/notificação/evento. Erro no item 2 interrompe e preserva item 1 confirmado |
| V06 / 05 | Votar S/N/A em distintos pendentes e todos filtrado; PUT exato, evento pós-sucesso, janela/representação; duas abas e resposta perdida. Sem retry de escrita ou duplicação introduzida pela UI; limites remotos explícitos |
| V07 / 06–08 | Comparar BRL, percentuais 4–6 casas, zeros/classe '.', joins por codigo, ordenação distinta das classes, filtros regex com acentos/&/barra; medir limites implícitos sem truncar lista no cliente |
| V08 / 08 | Poll 3s/ordem__gt, respostas fora de ordem/duplicadas, _id já existente alterado, troca de rota/reconexão; cursor conforme política aprovada. Resultado V/demais, classes 1/4 e 2/3, pergunta/subtotal/total sem recálculo de apuração |
| V09 / 09 | Assinar POST sem corpo; conferir representantes, secretário/recuperanda, eventos e podeAta; Me/Epp/cores conforme D3. Falha ambígua não dispara novamente e UI não promete rollback |
| V10 / 10 | Dois contexts enviam/recebem chat com Enter e clique; eco duplicado, desconexão/reconexão, 300 itens, lastRead/badge e foco/rolagem. Privado continua inativo, rascunho/política de leitura conforme M2/M3 |
| V11 / 11 | Logs e heartbeat 30s sem acumular ao navegar, ack separado de gravação; expulsar id/todos só sintéticos; lido/regex/todos filtrado e falha no meio |
| V12 / 12 | Criar links _id=null, editar objeto/payload original, excluir e abrir nova aba; campos vazios/omitidos, erro; assembleias/classes/login legado/contato sem remover rotas ocultas |
| V13 / todas | Tab/Shift+Tab/Enter/Escape, foco visível e nomes acessíveis, menu sem mouse; viewport desktop 1366x768/mobile 390x844 provisórios, zoom 200%, tabelas/colunas/botões/scroll/footer; matriz final depende D6 |
| V14 / 02,13 | Logos/fontes/chunks/assets sem 404, imports case Linux, base de subcaminho e hash, erro de chunk; sem upload/PDF/exportação inventado; servidor só expõe dist, não fontes/lock/.env |
| V15 / todas | Duplo clique/Enter concorrente/lote repetido, HTTP 500/403/rede/timeout, erro depois de servidor gravar, unmount/escopo alterado; M1 evita repetição local, não garante idempotência remota |
| V16 / 13–14 | Instalação limpa/build/CI e equivalência fonte/artefato; ensaio de backup/restauração/reversão, browser antigo aberto com chunk anterior, dados gravados pela candidata legíveis pelo original |

Catálogo de rotas: /#/, /#/assembleias, /#/classes, /#/credores, /#/votos, /#/confirmarPresenca, /#/votar, /#/login, /#/votacaoTempoReal, /#/chat, /#/online, /#/logacesso, /#/notificacoes, /#/resultado, /#/aprovaAta, /#/Contato, /#/links, /#/links-uteis; investigar variante /#/contato do menu sem impor resultado presumido.

Roteiro integrado final: iniciar fixtures exclusivas → login procurador → filtrar/confirmar → admin observa credores/quórum → votar S/N/A e lote parcial → observar tempo real/resultado → assinar ata → trocar mensagens/ler badge → ações administrativas e links → logout/outro perfil → reabrir todas as rotas em mobile/teclado → ensaio de reversão e reconciliação. Repetir com dados históricos anonimizados e volume D5, usando snapshot de teste separado.

## Evidência e gates

Registrar por execução: etapa/subetapa, fonte/artefato/hash/config pública sem segredos, comando/cwd/runtime/porta, casos e resultados, simulated/real, fixture/banco exclusivo identificado sem credenciais, logs ignorados, discrepâncias e decisões. Guardar falhas conhecidas; não considerar build equivalente a homologação. FRONT-04 exige padrão piloto revisado; FRONT-13 cobertura sem placeholder; FRONT-14 Q+R+manual+rollback e decisões impeditivas resolvidas. Sem D5/D6, documentar bloqueio e não liberar entrega final.


## Comandos efetivos FRONT-01 — 18/10/2026

O roteiro futuro acima é histórico; concretizados somente runner isolado e testes do legado. Da raiz do frontend:

```powershell
npm.cmd --prefix migration-tests ci
npm.cmd exec --prefix migration-tests -- playwright install chromium
npm.cmd --prefix migration-tests run test:unit
npm.cmd --prefix migration-tests run test:baseline
```

Instalação inicial realizada com npm.cmd install --prefix migration-tests --no-audit --no-fund, gerando lock próprio. Node v24.21.0/Playwright 1.64.1 fixado (engine >=20). Build L executado pelo server.cjs com Webpack/config original + Uglify production, output separado .baseline, SHA-256/commit no manifesto ignorado; public não alterado. Não é rebuild de public/app.js nem prova do artefato publicado.

42 casos browser simulados previstos: 21 cenários x desktop/mobile; 4 dos cenários são diagnósticos explícitos, não requisitos da candidata. Mais 2 unitários do código original puro. Resultado final e exit codes no checkpoint do progresso, não presumir sucesso deste roteiro. test:e2e candidata, typecheck/Vite/formato e test:integration não foram criados, pois pertencem às etapas posteriores.

Rede: todos HTTPs do host de API recebem fixture em memória; desconhecidos abortam/falham; CSS Google Fonts é respondido vazio localmente, socket.io.js local entrega double sem conexão e WebSocket real é recusado. Não acessa servidor original/produção. O baseline integrado testa requests/navegação/projeção de resultado fixture, não cálculo de apuração ou persistência. Detalhes, falhas diagnósticas, comandos e revisão acompanhada: [README do harness](../../../migration-tests/README.md).

## Comandos efetivos FRONT-02 — 18/10/2026

Candidata isolada migration-ui criada. Scripts efetivos da raiz do frontend:

```powershell
npm.cmd --prefix migration-ui ci
npm.cmd --prefix migration-ui run typecheck
npm.cmd --prefix migration-ui run format:check
npm.cmd --prefix migration-ui run test:unit
npm.cmd --prefix migration-ui run build
npm.cmd --prefix migration-tests run test:candidate
npm.cmd --prefix migration-tests run test:baseline
```

Instalação inicial realizada com install --no-audit --no-fund; lock próprio gerado. npm ls --depth=0 validou conjunto instalado, após prune remover somente yaml extraneous da instalação candidata. npm ci é comando para instalação limpa futura a partir do lock, não execução de instalação limpa de release comprovada nesta etapa. Sem script lint, test:integration ou CI criados.

Build padrão sem variáveis públicas deve abrir erro de configuração e não fallback remoto. Para revisão configurada, copiar migration-ui/.env.example para .env.local somente nesse diretório e executar dev (watcher) ou recompilar e preview. Nenhum endpoint dessa configuração é chamado no bootstrap atual. Typecheck inclui testes/config, strict/noUncheckedIndexedAccess/exactOptionalPropertyTypes. Testes cobrem URLs/barras, token atual/direto, null/omitido, errors[]/rede/403 sem retry, cache separado e EIO3 com servidor sintético local; não validam políticas de sessão futuras.

Smoke via candidate.config.cjs é separado de specs/legado: 18182/18183, builds com env sintético/ausente, interceptação de chamadas de negócio/WS, recursos locais/imagem e aviso em /#/votar. Screenshots ignorados inspecionados visualmente; não é homologação funcional de votação ou acessibilidade completa. Candidato e legado não compartilham DOM, node_modules ou saída de build. Documentação: [candidata](../../../migration-ui/README.md).

## FRONT-03 — sessão e navegação candidata

Mesmos comandos reais da FRONT-02, sem dependências novas. Unitários em migration-ui/tests/session.test.ts cobrem fronteiras de validação, precedência API, storage/token inválidos, ausência de ativo, respostas tardias, limpeza por identidade/escopo, cache/listeners/heartbeat, expulsões e menus/rotas. Testes não confirmam ACL, CORS ou persistência do produto.

Navegador: npm.cmd --prefix migration-tests run test:candidate. Runner inicia builds em 18182/18183 e fixture Socket.IO 2 exclusivamente 127.0.0.1:19300 no processo valid. Portas devem estar livres; não matar processo desconhecido. migration-tests/candidate/session.spec.cjs intercepta HTTP de login/validateToken/assembleias/logs; só handshake socket vai ao servidor sintético local. /__fixture é controle de teste do runner, ausente no bundle/app. Não copiar esse servidor para deploy. Casos desktop/mobile: Enter/payload/token, refresh/deep link, menu por tipo sem guard novo, voltar/avançar/fallback/rotas ocultas/Contato, logout, storage inválido/token inválido/falta de ativo/errors[], derrubar, falha de rede com reload original, troca de usuário por outra aba. Smokes sem sessão continuam exigindo zero chamadas de negócio.

Manual acompanhado: observar o mesmo fluxo sintético com npm.cmd --prefix migration-tests run test:candidate -- --project=desktop --headed; para mobile usar --project=mobile. Runner encerra servidores ao final. Conferir login, atualização de /#/votar, sidebar/mobile, histórico, sair e entrada de outra identidade, assembleia API=6 acima do usuário=5/storage=88. Não usar credenciais reais. Execução com --headed é roteiro, não foi realizada. Integração real original indisponível/não autorizada neste chat; D5 continua pendente. Nenhuma garantia de cancelamento de escrita em voo.

## FRONT-04 — piloto de presença

Comandos reais inalterados: migration-ui run test:unit/build/format:check; migration-tests run test:candidate (ou -- presence.spec.cjs) e test:baseline. presence.spec.cjs cobre colunas/BRL/Enter, filtros por perfil, individual e evento pós-sucesso, lista filtrada, duplo clique, erro no segundo item, resposta perdida já gravada, janela/erro de leitura e logout durante lote. Poll da janela verificado por relógio do browser e ausência de novos GETs depois de sair. Testes usam fixtures e HTTP interceptado; não persistência/ACL do produto. Unitários BatchRunner exercitam trava síncrona, sequência/parada e descarte após sessão alterada. Portas 18181/18182/18183/19300 precisam estar livres; runner encerra seus próprios processos.

Revisão manual opcional: npm.cmd --prefix migration-tests run test:candidate -- presence.spec.cjs --project=desktop --headed; repetir mobile. Tabela mantém colunas com rolagem horizontal focável no mobile. A falha de escrita interrompe cadeia e reconsulta; UI exige nova intenção do usuário, não promete rollback/idempotência. Resultados e capturas no progresso.

## FRONT-05 — votação

Mesmos scripts existentes. voting.spec.cjs: S/N/A individuais e evento pós-sucesso, pendentes/erro no lote/clique duplicado, Enter/todos filtrado/admin, resposta perdida sem repetir, presença→voto e janela/cleanup. Todos desktop/mobile. Unitários voting.test.ts: URLs/filtros, pendentes/ordem e payload PUT {_id,tipo}. Capturas ignoradas da tabela e ações inspecionadas, com rolagem horizontal no mobile. Roteiro opcional: npm.cmd --prefix migration-tests run test:candidate -- voting.spec.cjs --project=desktop --headed. Sem backend real.

## FRONT-06 — dashboard

Dashboard testado por projeções numéricas/limiares/zeros/horários e dashboard.spec.cjs em desktop/mobile: 4 classes, BRL/seis casas, distinção card versus gráfico, dois gráficos, metadados, polling 10s/cleanup e erro/releitura/vazio. Assert de largura impede overflow da página mobile; SVG possui rolagem própria e títulos/tooltip nativos. Roteiro opcional: npm.cmd --prefix migration-tests run test:candidate -- dashboard.spec.cjs --project=desktop --headed. Não recalcula apuração: projeta quorum2/votos2 remotos. Sem API real.

## FRONT-07 — consultas

consultations.spec.cjs em desktop/mobile: quatro grupos/joins/totais/indicador socket, regex pareadas e vazio, votos apenas computados/4–6 casas/horário/sentinela, fluxo presença→voto→consulta. Assert de largura mantém rolagem somente na tabela. Unitários: grupos/ordenação Me-Epp, codigo estrito, voto vazio confirma e online/procurador, precisão/data. Roteiro opcional: npm.cmd --prefix migration-tests run test:candidate -- consultations.spec.cjs --project=desktop --headed. Fixture não comprova permissões/persistência/online do servidor original.

## FRONT-08 — acompanhamento/resultados

live.spec.cjs testa novos registros/ordem__gt/sort, não duplicar _id conhecido, poll 3s/cleanup e sessão. results.spec.cjs testa classes/colunas/modo V, precisão, pergunta, subtotal/total remoto e erro/vazio; desktop/mobile. Unitários: projeções classes 1/4 versus 2/3, defaults/precisão, merge de feed e caracterização explícita do cursor original pendente. Não contar teste de caracterização do cursor como aprovação da sua correção ou garantia de atualização por _id. Roteiro opcional: npm.cmd --prefix migration-tests run test:candidate -- results.spec.cjs live.spec.cjs --project=desktop --headed. Sem API real.

## FRONT-09 — ata

minutes.spec.cjs: POST sem corpo/token/evento após HTTP/clique duplicado; classes/roles/Me-Epp/presença; eventos e saída de rota; resposta perdida/reconsulta sem POST extra; janela e fluxo integrado de quatro páginas. Unitários caracterizam contagem/cores D3. Nomes acessíveis estão nas tabelas, não apenas no contêiner. Relógio é instalado antes de montar timers. Roteiro opcional: npm.cmd --prefix migration-tests run test:candidate -- minutes.spec.cjs --project=desktop --headed. Runner global 360s para suíte crescente, mantendo 15s por teste/workers1/retries0; não há aumento de tolerância das asserções. Nenhum teste remoto.
