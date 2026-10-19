# FRONT-13 — consolidação do frontend

## Estado

FRONT-13 concluída e validada tecnicamente na raiz; resultados finais registrados no progresso. FRONT-14 permanece adiada por decisão explícita, sem backend, integração real, homologação, push/deploy/produção. Usuário definiu Heroku, raiz do domínio portal.gladiusconsultoria.com.br, hashes /#/votar e somente Google Chrome; o domínio não foi acessado.

Original41478a83b74a8d27c7058a1d79b2ed1deab271c3. FRONT-12 validada em13db3ab; preparação13.A em05cf894; isolamento original em bab3e8b. Consolidação commitada em dbf1874; consultar Git para hash completo.

## Estrutura final e retirada

src/ contém módulos funcionais, public/ somente logo.png/logo_login.png/profile.png originais, scripts/ contém build/runtime e testes HTTP. Vite/React/TypeScript estrito/MUI-Emotion/RHF/Query usam package/lock da raiz; migration-ui foi retirada. dist é saída ignorada e único conteúdo servido.

| Original (evidência no commit fixo) | Substituição ativa | Estado |
| --- | --- | --- |
| src/index.jsx, src/main/reducers.js: Redux/middlewares | auth/Session, TanStack Query e ChatProvider | Sem consumidores Redux no runtime |
| src/common/template/dependencies.js e public/index.html: AdminLTE/jQuery/Bootstrap/plugins/fontes | Layout React/MUI/Emotion, teclado/mobile e tabelas completas | Plugins e assets sem consumidores retirados do runtime |
| Globais socket.io.js e signalR/jquery | socket.io-client2.3.0 com dono de sessão | Namespace/eventos preservados; sem atualizar backend |
| Chart.js/plugin datalabels | SVG declarativo, valores e cores preservados | Sem mudar apuração/limiares D3 |
| Router3/hash e JSX/React15 | navigation/routes, hash/lazy/Suspense, React19/TS | Rotas ocultas/caixa/fallback preservados |
| public/logo.png/logo_login.png/profile.png | public/ mesmos arquivos | Três SHA256 idênticos |
| Webpack/Babel6 e public/app.js/app.css | Vite/build dist | Legado isolado fora do runtime ativo |
| PendingPage transitória sem import | Módulos funcionais em todas rotas | Arquivo retirado para backup |

Comparação byte a byte com a candidata anterior:64 arquivos de módulo/teste/asset idênticos; única alteração em módulo existente foi MinutesPage para evento em leitura pendente, conforme M5 aprovada. Adicionados helper refresh e3 testes de concorrência/cleanup. Não há novo POST, retry de escrita, ACL, fórmula, data ou mudança de regra de ata. Modificações de hosting/build/paths são intencionais de infraestrutura.

## Referência original e backups

migration-tests/original.cjs extrai somente src/public/manifests/webpack/Procfile originais, força LF na extração e confere127 blobs Git; rejeita conteúdo alterado, fonte adicional e links. Fonte/dependências legadas ficam em migration-tests/.original, ignorado e não servido. unit.test.cjs/server.cjs não dependem mais da raiz nova. Instalar original com comando do README, sem upgrade/hooks desnecessários. CI exige histórico Git completo.

Antes da retirada,5 testes de regras/guarda e42 cenários Chrome passaram; falha inicial de sincronização (41/42) foi corrigida aguardando request existente, sem mudar original/expectativas. Resultado da repetição após a troca da raiz no progresso.

Backup absoluto preservado: C:/Desenvolvimento/React/portalVotacaoFront/.migration-verification/front13-before-root-288cf335d1f947699e65304f6b1c19de. Movimento validou paths absolutos dentro do frontend, sem delete recursivo/reset/stash. Contém src/public/manifests/Procfile/webpack/node_modules anteriores e sobras transitórias/logs. Não remover automaticamente.

Snapshot zip original local .migration-verification/frontend-original-41478a8.zip, SHA256237488661df9130ceaa788a5e54b9f7df1ca06461451eee37561180290675463; manifest sanitizado ao lado. É referência versionada, não backup de banco nem confirmação da versão efetivamente publicada. Fonte original permanece recuperável pelo Git, mesmo sem caches locais.

## Validação

| Check | Evidência |
| --- | --- |
| Raiz atual |55 unitários/16 arquivos, format, TS/build e8 HTTP/hook/runtime aprovados |
| Ata após correção M5 |10/10 Chrome desktop/mobile em22,3s |
| Regressão final Chrome |124/124 em3,2min; rodada anterior123/124 registrada como falha |
| Windows cópia final |Fonte corrigida: ci offline/check55/8, hook sintético/prune/runtime exit0, sessão80255 encerrada |
| Linux cópia final |Fonte corrigida: npm ci/check55/8, heroku-postbuild sintético, prune sem vite/vitest e runtime exit0, sessão28597 encerrada |
| Original após troca da raiz |5 testes de regras/guarda e42/42 Chrome em1,4min, exit0 após raiz, sessão90571 encerrada |
| Checkout Windows |72 arquivos do índice exportados com core.autocrlf=true, idênticos à árvore e sem CRLF; .gitattributes fixa LF e protege binários |
| Paridade de artefato sintético |41 arquivos Windows/Linux idênticos por SHA256; manifest213cb7d1d361e198742b4129b1df3198d5ae5274e58d261141126f1f3318d058, sem release autorizado |
| CI |Workflow Windows/Linux/Chrome preparado, actions oficiais v6 por SHA, contents:read, sem deploy; nenhum run remoto observado |

Chrome real155.0.8059.80 em Windows, desktop e viewport móvel. Linux em filesystem case-sensitive provado por CaseProbe/caseprobe, Node24.21.0 temporário oficial, SHAfd8e59d5a511510f6a298afb548f18c7d2b1be404d8b4a27d94fbe49f56cb2d6. Não há instalação global de runtime/Docker. Testes de negócio usam JSON em memória e fixture Socket.IO2 loopback, não API do produto.

## Heroku preparado, não publicado

Node24.21.0 em engines/.nvmrc. Procfile web: npm start; start executa servidor Node nativo exclusivo de dist. PORT controla porta, bind0.0.0.0 com PORT, loopback18184 sem PORT; HOST explícito para ensaio. Não há fallback de API/fonte/raiz nem rewrite sem hash. index revalida, chunks com hash são imutáveis; retenção de chunks/troca atômica serão definidas no ensaio operacional futuro.

heroku-postbuild reutiliza readConfig/loadEnv para validar VITE_API_BASE_URL/VITE_OAPI_BASE_URL/VITE_SOCKET_URL antes do build. Nenhum endpoint real predefinido, senha/token em VITE ou .env real nos snapshots. Ciclo de instalação/build/prune/runtime foi ensaiado com endpoints sintéticos; servidor não importa Vite no runtime. A preparação segue [Node clássico Heroku](https://devcenter.heroku.com/articles/nodejs-classic-buildpack-builds); stack/buildpack/config vars efetivos ainda não foram consultados na aplicação real.

## Próximo limite de autorização

Checks finais aprovados e consolidação commitada; FRONT-13 encerrada tecnicamente. FRONT-14 continua adiada: backend/API/banco/CORS/ACL/volume/histórico/protocolo real, browsers/dispositivos em homologação, artefato efetivamente publicado, backup/restauração/reversão operacionais e aceite humano permanecem não executados. Não substituir por mocks/CI/build nem vincular a mudanças da migração backend. Não há pergunta material restante para a consolidação; integração/produção exigem novo escopo explícito.
