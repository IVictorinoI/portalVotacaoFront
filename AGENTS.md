# Instruções para agentes — portalVotacaoFront

## Escopo e leitura inicial

Trabalhar somente em C:/Desenvolvimento/React/portalVotacaoFront. Não acessar/alterar backend, seu banco, arquivos, documentos, branch ou dependências; FRONT-14 foi explicitamente adiada. IDE/cwd em outro projeto não ampliam escopo. Instruções explícitas do usuário prevalecem.

Ler [instruções](docs/migracao/instrucoes.md), [plano](docs/migracao/execucao/00-plano.md), [progresso](docs/migracao/execucao/04-progresso.md), [contratos originais](docs/migracao/execucao/06-contratos-originais.md) e [consolidação](docs/migracao/execucao/08-consolidacao.md). Consultar [matriz](docs/migracao/execucao/02-matriz-de-modulos.md), [validação](docs/migracao/execucao/03-validacao.md), [publicação/reversão](docs/migracao/execucao/05-publicacao-e-reversao.md) e [README](README.md) conforme o trabalho. Documentos históricos não substituem último checkpoint/Git.

## Estado e autorização

Original frontend 41478a83b74a8d27c7058a1d79b2ed1deab271c3; branch migracao-arquitetura-front, já existente. FRONT-01–12 funcionais; FRONT-13 consolidada e validada localmente com React/TS/Vite na raiz. src/public/scripts/tests e package.json raiz são a aplicação atual; migration-ui foi retirada. Referência original em migration-tests/.original é ignorada, verificada por blob Git e usada somente pelo harness legado. Não remover/normalizar guarda ou editar referência para fazer teste passar.

Usuário autorizou avanço autônomo, checkpoints Markdown e commits locais sucessivos, reiterado após decisões Heroku/raiz do domínio/somente Chrome. Esse mandato substitui paradas por ID anteriores para FRONT-13, não autoriza decisões funcionais pendentes, FRONT-14, acesso a backend, push/deploy/produção, Heroku/DNS/config vars reais ou mensagens a terceiros. Commitar somente unidades revisadas e verificadas; registrar limitações sem declarar homologação. Não usar tempo decorrido como aprovação.

## Compatibilidade e decisões

Preservar métodos/URLs/barras/params/headers/payloads/status/errors[], token direto em authorization, hashes/deep links/caixa/rotas ocultas/fallback, menus/filtros por tipo, campos/precisão/BRL, quatro classes/S-N-A, datas/sentinelas/recortes históricos, limites 300 e efeitos/eventos. Menus não são ACL. D2 permissões e D3 fórmulas/Me-Epp/cores/datas continuam preservadas; não criar novos guards/corrigir regras sem decisão. Backend migrado em paralelo nunca fundamenta contratos originais. Falha original é risco caracterizado, não crash/vazamento obrigatório nem autorização de mudança silenciosa.

Aprovados: assembleia ativa da API prevalece; recuperar storage inválido, cancelar leituras/descartar respostas antigas e limpar cache/socket por identidade/assembleia. M1/D4: trava síncrona individual/lote, todos apenas filtrados, sequência/parada no primeiro erro; consultar após incerteza sem repetir escrita. M2/M4/M5: erros/retry manual de leitura, rascunhos após falha, teclado/mobile sem remover recursos, cleanup e invalidação após sucesso. M3: leitura de chat por usuário/assembleia sem herdar marcador global. Cursor: maior ordem recebida, atualizar _id conhecido preservando posição. D1: manter login secundário GET com senha e documento/setUser originais, sem remover por estar oculto. D6: Heroku, raiz do domínio portal.gladiusconsultoria.com.br, hash e Chrome. Confirmação do domínio não autoriza visitá-lo ou fazer smoke em produção.

## Arquitetura e checks reais

React/TypeScript estrito/Vite/MUI-Emotion/RHF/Query. Módulos por funcionalidade; controllers de sessão/cache/http/socket compartilhados. RHF para formulário, Query remoto, contexto para estado compartilhado legítimo; sem Redux/jQuery/AdminLTE no runtime final. Não impor dialogs, tabelas reduzidas, endpoints ou paginação inexistente. Não usar any/suppressions para esconder erro; validar fronteiras em runtime. Cache em memória e keys por identidade/assembleia/filtros/geração, sem senha/token. Cleanup de timers/listeners/charts e descarte de resposta tardia são obrigatórios. Abortar HTTP não desfaz escrita; mutations não têm retry automático.

Node24.21.0 em .nvmrc/engines; consultar manifesto antes de comandos. PowerShell usa npm.cmd sem alterar ExecutionPolicy. npm ci; npm run check (format/unit/typecheck-build/static-runtime) e npm run test:browser (Chrome/fixtures) são finitos. npm run dev/preview/start são servidores, não checks finitos. npm run production agora é build Vite finito; não usar comandos Webpack históricos na raiz. Procfile usa npm start e serve só dist. heroku-postbuild exige VITE público válido; não usar fallback de produção. Servidor usa PORT e bind0.0.0.0 para Heroku, loopback sem PORT; ensaio sempre HOST127.0.0.1.

Baseline: npm --prefix migration-tests ci; npm --prefix migration-tests run prepare:original; npm --prefix migration-tests/.original ci --ignore-scripts --no-audit --no-fund; npm --prefix migration-tests run test:unit/test:baseline conforme README. Exige histórico Git original e Chrome. Portas exclusivas loopback 18181/18182/18183/19300; não reutilizar serviço desconhecido. Fixtures não conectam API do produto. CI é finita, sem deploy; arquivo preparado não prova execução remota. Mocks/socket de teste não comprovam banco/persistência/CORS/ACL/volume/protocolo do produto. Não enfraquecer expectativas ou declarar skip aprovado.

## Dados, arquivos e continuidade

Sem credenciais/dados pessoais/URLs de escrita reais em fixtures/logs. Não ler/copiar .env real para testes. .env.example é sintético; VITE é público no bundle, nunca senha/token. Integração futura exige autorização e serviço/dados exclusivos identificados de teste; não iniciar fallback localhost/produção. Não transformar dados ou executar restauração de banco.

Antes de editar: Git branch/HEAD/status/diff, preservar alterações alheias/parciais; sem reset/stash/clean/troca de branch automática. Antes de move recursivo, conferir paths absolutos dentro do frontend; não matar processos desconhecidos. Depois de timeout/sessão perdida conferir processos/efeitos antes de repetir. Manter logs longos em arquivos ignorados sem segredos, com sessão/processo/log no progresso.

Atualizar progresso após subetapas e antes de operações longas: referência, preexistentes, etapa, arquivos, estado parcial, comandos/resultados, não executados, próxima ação/decisões. Diferenciar implementado, validado simulado, validado real, homologado e commitado. Identificar commits pelo histórico, sem commits recursivos só para registrar próprio hash. Selecionar arquivos explicitamente no commit; sem git add indiscriminado. Backup da raiz anterior/snapshots/cópias limpas em .migration-verification ignorada; não apagar automaticamente. Referências antigas migration-ui e src JSX em diagnósticos são históricas. Entrega final/reversão/aceite real continuam FRONT-14, adiada.
