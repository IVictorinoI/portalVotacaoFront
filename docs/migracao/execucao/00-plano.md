# Plano da migração do frontend

12/10/2026 — PLANO APROVADO PARA PREPARAÇÃO, mantendo D1–D6 e M1–M5 pendentes. Aprovação explícita do usuário: resposta “sim” à pergunta sobre executar somente preparação com decisões pendentes. Nenhuma implementação, alteração funcional, instalação, commit ou publicação autorizada nesta preparação.

## Escopo e evidência

Somente `C:/Desenvolvimento/React/portalVotacaoFront`, branch `migracao-arquitetura-front`, HEAD `e326a9c9b33cfc5e19553209a737d4c7285c8527`. Original frontend: `41478a83b74a8d27c7058a1d79b2ed1deab271c3`. Backend original de referência: `d1bd37e031d8b699a8dd5a33e039b4ef8a861c8a`. Não alterar o backend nem depender de etapas, arquivos ou commits produzidos pela outra migração.

Ler em conjunto: [instruções](../instrucoes.md), [arquitetura](../referencia/arquitetura-destino.md), [exemplo frontend](../referencia/exemplo-frontend.md), [diagnóstico](01-diagnostico.md), [contratos](06-contratos-originais.md), [matriz](02-matriz-de-modulos.md), [validação](03-validacao.md), [publicação e reversão](05-publicacao-e-reversao.md), [progresso](04-progresso.md). Exemplos são referências de outro produto, não contratos deste sistema.

O usuário reafirmou o escopo frontend e a direção técnica; não respondeu D1–D6. Planejamento não equivale à aprovação das respostas. Após revisão, executar o prompt 03-preparacao somente com aprovação explícita, sem implementar FRONT-01 nessa preparação. Cada etapa de implementação requer ID autorizado pelo prompt 04; cada commit requer validação e prompt 05. Uma entrega final, com checkpoints e commits internos, sem publicação parcial.

## Arquitetura e transição propostas

React, TypeScript strict/noUncheckedIndexedAccess, Vite, MUI/Emotion com tema ptBR e marca preservada, RHF e TanStack Query. Versões/engines serão verificadas em fontes oficiais e peer dependencies na FRONT-02; nenhuma versão da fotografia da referência é automaticamente adotada.

Organizar por funcionalidade (páginas, API, tipos/adaptação e hooks); compartilhar cliente HTTP, QueryClient, sessão, escopo, tema, navegação, mensagens UI e socket. RHF para valores/erros/envio; Query para dados remotos; contexto para sessão/assembleia e badge/leitura compartilhados; estado local para filtros/seleção/andamento. Não remover Redux antes de substituir e verificar auth/dashboard/tab/form/toastr/notificacao. Nenhum requisito offline foi comprovado; reabrir inventário se aparecer consumidor legítimo.

Para manter a referência executável durante a migração, propor candidata em `migration-ui/` com package.json/lock próprios, Vite root próprio e saída própria. Legado na raiz permanece inalterado até consolidação. Não compartilhar node_modules nem montar React 15 e React novo no mesmo DOM. Testes/harness independentes em `migration-tests/` podem caracterizar ambos em origens/contexts separados. Esses diretórios ainda não existem. Rotas não migradas da candidata ficam explicitamente pendentes e impedem entrega; nunca simular que estão prontas. FRONT-13 consolida a candidata na raiz e elimina a estrutura transitória revisada, após preservar artefato de reversão.

Manter URLs atuais com hash e todas as rotas de src/main/routes.jsx, inclusive sem menu, fallback e variantes de caixa caracterizadas. Essa escolha preserva o produto existente; não impõe o router do exemplo. Não converter tudo em dialogs ou reduzir colunas/listas. Lazy/Suspense por página e recuperação de erro de chunk sem repetir escrita.

Configuração proposta: VITE_API_BASE_URL (origem + /api), VITE_OAPI_BASE_URL (origem + /oapi) e VITE_SOCKET_URL (namespace original); validar ausência/URL sem fallback silencioso para produção em teste. Preservar token direto em authorization, errors[], métodos, status, payloads, barras e query strings até prova de compatibilidade. Socket tipado com protocolo/namespace compatível ao servidor original Socket.IO 2, verificado antes de escolher cliente; sem exigir atualização do backend.

Fonte explícita de assembleia substitui efeitos em render; precedência entre storage/usuário/ativo/default exige cenários D2 aprovados. Query keys incluem identidade, assembleia, recurso, filtros/ordenação/limite/cursor relevantes; cancelar leituras e ignorar respostas de gerações antigas. Cache somente em memória; sem token nas query keys, sem persistência de documentos de usuários/chat em disco. Limpar cache e socket na troca de identidade. Mutations sem retry automático; cancelamento não desfaz gravação. Políticas por recurso estão na matriz.

## Comportamentos preservados e mudanças propostas

Preservar: contratos de 06, quatro classes, S/N/A, todos limitado à lista filtrada e sequencial, parada no erro, assinatura POST sem PDF, chat sem seleção privada ativa, ordenações distintas, limites 300 onde atuais, precisão BRL/percentuais, sentinelas/recortes históricos, rotas/menus/contato/marca. Não introduzir paginação de servidor ou cadastro público.

| ID | Mudança intencional proposta, ainda não aprovada |
| --- | --- |
| M1 | Trava síncrona local contra clique/Enter/lotes simultâneos. Erro ambíguo: informar resultado não confirmado, reconsultar e exigir ação manual; nunca retry de escrita. Não garante idempotência entre abas/clientes |
| M2 | Erro de rede explícito e nova tentativa manual de leitura, estados vazio/erro, preservação do rascunho de chat após falha |
| M3 | Recuperação de storage inválido, limpeza de cache/socket por identidade e marcador de leitura por usuário/assembleia. Não atribuir marcador global antigo a outra identidade |
| M4 | Labels, nomes acessíveis, foco/Tab/Escape, contraste e mobile sem perda de recursos; rel adequado em links externos |
| M5 | Cleanup efetivo de timers/listeners/charts, descarte de respostas antigas, invalidação pós-escrita e reconciliação de eventos por _id; correção de cursor exige expectativa aprovada |

A revisão deve aprovar/rejeitar M1–M5. Caracterização pode avançar independentemente; implementar mudanças funcionais somente após aprovação. Sem resposta D3, manter contagem Me/Epp, cores e horários atuais; não tratar divergências como correções triviais. Autorização remota, endpoints novos, schema/índices/banco/dados e operações de produção estão fora do escopo.

## Decisões e bloqueios localizados

| Decisão | Sem resposta: direção de preservação | Bloqueio |
| --- | --- | --- |
| D1: login legado e rotas sem menu | Inventariar/manter; não expor signup | Remoção/redesenho de login e aceite final de GET com senha na FRONT-12 |
| D2: matriz de permissões/escopo | Preservar menus/filtros, documentar deep links e limites remotos | Novos guards, precedência ambígua de assembleia FRONT-03 e aceite administrativo FRONT-11 |
| D3: ata, cores, percentuais e timezone | Preservar resultados observados e dados históricos | Somente correções correspondentes FRONT-06/08/09; migração equivalente pode avançar |
| D4: todos/recuperação de escrita | Lista filtrada, sequencial, para no erro, sem repetição automática | Fechamento das melhorias M1 em FRONT-04/05/09 |
| D5: teste exclusivo/perfis/volume | Nenhuma integração em banco desconhecido/produção | R de todos os fluxos e entrega final FRONT-14; mocks independem |
| D6: host/subcaminho/browsers | Manter hashes; Chromium desktop/mobile como cobertura inicial provisória | Hosting final, matriz de navegadores e ensaio/release FRONT-13/14 |

Lacunas de status node-restful, limites implícitos, barras/regex serão caracterizadas contra fonte/artefato original, nunca inventadas. Nenhuma decisão ausente impede escrever este plano. Sem D5/D6, não declarar entrega final validada.

## Etapas e aceitação

Em cada etapa: A caracteriza contrato/baseline; B implementa escopo; C verifica/diff/checkpoint. Atualizar progresso ao concluir cada subetapa e antes de checks demorados. Implementado, validado simulado, validado real, homologado e commitado são estados distintos. Parar para revisão após cada ID; não avançar/commitar automaticamente.

Checks comuns Q: tipos, formato, build, unitários relevantes e navegador com API simulada do fluxo entregue. L: build legado isolado enquanto existir transição. R: integração real separada, quando D5 disponível. Comandos atuais e scripts futuros explicitamente distintos em 03-validacao. Aceitação comum: contratos/recursos preservados, formulário/carregamento/erro/vazio, teclado/mobile, cache segregado, mutações sem repetição automática, diff revisado, pendências identificadas. Não aceitar placeholder como módulo concluído.

### FRONT-01 — Proteção dos comportamentos críticos

Depende preparação aprovada. A: fixar artefato, fixtures sintéticas admin/credor/procurador/duas assembleias. B: harness Playwright isolado, HTTP e socket simulados, baseline login → presença → voto → resultado → ata. C: separar falhas legadas reproduzidas de expectativas de correção propostas.

Unitário: serialização/fixtures somente se houver lógica relevante; proteger sentinelas/precisão por exemplos observáveis. Checks L e baseline do harness; sem API real. Manual: filtrar dois credores, confirmar um, votar e observar totais/assinatura. Conclusão: requests/efeitos capturados deterministicamente sem alterar produção; falhas existentes não ocultadas por expectativas enfraquecidas. Commit proposto: `test(front): proteger contratos e fluxos originais`.

### FRONT-02 — Infraestrutura mínima candidata

Depende FRONT-01. A: escolher versões/engines/cliente socket compatíveis. B: TS/Vite/MUI/Emotion/Query/RHF, tema, configuração, HTTP/socket e scripts finitos isolados. C: smoke e builds candidato/legado, assets e imports sensíveis à caixa.

Unitário: headers/URLs, serialização e errors[]/erro sem response. Checks Q inicial + L. Manual: abrir origem candidata, marca/fontes e erro de configuração, sem escrita real. Conclusão: builds isolados sem segredos ou dependência do runtime legado, lockfile coerente; versões documentadas. Commit: `build(front): preparar candidata React TypeScript e Vite`.

### FRONT-03 — Sessão, escopo, rotas e shell

Depende FRONT-02; D2/M3 afetam políticas. A: restauração, token inválido, ausência de ativo e precedência do escopo. B: RHF login, providers, shell MUI/menus, rotas lazy, socket getUser/setUser/expulsões/logout. C: cache/timers por sessão e respostas tardias.

Unitário: transições de sessão/escopo e limpeza por geração. Q/L; R quando disponível. Manual: login, refresh /#/votar, voltar/avançar, logout/outro usuário, storage inválido/rede. Conclusão: nenhuma consulta protegida antes de validação, um ciclo socket/heartbeat por sessão, rotas preservadas; sem novos guards implícitos. Commit: `feat(front): migrar sessao navegacao e assembleia`.

### FRONT-04 — Piloto representativo: confirmação de presença

Depende FRONT-03; D4/M1 para recuperação, D5 para R. A: filtros/ordenação/janela/representação e todos filtrado. B: fluxo completo consulta → formulário pesquisa → POST {_id} → resposta → evento → atualização, poll 5s e lote sequencial. C: duplo clique/Enter, erro no segundo item, troca de janela/sessão.

Unitário: seleção e coordenador de lote para no erro e não repete confirmado. Q/L; R original para voto criado/credor/notificação. Manual: confirmar um e subconjunto filtrado, janela fechada e duas abas. Conclusão: padrão de API/tipos/cache/form/socket revisado antes de multiplicação; resultado parcial e limitações entre abas documentados. Commit: `feat(front): migrar confirmacao de presenca`.

### FRONT-05 — Votação individual e em lote

Depende piloto FRONT-04 revisado. A: pendentes/S/N/A/podeVotar/filtro procurador. B: PUT {_id,tipo}, feedback, evento e invalidações; todos sobre lista filtrada. C: erro ambíguo/dupla intenção/sessão expirada.

Unitário: payload S/N/A, seleção de pendentes e interrupção. Q/L/R. Manual: três opções em credores distintos, lote filtrado e erro intermediário sem repetição automática. Conclusão: voto confirmado não reenviado pela UI; nenhuma promessa de imutabilidade remota. Commit: `feat(front): migrar votacao individual e em lote`.

### FRONT-06 — Dashboard e quórum

Depende FRONT-03/05. A: quorum2/votos2, zeros/classe '.', diferenças de cor/horário D3. B: cards/gráficos completos e atualização 10s, destruição de charts. C: comparação de BRL/percentuais e reentrada.

Unitário: projeções/cores/formatadores com casos zero e limites. Q/L/R. Manual: votar → início, conferir totais/gráficos e mobile. Conclusão: mesmos valores e distinções card/gráfico; sem unificar fórmulas silenciosamente. Commit: `feat(front): migrar dashboard e quorum`.

### FRONT-07 — Consultas de credores e votos

Depende FRONT-04/05/06. A: grupos 1–4, ordenações distintas e joins de voto/presença/online. B: tabelas completas/filtros Enter/totais; queries separadas. C: percentual/CPF-CNPJ/valor/procurador/vazio.

Unitário: join por codigo, confirmou/votou, grupos e soma. Q/L/R. Manual: nomes/acentos, cada classe, antes/depois do voto e mobile/teclado. Conclusão: nenhuma coluna/pesquisa perdida; sem paginação nova ou truncamento silencioso. Commit: `feat(front): migrar consultas de credores e votos`.

### FRONT-08 — Acompanhamento em tempo real e resultados

Depende FRONT-05/06/07. A: ordem__gt/cursor/dedup e tipoResultado/classes/subtotais D3/M5. B: polling 3s e resultado completo/pergunta. C: mesmo _id alterado, respostas fora de ordem, vazio/precisão.

Unitário: merge/cursor conforme política aprovada e projeções V/demais, classes 1/4 versus 2/3. Q/L/R. Manual: votar num context e acompanhar noutro; todos os modos, subtotais e reconexão. Conclusão: apuração do servidor não recalculada, cursor não corrigido sem expectativa aprovada. Commit: `feat(front): migrar acompanhamento e resultado`.

### FRONT-09 — Assinatura e acompanhamento da ata

Depende FRONT-04/06/08. A: classes, secretário/recuperanda, contagem Me/Epp e cores D3. B: POST sem corpo, aprovarata e refresh aprovouata/reprovouata, janela 5s/resumo presentes. C: listeners repetidos/falha ambígua.

Unitário: contagens/cores e projeções especiais segundo baseline. Q/L/R. Manual: assinar, representados, podeAta=false e evento externo. Conclusão: sem PDF/upload/reprovação nova, contagem preservada ou mudança aprovada. Commit: `feat(front): migrar assinatura e acompanhamento da ata`.

### FRONT-10 — Chat e badge compartilhado

Depende FRONT-03/04; M2/M3/M5 para melhorias. A: histórico limit=300, payload omitido/undefined, eco/lastRead. B: RHF mensagem, Enter/foco/rolagem, eventos e badge/poll 5s sem ativar privado. C: duplicação/reconexão/troca de identidade/falha.

Unitário: reconciliação por _id, contador e lastRead aprovado, payload exato. Q/L/R. Manual: enviar/receber em dois contexts, limpar badge e trocar usuário; rascunho após erro se M2 aceita. Conclusão: cache por escopo, sem listeners extras nem promessa de privacidade remota. Commit: `feat(front): migrar chat e leitura compartilhada`.

### FRONT-11 — Operação administrativa

Depende FRONT-03/10; D2 para mudanças de acesso. A: menu/deep links, lido e heartbeat 30s. B: online/expulsar id/todos, logs limit=300 e notificações/lote leitura. C: logout/reentrada e erro parcial.

Unitário: não lidos, menu por tipo e scheduler/cleanup. Q/L/R. Manual: admin/comum via menu/deep link, expulsar só usuários sintéticos, observar gravação após ack de log. Conclusão: limites do servidor explícitos, sem tratar menu como autorização. Commit: `feat(front): migrar operacao administrativa`.

### FRONT-12 — Links, referências e fluxos legados

Depende FRONT-03/11; D1/M2/M4. A: links objeto inteiro/_id=null, assembleias/classes sem menu, contato e login legado. B: páginas completas, RHF links, abrir nova aba e preservar/remover login somente por decisão D1. C: erro/teclado/caixa Contato e payload PUT.

Unitário: null/omitido e serialização dos links, filtros assembleia. Q/L/R. Manual: CRUD sintético/links úteis/contato e deep links assembleias/classes/login. Conclusão: nada removido só por estar oculto; GET legado com senha tem decisão registrada, sem credenciais reais/logs. Commit: `feat(front): migrar links referencias e fluxos legados aprovados`.

### FRONT-13 — Consolidação e retirada do runtime legado

Depende FRONT-01–12 implementadas/revisadas e D1/D2 para fluxos finais; D6 para hosting. A: cobertura total, inventário consumidores Redux/jQuery/AdminLTE/SignalR/assets e snapshot do artefato legado. B: candidata na raiz, scripts/lock finais, CI finita sem deploy, saída dist; remoção somente sem consumidores. C: instalação limpa em cópia, build em filesystem sensível à caixa e regressão.

Unitário: suíte existente integral, sem testes espelhando remoção de arquivos. Q e último L antes da remoção. Manual: todos os deep links/refresh/recursos no host de ensaio. Conclusão: zero placeholder, dist servida explicitamente, build reproduzível sem node_modules antigo, scripts finais documentados. Commit: `refactor(front): consolidar Vite e retirar runtime legado`.

### FRONT-14 — Validação real, ensaio e entrega final

Depende FRONT-13, D5/D6 e decisões funcionais impeditivas resolvidas. A: comparar contratos com backend original isolado e histórico anonimizado. B: Q/R integral, concorrência/volume/perfis/duas assembleias, ensaio de backup/restauração/reversão em teste. C: homologação, hashes de artefatos/configurações e revisão final (prompt 06), commit posterior pelo prompt 05.

Unitário: suíte integral, sem testes artificiais de checklist. Manual: presença → voto → resultado → ata, chat/admin e rollback com escrita em voo. Conclusão: evidências reais/simuladas separadas, sem lacuna impeditiva, reversão ensaiada e aceite do usuário. Commit: `docs(front): registrar validacao final e ensaio de reversao`; correções em unidades revisadas próprias. Publicação depende de autorização posterior e não é executada por este plano.

## Checkpoints e entrega

Gate piloto FRONT-04, gate consolidação FRONT-13 e gate entrega FRONT-14. Commits intermediários preservam revisão sem entregar módulos isolados em produção. A ausência de D5 não impede implementar/testar mocks, mas impede afirmar integração validada. Não enfraquecer requisito aprovado para acomodar falha do backend original; registrar discrepância sem alterá-lo. Nenhum commit proposto foi realizado.


## Autorização da FRONT-01 — 18/10/2026

Registro posterior à preparação: usuário autorizou somente FRONT-01, atualizando progresso com commit documental 1cd0ce66650ef9a2811fa66248182bb032a61829, preservando comportamentos e mantendo D1–D6/M1–M5 pendentes. Proibidos acesso ao backend e commit nesta execução. Não autoriza FRONT-02 ou correções funcionais. O cabeçalho de 12/10 registra aprovação histórica da preparação, não limita esta nova autorização específica. Harness/comandos/evidências em migration-tests/README.md e 04-progresso.md; estado final de execução somente no checkpoint mais recente.

## Autorização e infraestrutura FRONT-02 — 18/10/2026

Após commit FRONT-01 64453aeba35dcc725d1995903fe64aad580cfd01 e proposta explícita da FRONT-02, usuário respondeu “Pode avançar”. Autorizado somente infraestrutura mínima isolada; sem commit ou FRONT-03. Implementada migration-ui com lock/node_modules próprios e checks, mantendo legado. Configuração e adapters testados sem servidor do produto; handshake Socket.IO usa fixture local 2.3, não backend. Documentação técnica e versões escolhidas em migration-ui/README.md, resultados no progresso.

D1–D6 e M1–M5 ainda pendentes. A candidata ainda não tem login/sessão/menu/formulários ou módulos; os hashes conhecidos exibem aviso honesto de preparação. Não é entrega parcial publicável. FRONT-03 exige decisões afetadas e autorização posterior, sem resolver política de escopo ou acesso unilateralmente.
