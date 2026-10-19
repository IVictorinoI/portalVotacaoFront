# Retomada — frontend

Escopo exclusivo C:/Desenvolvimento/React/portalVotacaoFront, branch migracao-arquitetura-front. Não acessar backend/domínio/Heroku produtivos. Ler AGENTS/plano/progresso/contratos/consolidação e Git antes de agir; preservar alterações parciais/alheias, sem reset/stash/clean.

## Trabalho autorizado encerrado tecnicamente

Usuário autorizou concluir FRONT-13 e commits locais autônomos, definindo Heroku, raiz do domínio, hash /#/votar e somente Chrome. FRONT-13 foi consolidada e validada localmente. FRONT-14 continua explicitamente adiada; não iniciar backend/API real/banco/produção, push/deploy/config vars/DNS/homologação por este mandato. D2/D3 preservados, sem novos guards/correções de fórmulas/cores/datas. M1–M5/cursor e login secundário conforme decisões em AGENTS/progresso.

FRONT-12 em13db3ab, preparação13.A em05cf894, referência original isolada em bab3e8b. Consolidação commitada em dbf1874; conferir git log para hash completo. Raiz ativa src/public/scripts/tests/configs; migration-ui/legado retirados do runtime. Comandos npm.cmd ci, npm.cmd run check e npm.cmd run test:browser, sem dependência de outra migração.

## Evidências finais

55 unitários/16 arquivos, TypeScript/build/format e8 HTTP/hook/runtime aprovados. Regra de evento de ata durante GET corrigida conforme M5,3 testes novos, sem alterar POST/fórmula/ata. Focado10/10; regressão Chrome124/124 em3,2min; original independente5 testes e42/42 em1,4min depois da troca da raiz. Rodadas41/42 e123/124 com falha foram registradas e corrigidas sem relaxar expectativas/retries/timeouts.

Instalações limpas com fonte final Windows e Linux: ci/check55/8/heroku-postbuild sintético/prune sem vite-vistest/entrada produtiva passaram. Linux case-sensitive e Node24.21.0 temporário verificado. Sessões90571/80255/28597 e anteriores encerradas. Chrome155.0.8059.80 Windows desktop/viewport mobile; não é dispositivo físico nem API do produto. CI preparada, sem execução remota/deploy. Checkout do índice isolado com core.autocrlf=true conferiu72 arquivos idênticos e LF; .gitattributes protege binários.

## Preservação e processos

Original41478a83b74a8d27c7058a1d79b2ed1deab271c3,127 blobs verificados em migration-tests/.original; dependências legadas isoladas/ignoradas. Backup .migration-verification/front13-before-root-288cf335d1f947699e65304f6b1c19de preserva raiz anterior e sobras transitórias, sem deleção recursiva. Snapshot original e manifestos locais ignorados; não são backup do banco ou prova da versão produtiva atual.

Logs front13-* na raiz e migration-tests; cópias Windows em .migration-verification, Linux /tmp pode desaparecer entre sessões WSL. Scripts/evidências persistentes estão no frontend; não depender da existência de /tmp para retomar. Não repetir processos após timeout sem conferir estado.

Conferência adicional concluída:41 arquivos dist sintéticos Windows/Linux idênticos, zero divergências; SHA256 do manifesto213cb7d1d361e198742b4129b1df3198d5ae5274e58d261141126f1f3318d058. Sessão62430 encerrada exit0. Manifestos persistem em .migration-verification/front13-artifact-*.json e logs front13-artifact-linux-*. Primeira tentativa encontrou /tmp indisponível; somente build Linux foi refeito para persistir hash antes de sair, sem repetir checks de fonte inalterada. Esses artefatos não são release autorizado.

## Próximo passo

Trabalho autorizado de FRONT-13 encerrado e evidências salvas. Parar: FRONT-14 exige nova definição de ambiente/escopo e autorização; permanece adiada. Não publicar ou alterar backend por consequência de FRONT-13. Não há pergunta impeditiva restante para a consolidação.


## Atualização: adaptação Nest autorizada pelo usuário

Consultar10-adaptacao-api-nest.md e último checkpoint do04-progresso.md antes das orientações históricas acima. API localhost:3000 foi configurada para teste manual do usuário, frontend Vite em127.0.0.1:8080 PID18220 (conferir processo antes de repetir). Sem autorização para ler backend/banco ou executar escritas automáticas. Adaptação atual altera intencionalmente Bearer, Socket4/auth, autoria de chat/eventos, horários com fuso, erros e visibilidade de comandos administrativos. Referência original isolada permanece intacta. HEAD inicial6225673; alterações de login anteriores preservadas. Check61+8 passou; regressão Chrome em andamento, sessão2954; conferir resultado final no progresso. Nenhum commit desta adaptação foi feito.

Resultado final desta adaptação:check62 unitários+8 static/runtime, TS/build/format aprovados; Chrome132/132 em3,1min na fonte final, BROWSER_EXIT=0, sessão8514 encerrada. Casos novos401/403/admin sem vínculo/controles aprovados desktop/mobile. Sem acesso backend/API real pelos agentes; Vite8080 PID18220 responde200 e permanece disponível ao teste manual. Arquivos alterados ainda sem commit; conferir Git e10-adaptacao-api-nest.md ao retomar. Fonte original/fixtures originais/06-contratos-originais.md sem alterações.
