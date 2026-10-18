# FRONT-01 — baseline do frontend original

Harness isolado, sem código/dependências da aplicação alterados. Fonte de referência frontend: `41478a83b74a8d27c7058a1d79b2ed1deab271c3`; commit documental na criação: `1cd0ce66650ef9a2811fa66248182bb032a61829`. Não lê, importa ou inicia o backend. Nenhum dado de produção.

## Executar

Da raiz do frontend, com Node >=20 e dependências legadas já instaladas:

```powershell
npm.cmd --prefix migration-tests ci
npm.cmd exec --prefix migration-tests -- playwright install chromium
npm.cmd --prefix migration-tests run test:unit
npm.cmd --prefix migration-tests run test:baseline
```

Playwright fixado em 1.64.1, com lock próprio. Na primeira instalação o runner precisa de acesso ao registry e download do navegador. Não altera package.json/package-lock.json/node_modules da raiz. Unitários usam o Babel 6 já existente da raiz para carregar somente duas fontes puras explicitamente identificadas; não importa bootstrap/servidor nem transpila fontes arbitrárias. Se dependências legadas estiverem ausentes, registrar o pré-requisito e preparar a instalação em escopo separado, sem atualizar versões por conveniência.

`test:baseline` é finito: Playwright inicia server.cjs, aguarda readiness e encerra o processo que criou. Porta exclusiva 18181 em 127.0.0.1; falha se ocupada, sem reaproveitar servidor desconhecido. Timeout global 240s, por caso 20s, workers=1, retries=0 e forbidOnly=true. Conferir processo antes de repetir após interrupção. Não executar o servidor isoladamente contra a rede.

O servidor confere `git diff --exit-code <original> -- src public package.json package-lock.json webpack.config.js` e recusa baseline se fonte/artefatos/dependências divergirem. Compila via Webpack 1/config original e otimização production para `.baseline/`, sem sobrescrever public. `.baseline/manifest.json` contém original, HEAD, hash Webpack e SHA-256 de app.js/app.css. Não usar bundle public antigo como prova do fonte atual. Durante a transição o legado continua na raiz; após FRONT-13 será necessário adaptar o harness para cópia original isolada, sem retirar essa proteção para testar código diferente como se fosse original.

## Isolamento

- Browser novo/context por teste, storage e credenciais estritamente sintéticos. Desktop 1366x768 e viewport móvel 390x844, pt-BR/America-Sao_Paulo.
- Intercepta todas as requisições do contexto. Somente arquivos estáticos do servidor local seguem para rede; HTTP de negócio do host configurado pelo fonte original recebe JSON em memória. Endpoint/método não catalogado aborta e falha o teste. URL Heroku permanece literal no bundle original, mas **nenhuma chamada real é feita a ela**.
- CSS Google Fonts solicitado pelo AdminLTE recebe CSS vazio local. Não baixa fontes Google. Recursos de public continuam locais. Essa substituição não representa aprovação visual/pixel-perfect.
- `socket.io.js` do servidor de teste fornece double com on/emit/receive, sem conectar; tentativas de WebSocket real são fechadas e falham o teste. Service workers bloqueados. O teste valida nome/payload/ordem observável, não protocolo Socket.IO.
- Backend, MongoDB, autorização remota, CORS real, índices, jobs e persistência não são verificados. Mock de efeito de presença/voto é apenas estado da fixture. Resultado fixture não calcula apuração; fluxo integrado testa navegação/requests/renderização, não a fórmula do servidor.
- Runners/artefatos/logs estão em .gitignore local. Screenshots somente em falhas, sem trace de credenciais reais. Não fornecer credenciais reais ao harness.

## Cobertura e diagnósticos

`specs/critical.spec.cjs`: contratos de sessão restaurada, login inválido/errors[], filtro por procurador versus admin, presença individual/lote filtrado/parcial no erro, S/N/A, pendentes/parada no erro, resultado Q/V/precisão, POST de ata sem corpo e refresh por evento, janelas fechadas, segunda assembleia e sequência presença → voto → resultado → ata. Pesquisa via Enter exercita teclado; viewport mobile é smoke funcional, não auditoria completa de acessibilidade/responsividade.

`specs/diagnostics.spec.cjs`: quatro evidências do original, **não critérios de entrega futura**:

1. Primeiro login salva sessão, falha ao emitir em socket ausente e o catch recarrega; validação só ocorre depois da recarga. A expectativa diagnóstica mudará somente com decisão explícita M3/fluxo de sessão.
2. Credor próprio não admin ainda filtra codigoProcurador pelo próprio código, podendo resultar vazio (D2).
3. Ata Me/Epp conta registro não aprovado, diferentemente de outras classes (D3).
4. Dois cliques antes de receber resposta emitem dois POSTs de presença (M1/D4). Double não comprova criação duplicada no banco.

`unit.test.cjs`: hora histórica é recortada sem conversão de timezone e sentinela omitida; cores originais da ata incluem verde com 2/100 ou 0/0. Esta última é evidência D3, não requisito de quórum aprovado. Nenhum crash é transformado em requisito de entrega da candidata; testes de diagnóstico não substituem as expectativas corrigidas que precisam de decisão e regressão próprias.

D1–D6 e M1–M5 permanecem pendentes. Nenhum teste skipped/expected-failure para ocultar defeito: diagnósticos são afirmações explícitas do observado, e devem ser distinguidos dos contratos úteis ao avaliar a candidata. Não adicionar retries para disfarçar race; sincronizar asserção com efeito observável.

## Roteiro de revisão

Revisar diff de testes/documentos e preservação do fonte; executar unitários e baseline; conferir manifest e contagem real do relatório. Para execução acompanhada com browser visível: `npm.cmd --prefix migration-tests run test:baseline -- --project=desktop --headed`. Somente viewport/browser simulado, sem integração real ou dispositivo físico. Todos os dados são fixtures criadas no processo.

Referências técnicas consultadas: [configuração Playwright](https://playwright.dev/docs/test-configuration), [interceptação de rede](https://playwright.dev/docs/network). Próxima etapa FRONT-02 precisa de autorização própria; não há candidata/Vite criada nesta entrega.
