# Candidata isolada — FRONT-03

Candidata React/TypeScript/Vite independente do legado. FRONT-03 implementa login/sessão, escopo pela API, shell/menus e navegação. Módulos de presença/voto/chat e demais fluxos ainda exibem aviso de preparação; não publicar. FRONT-04 exige autorização própria. As seções técnicas abaixo registram a fotografia da FRONT-02; a atualização FRONT-03 ao final prevalece quanto ao estado atual.

## Executar e revisar

Node 24.x (verificado v24.21.0), npm.cmd no PowerShell. Da raiz do frontend:

```powershell
npm.cmd --prefix migration-ui ci
npm.cmd --prefix migration-ui run typecheck
npm.cmd --prefix migration-ui run format:check
npm.cmd --prefix migration-ui run test:unit
npm.cmd --prefix migration-ui run build
npm.cmd --prefix migration-tests run test:candidate
npm.cmd --prefix migration-tests run test:baseline
```

São scripts existentes. Build escreve somente migration-ui/dist. node_modules/lock próprios não substituem dependências legadas. Runner Playwright já fixado em migration-tests; se ausente, usar seu README para instalação. Vitest testa somente migration-ui/tests; nada importa o backend. Check de tipos inclui src, tests e vite.config.ts. Sem script lint inventado.

Para ver a candidata localmente, copiar `.env.example` para `.env.local` **dentro de migration-ui** (não copiar .env do produto); os valores são fictícios e públicos. Então `npm.cmd --prefix migration-ui run dev` abre servidor apenas em 127.0.0.1:18182. É watcher para revisão, não check finito. Configuração ausente mostra Portal indisponível; não há fallback Heroku. Mesmo configurada, a candidata desta etapa não faz requests de negócio. Preview serve dist já compilado; mudar env após build exige recompilar. VITE_ é público e nunca recebe segredo/token/senha.

Variáveis: VITE_API_BASE_URL termina em /api (barra final opcional e preservada), VITE_OAPI_BASE_URL em /oapi, VITE_SOCKET_URL em /api/ ou /api. Exigem URL http(s) absoluta sem credenciais/query/fragmento; não são confundidas com base path do hosting. Base Vite relativa './' é provisória, não decisão D6 de hospedagem. Não modificar endpoints reais ou a configuração do legado.

## Escolhas técnicas verificadas em 18/10/2026

| Área              | Versões fixadas                                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| UI                | React/DOM 19.3.1; MUI Material/Icons 9.5.0; Emotion react 11.14.0/styled 11.14.1                                                |
| Build/tipos       | Vite 8.3.4; plugin React 6.1.2; TypeScript 7.0.2; Node ^24.0.0                                                                  |
| Estado/forms/HTTP | TanStack Query 5.104.4; RHF 7.90.0; Axios 1.20.0                                                                                |
| Checks            | Vitest 5.0.5; Prettier 3.9.10; Playwright do runner separado                                                                    |
| Socket legado     | socket.io-client 2.3.0, igual ao cabeçalho de public/socket.io.js; socket.io 2.3.0 somente devDependency para fixture sintética |

Versões e peer dependencies consultadas no npm registry; instalação/`npm ls --depth=0` sem dependência missing/invalid/extraneous após prune de yaml extraneous. Engines Vite/plugin aceitam Node >=22.12; Vitest aceita Node 24. Types React/DOM 19.3.0, Node 24.10.0, Socket.IO 2.1.13 e cliente 1.4.36 (declarações da API legada); sem suprimir erros no código para adaptar tipos. TS strict/noUncheckedIndexedAccess/exactOptionalPropertyTypes e noUnused; skipLibCheck somente em declarações externas. Scripts/lock garantem versões locais; instalação limpa completa de release continua gate da FRONT-13.

Socket 2.3 conserva protocolo antigo e dependências transitivas antigas, com avisos npm de debug. Não atualizar major em busca de silêncio: mudar protocolo é decisão separada e exige compatibilidade do produto. Teste local confirmou namespace /api/ e EIO=3, mas não valida o servidor original, autorização, CORS de produção, reconnect em produção ou privacidade. Não usar esta infraestrutura como aprovação de políticas D1–D6/M1–M5.

Fontes oficiais consultadas: [Vite](https://vite.dev/guide/), [instalação MUI](https://mui.com/material-ui/getting-started/installation/), [cliente Socket.IO](https://socket.io/docs/v4/client-installation/). A tabela é registro do conjunto testado, não cópia automática das versões do sistema de referência.

## Responsabilidades

- `src/main.tsx`: composição StrictMode, ThemeProvider/ptBR, CssBaseline e QueryClientProvider; config ausente não inicia serviços.
- `src/theme.ts`: cor primária #3c8dbc e fundo #ecf0f5 do legado; assets selecionados em public foram copiados sem edição. Sem jQuery/AdminLTE/fontes externas. Sem trocar fonte/cor de domínio ainda não migrado.
- `src/App.tsx`: somente títulos/aviso para hashes conhecidos; não substitui auth, shell/menu ou router final. Fallback/deep links de produto, case e acesso por perfil serão concluídos na FRONT-03.
- `src/lib/config.ts`: valida os três endpoints públicos, sem default remoto e sem normalizar barras silenciosamente.
- `src/lib/http.ts`: cria clientes API/OAPI independentes; callback fornece token atual somente ao protegido, diretamente em authorization. Caminhos relativos devem incluir as barras exigidas pelo contrato (ex.: base /api/ + caminho /votos/confirmar mantém /api//votos/confirmar). Não usar params/normalização de payloads sem caracterização dos endpoints. Não faz retry, reclassifica status ou troca erro recebido. errorMessages é utilitário ainda não ligado a fluxo de produto; tratamento visual/retry de leitura permanecem M2.
- `src/lib/query.ts`: instância por aplicação, cache em memória, retry false, staleTime 0 e refetchOnWindowFocus false conforme plano. Sem persistência/keys de tokens ou política de sessão implementada.
- `src/lib/socket.ts`: fábrica desconectada (autoConnect false), conexão só por chamada explícita; on devolve cleanup, eventos de negócio desconhecidos ficam unknown. Reconnection mantém default do cliente legado, sem nova política. A camada de sessão futura será responsável pelo ciclo e pela validação dos payloads.
- RHF/ícones instalados para composição posterior; nenhum formulário fictício introduzido só para exercitar dependência. Nenhuma biblioteca legada foi removida.

## Evidência e limites

15 testes de infraestrutura: env obrigatório/URL, barras/token/corpo null/omitido e troca de token sem stale header, OAPI sem authorization, erro/rede/errors[]/403 sem retry, QueryClient separado e handshake Socket.IO real com **servidor sintético local efêmero**. Não se trata de API ou banco do produto. Teste do socket encerra cliente e servidor em finally.

Smoke separado (`migration-tests/candidate.config.cjs`): builds com config sintética e sem config, portas 18182/18183, desktop/mobile, bloqueio de toda rede de negócio e screenshots ignorados. O servidor de smoke serve só seu artefato compilado, não a raiz ou fontes. O aviso de outDir externo é esperado: saída nova criada pelo harness, sem emptyOutDir/delete. Nenhuma API/WebSocket real. Baseline da FRONT-01 continua em outro config/porta, sem reescrever seus casos.

Resultado atual: tipos/formato/build aprovados; 15 testes, 4 smokes e 42 casos legados aprovados. Reexecutado o teste de protocolo após usar API pública tipada. Capturas desktop/mobile inspecionadas; sem auditoria A11Y completa, CI remota, dispositivo físico, API real, backend, MongoDB ou deploy. Roteiro manual: abrir /#/votar com env sintético, conferir marca/aviso em desktop/mobile, retirar config e reabrir para erro; nenhuma operação de votação existe na candidata nesta etapa. Não confundir placeholder honesto de infraestrutura com módulo migrado.

Atualização da composição: `src/lib/Infrastructure.tsx` expõe factories HTTP por callback de token e socket desconectado via contexto. Não implementa sessão nem lê storage. Os adapters agora fazem parte do bundle de navegador, e smoke foi repetido para conferir carregamento e ausência de rede automática. Build final: 1119 módulos, JS 510,60 kB / gzip 161,16 kB (Vite 1,91 s). Aviso de chunk >500 kB registrado; não aumentado o limite para escondê-lo. Divisão lazy de páginas faz parte da FRONT-03 e análise final de carga depende D6. Sem garantia de performance de módulos ainda não migrados.

## Atualização FRONT-03 — sessão, escopo e navegação

src/auth/session-controller.ts controla restauração, token, geração, escopo, cache, socket e heartbeat; Session.tsx conecta contexto React/Query/factories e eventos de storage entre abas. AuthPage.tsx usa RHF com login/senha sem cadastrar usuários ou acrescentar regras de senha. Login conserva errors[] e reload em falha sem envelope; validação falha encerra sessão como original. Não há revogação/refresh/guard de papel novos.

Decisão explícita: primeiro resultado ativo da API prevalece; storage/usuário/default não selecionam assembleia. Sem ativo válido, não montar páginas protegidas: consultar novamente ou sair. Chaves originais de sessão/assembleia preservadas; cache somente em memória é cancelado/limpo antes da troca e respostas de geração anterior ignoradas. Corrupção/acesso negado ao storage não quebra bootstrap; storage indisponível permite sessão em memória até refresh. M3 do marcador de chat permanece pendente.

App.tsx preserva hashes/caixa/rotas ocultas, fallback, menus conforme tipo e nenhuma ACL nova. Auth e página pendente carregam por lazy/Suspense com limite de erro de chunk. Shell tem menu permanente desktop e Drawer temporário mobile, marca/perfil/nome/email quando presente/logout/contato. Não há query protegida antes de token validado na restauração; login usa resposta confirmada. Socket 2 responde getUser/setUser, trata expulsões/notificações e limpa listeners/conexão ao terminar/trocar sessão. Heartbeat POST sem corpo a cada 30s, sem retry; não comprova persistência. Chat/badge e outros módulos continuam etapas posteriores.

Para testar sem backend, usar test:candidate: builds com endpoints sintéticos, HTTP interceptado e fixture Socket.IO 2 somente loopback 19300. Dev com .env.example envia login à porta sintética, mas não inicia essa fixture sozinho; não esperar sucesso sem servidor explícito de teste. Não apontar para produção. Bases API/OAPI do exemplo terminam /api e /oapi; chamados preservam barras duplas do consumidor original. Logs/capturas/dist ignorados. Integração de produto, banco, CI, dispositivo físico, auditoria A11Y completa e homologação não executadas. Comandos/resultados finais e roteiro de revisão em docs/migracao/execucao/04-progresso.md.

## FRONT-04 — presença

/#/confirmarPresenca agora executa o piloto completo, com filtro/representação/colunas/valor/janela e individual/todos. src/presence contém API/tipos/página; assembly/api compartilha janela e recorte local de horário. BatchRunner oferece uma trava síncrona por página para individual/lote, snapshot filtrado sequencial, parada na falha e proteção de geração. Leituras Query consomem AbortSignal e keys incluem identidade/assembleia/geração/pesquisa, sem tokens. Socket compartilhado responde ao ciclo da sessão; confirmouPresenca leva credor original após POST confirmado. Sem retry de escrita. Erro reconsulta estado e informa incerteza; não garante idempotência entre abas ou desfazimento de gravação.

M1/M2/M4/M5 e marcador M3 foram aprovados para os módulos correspondentes, sem correções silenciosas de fórmulas/cores/datas/cursor/permissões. Demais rotas ainda pendentes conforme progresso. Mesmo roteiro de testes, com presence.spec.cjs adicional e capturas ignoradas; não usar ambiente do produto.

## FRONT-05 — votação

/#/votar usa src/voting com API/tipos/página lazy. GET /api/votos (sem barra final), filtro nomeCredor/procurador e ordem originais; PUT /api/votos/votar somente {_id,tipo:S|N|A}. Janela 5s, todas as colunas e voto confirmado visível. BatchRunner filtra pendentes da lista atual, bloqueia concorrência individual/lote e para em erro/fechamento de janela/sessão; evento votou leva documento local com tipo atualizado após HTTP. Reconsulta após resposta perdida não repete PUT; não garante idempotência/imutabilidade remotas. Presença e votação agora funcionais com fixtures, outros módulos pendentes.

## FRONT-06 — dashboard

/#/ agora exibe metadados/horários, cards e gráficos completos de quorum2/votos2, poll 10s e painéis recolhíveis. Gráficos SVG declarativos preservam percentuais/paleta/escala/valores sem dependência Chart ou instância acumulada; desmontagem elimina o DOM e Query controla o polling. Cards mantêm seis casas com ponto da string original, limiares de quorum 50/voto 100; gráfico de voto continua limiar 50. Não unificar por aparência de bug: D3 segue pendente. Contraste do texto e contenção de largura mobile aplicam M4 aprovado. Mudança de código ativo passa pelo controller e elimina cache/conexão anteriores. Capturas/testes no progresso.

## FRONT-07 — consultas

/#/credores e /#/votos migrados em src/consultations. Mantêm tabelas completas, quatro classes/totais, regex e ordens distintas, joins estritos por codigo e online, 4–6 casas e horários históricos sem conversão de fuso. Pesquisa RHF e estados Query/erro/vazio, painéis recolhíveis, colunas por rolagem interna mobile. Formatação compartilhada em common/format.ts; VotesTable reutilizável somente para a mesma projeção de votos. Não confundir /votos (consulta) com /votar (escrita). Nenhum filtro/ACL novo. Listener/timer online pertencem à página e são removidos na saída.

## FRONT-08 — acompanhamento/resultados

/#/resultado preserva colunas/regras de apresentação por classe, modo V com subtotais/total do primeiro registro, pergunta e cores/precisão originais. /#/votacaoTempoReal usa feed incremental a cada 3s, corpo remoto sem recálculo e tabela compartilhada. Cache do feed guarda rows/cursor na key agregada por identidade/assembleia/geração; leitura incremental usa cursor desse estado e não cria cache por página de resposta. HTTP cancelável e Query impede sobreposição da mesma leitura.

Limitação preservada enquanto falta decisão: cursor calculado pela lista anterior e documento com _id conhecido não atualizado. Teste específico é caracterização provisória, não requisito definitivo; pergunta de correção continua aberta. Não modificar sem resposta. Falha de leitura mostra retry manual e interrompe esse polling até recuperar. Resultados e acompanhamento não provam apuração/persistência/ACL do produto.

## FRONT-09 — assinatura/ata

/#/aprovaAta migrada em src/minutes: POST /api/aprovaAtas/aprovar sem corpo, evento aprovarata só após resposta, consulta filtrada e eventos aprovouata/reprovouata, grupos 1–4 e secretário/recuperanda, resumo de presentes pelo caminho /api/votos/dashboard/ com barra final. Janela 5s e assinatura com trava/revisão após falha, sem retry automático. Cores/Me-Epp preservam D3; tabela acessível completa com rolagem mobile. Não há reprovar, PDF ou upload acrescentados. Fluxo integrado candidato presença→voto→resultado→ata é simulado, não comprova persistência/apuração do produto.

## FRONT-10 — chat/badge

/#/chat migrada e ChatProvider compartilhado somente sob sessão/escopo prontos. Histórico/limite 300, DTO original com privateMessageTo={} e destinatário omitido, POST seguido de atualização confirmada do cache/evento, dedup de eco por _id; input/Enter/foco/rolagem e rascunho em falhas. Trava síncrona e revisão por GET em resultado incerto, nunca POST automático. Sem seleção privada. Badge inicia em 5s e segue a cada 5s, cache por geração, ids/datas de não lidos compartilhados. Marcador de leitura por id/assembleia sem reaproveitar/apagar global; leitura entre abas e troca de assembleia testadas. Eventos com código de outra assembleia ignorados localmente, sem prometer isolamento do servidor. Novo nome acessível do link inclui contador. Todos os timers/listeners/queries pertencem ao contexto e são limpos na saída.

## Estado funcional após FRONT-12

Rotas atuais têm módulos funcionais de presença, voto, dashboard, consultas, acompanhamento, resultado, ata, chat/badge, online/logs/notificações, links/referências/contato e login secundário. Registros anteriores de páginas pendentes são históricos. O login oculto foi preservado por decisão explícita: GET com senha e segunda sessão continuam; não reutiliza autenticação principal. Leitura de chat por usuário/assembleia e correção de cursor/_id foram aprovadas. Fórmulas/cores/datas/permissões originais continuam preservadas. Estado final dos checks e commits: docs/migracao/execucao/04-progresso.md. Ainda não equivale a API real/homologação ou consolidação da raiz.

## Preparação FRONT-13.A: servir somente dist

Após build, npm.cmd --prefix migration-ui run serve:dist inicia Node 24 em 127.0.0.1:18184. PORT e HOST podem ser definidos explicitamente para ensaio; não mudar para host público nesta execução. O diretório servido é sempre migration-ui/dist relativo ao script, sem parâmetro para servir fonte/raiz. Não há proxy API nem fallback para URLs sem hash: /#/votar funciona pelo index, /votar retorna 404. index e assets sem hash revalidam; chunks com hash são imutáveis. Retenção de chunks antigos e troca atômica pertencem ao futuro host. npm.cmd --prefix migration-ui run test:static verifica o build real por HTTP local/porta efêmera. Sem dist/index.html o comando falha, não serve outro diretório.

VITE_API_BASE_URL, VITE_OAPI_BASE_URL e VITE_SOCKET_URL são públicas e incorporadas no build; usar somente alvos exclusivos de teste nesta fase. Build sem configuração exibe erro intencional e não é pacote de entrega. Não há deploy, Procfile raiz alterado ou retirada do legado nesta preparação. Host/subpath/browsers e consolidação ainda precisam ser concluídos.
