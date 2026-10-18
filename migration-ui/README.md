# Candidata isolada — FRONT-02

Infraestrutura React/TypeScript/Vite independente do legado na raiz. Ainda não é uma versão de produto: rotas conhecidas exibem aviso de preparação, sem login, sessão, consultas/escritas de negócio, menus ou formulários migrados. Não publicar. FRONT-03 e demais módulos precisam de autorização própria.

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
