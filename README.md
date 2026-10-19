# Portal de votação Gladius — frontend

React, TypeScript estrito, Vite, MUI/Emotion, React Hook Form e TanStack Query. Aplicação na raiz do domínio, rotas hash (por exemplo /#/votar), suporte solicitado ao Google Chrome. Fonte ativa em src/, assets em public/, saída em dist/. A estrutura transitória migration-ui foi consolidada na FRONT-13.

## Preparar e verificar

Node 24.21.0 (engines e .nvmrc), npm compatível com o lock v3. PowerShell usa npm.cmd; em Linux pode usar npm.

~~~powershell
npm.cmd ci
npm.cmd run check
npm.cmd --prefix migration-tests ci
npm.cmd run test:browser
~~~

check executa formatação, 55 unitários, TypeScript/build e testes HTTP estáticos/hook/runtime. test:browser exige Chrome instalado e roda desktop + viewport mobile em loopback, com API simulada e fixture Socket.IO 2. Se o navegador não existir, instalar em ambiente próprio de teste com npm.cmd exec --prefix migration-tests -- playwright install chrome (em Linux: --with-deps). Não usar credenciais reais no harness. CI preparada em .github/workflows/frontend.yml, sem deploy; execução remota não é presumida.

## Desenvolvimento e configuração

npm.cmd run dev inicia Vite em 127.0.0.1:8080 (watcher). Configure VITE_API_BASE_URL, VITE_OAPI_BASE_URL e VITE_SOCKET_URL para serviço/dados exclusivos de teste quando esse ambiente for autorizado. .env.example contém somente endpoints sintéticos de loopback; não é backend simulado que funcione fora do contexto Playwright. Não há fallback para produção. Sem configuração, a UI mostra indisponibilidade e não faz requisições de negócio. Variáveis VITE são públicas no bundle; nunca colocar senhas/tokens nelas. Nenhum .env real faz parte desta migração.

npm.cmd run build gera dist após TypeScript. npm.cmd run production é alias finito de build; não serve mais Webpack/public. npm.cmd start serve exclusivamente dist, sem fallback para fonte/raiz/API, padrão loopback 18184 sem PORT. HOST e PORT configuram ensaio; com PORT e sem HOST o bind é 0.0.0.0 para o contrato Heroku. URLs sem hash não recebem reescrita SPA: /#/votar funciona; /votar retorna 404. Não iniciar watchers como checks.

## Preparação Heroku — sem publicação

Procfile: web: npm start. heroku-postbuild valida a configuração pública pelo mesmo readConfig da aplicação e executa build; falha se faltar base de API/OAPI/socket. A preparação segue o [buildpack Node clássico](https://devcenter.heroku.com/articles/nodejs-classic-buildpack-builds): instalar deps de build, executar hook e remover devDependencies. O servidor final usa apenas módulos nativos Node e dist. O ciclo build/prune/runtime é ensaiado com endpoints sintéticos, sem tocar a aplicação Heroku, DNS, config vars ou domínio produtivo. Stack/buildpack/configuração efetivamente publicados precisam ser conferidos na etapa operacional autorizada.

index e assets sem hash revalidam; chunks com hash são imutáveis. O host futuro deverá trocar artefato inteiro e reter chunks anteriores para clientes abertos. Build sem configuração, embora útil a checks estáticos, não é pacote de entrega. Não existe autorização de push/deploy neste trabalho.

## Referência original e continuidade

Frontend original fixo: 41478a83b74a8d27c7058a1d79b2ed1deab271c3. Harness de baseline independente em migration-tests/.original, ignorado, extraído por Git e conferido por blob antes de executar. [Instruções do harness](migration-tests/README.md) explicam prepare:original, instalação legada isolada e test:baseline. Não precisa das dependências/fonte novos para representar o original; nunca usar a árvore de outra migração.

Regras e autorização em [AGENTS.md](AGENTS.md); estado final, resultados, processos e próximos passos em [progresso](docs/migracao/execucao/04-progresso.md) e [consolidação](docs/migracao/execucao/08-consolidacao.md). D2/D3 preservam menus/filtros/fórmulas/cores/datas; não autorizam novos guards ou correções. Login secundário com GET foi mantido por decisão explícita. Melhorias de sessão, lotes, rascunhos, acessibilidade/cleanup, marcador de chat e cursor foram aprovadas e documentadas.

FRONT-14 está adiada por decisão do usuário: nenhuma integração com backend/banco/API real, CORS/ACL/volume/histórico reais, homologação ou publicação. Testes simulados e socket fixture não provam esses itens. Este repositório deve ser trabalhado sem acessar o backend.
