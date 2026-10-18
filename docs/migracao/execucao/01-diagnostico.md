# Diagnóstico do frontend

Data: 11/10/2026. Estado: análise concluída para revisão; nenhuma implementação autorizada nesta etapa.

## Escopo, método e referência

Repositório autorizado: `C:/Desenvolvimento/React/portalVotacaoFront`, branch `migracao-arquitetura-front`, HEAD `e326a9c9b33cfc5e19553209a737d4c7285c8527`, working tree inicialmente limpo. Código original fixado em `41478a83b74a8d27c7058a1d79b2ed1deab271c3`; não há diferenças de implementação até HEAD. Instruções e todas as referências locais foram lidas. Backend usado somente por `git show d1bd37e:<arquivo>` no commit `d1bd37e031d8b699a8dd5a33e039b4ef8a861c8a`; nenhuma referência a documentos ou código em andamento da outra migração.

As constatações abaixo são fatos de leitura estática, exceto onde marcadas como risco, hipótese ou pendência. Build executado não comprova funcionamento no navegador. Contratos detalhados em [06-contratos-originais.md](06-contratos-originais.md); execução e limitações em [04-progresso.md](04-progresso.md).

## Arquitetura, dependências e infraestrutura

- `src/index.jsx` monta ReactDOM com Provider Redux, middlewares multi/thunk/promise e extensão Redux DevTools. `window.Params` compartilha URL e assembleia (valor inicial 5) entre módulos. Não há TypeScript, injeção de serviços ou cliente HTTP centralizado; Axios é importado diretamente nas telas/actions.
- `package.json`: React/DOM 15.4.2, Router 3.0.2, Redux 3.6.0, redux-form 6.4.1, Axios 0.18.1, Webpack 1.14.0/Babel 6, AdminLTE 2.3.6, Bootstrap/jQuery via AdminLTE, Font Awesome/Ionicons. Chart.js 2, datalabels, react-select, react-loading, react-tooltip e moment-timezone complementam a UI. Muitas bibliotecas de runtime estão em devDependencies; instalação apenas de production dependencies não basta para recompilar.
- `package-lock.json` v1 versionado; node_modules preexistente. Sem engines no frontend. Versões instaladas não foram auditadas contra uma instalação limpa.
- `webpack.config.js`: entrada única, bundle app.js e CSS extraído em public, sem lazy loading configurado, loaders de fontes/imagens e aliases para AdminLTE/jQuery. Define NODE_ENV conforme execução via webpack-dev-server, não pela variável externa. Dev server porta 8080. `src/consts.js` escolhe localhost:3000 no dev e endpoint Heroku no build production. Não há configuração pública arbitrária de URL por ambiente.
- `public/index.html` carrega jQuery 3.5 e socket.io global antes do bundle; dependências também introduzem jQuery do AdminLTE. Risco de coexistência de versões/globais. SignalR está em arquivo auxiliar, sem consumidor encontrado; scripts SignalR não estão carregados pelo index atual. Cópias de index/consts não são entradas do Webpack.
- `public/app.js`, `public/app.css`, fontes e imagens estão versionados. Não se comprovou correspondência do bundle publicado ao fonte. Build padrão sobrescreveria esses artefatos; o check foi redirecionado a diretório temporário.
- `Procfile`: `web: http-server -p $PORT`, sem diretório explícito public. Hipótese: comando pode servir a raiz em vez da raiz desejada; diretório de execução/configuração da hospedagem precisa ser confirmado. README só identifica o projeto. Não encontrados workflows CI, Docker ou testes versionados; não há evidência de execução remota ou configuração atual de deploy.
- Direção já prescrita: React + TypeScript estrito + Vite + MUI/Emotion + React Hook Form + TanStack Query, por funcionalidade. Versões da referência são fotografia de outro sistema e não foram verificadas para adoção. Escolha final pertence ao planejamento. Não remover Redux antes de cobrir todos os usos compartilhados.

## Áreas e comportamentos observados

| Área e fontes | Recursos/regras/dependências | Cobertura e risco |
| --- | --- | --- |
| Sessão: src/auth/*, src/main/authOrApp.jsx | Login login/senha, validateToken, storage _application_user, header authorization token direto, logout com reload; socket recebe identidade completa | Sem refresh/SSO/cookie implementados; parsing de storage sem proteção; login novo emite em socket cuja criação depende de usuário prévio: risco de socket indefinido |
| Layout/rotas: src/main/routes.jsx, src/common/template/* | Shell AdminLTE, menu por tipo, perfil, logout, contatos/marca; todas as páginas sob AuthOrApp | Nenhum guard por papel nas rotas. Contato no menu usa caixa diferente da declaração; verificar aliases/case no navegador |
| Dashboard: src/dashboard/* | Assembleia ativa, quórum/votos por classe, cards monetários/percentuais, Chart.js, atualização 10s | Fórmulas e cores divergem entre cards e gráficos; Charts criados novamente sem destroy; resConfPres usado por ata |
| Assembleias/classes: src/assembleia/*, src/classe/* | Listagens, pesquisa por descrição nas assembleias, ativo e cálculo P/Unitário | Rotas existem embora links estejam comentados; não são CRUD de manutenção |
| Credores: src/credor/* | Quatro classes 1–4, nome/CPF-CNPJ/valor/procurador, total por grupo, online, presença e voto cruzados com listas | Ordenação alfabética apenas classes 1–3; presença deriva de existência de voto; votou deriva de tipo diferente de vazio; não simplificar estes cruzamentos |
| Presença: src/confirmarpresenca/* | Busca Enter, exclui confirmouPresenca=true e apenasProcurador=true, filtro procurador se tipo !=1, confirmar individual e todos sequencial, janela podeConfirmar a cada 5s | Lote opera sobre lista atual/filtrada e para no erro. Botões não bloqueiam operação em curso; servidor pode receber confirmações concorrentes |
| Votação: src/votar/* | Opções S/N/A; lista por procurador; pergunta/janela podeVotar a cada 5s; individual e todos sequencial só pendentes | Sem confirmação adicional ou trava de envio; UI oculta botões depois do sucesso; repetir lote simultaneamente pode duplicar/alterar voto |
| Votos: src/voto/* | Lista por ordem decrescente, pesquisa nomeCredor, só tipos preenchidos renderizados, moeda e percentual 4–6 casas | Não há paginação na UI; mensagem de vazio usa lista bruta, não lista filtrada por tipo |
| Tempo real: src/votacaotemporeal/* | Polling 3s por ordem__gt, deduplica _id e antepõe novos, cores por S/N/A | Cursor calculado pela lista anterior, não pelos novos itens; pode repetir leituras. Registro já conhecido não é substituído quando muda |
| Resultados: src/resultado/* | Lista ordenada por classe, pergunta ativa; tipoResultado V exibe subtotais/total; demais exibem tabela | Classes 1/4 usam valor ou quantidade conforme modo; classes 2/3 mostram ambos; percentuais 4–6 casas, destaque comparando percValorSim/Nao. Não recalcular regras do servidor no frontend |
| Ata: src/aprovaata/* | Assinar (somente aprovação na UI), quatro grupos, secretário/recuperanda, dashboard de presentes; refresh por eventos; podeAta a cada 5s | quantMeEpp conta toda lista, demais contam aprovou; regra de cor verde quant>=2 OU quant==total; exige revisão, sem correção implícita |
| Chat: src/chat/* | GET inicial limit=300, POST e eco por Socket.IO, rolagem/foco, Enter envia, carimbo de última leitura | Mensagem privada e consulta myChats comentadas; payload ainda contém privateMessageTo={}. Não presumir privacidade. Campo apagado antes da resposta, sending é indicador sem trava; eventos podem duplicar mensagens |
| Notificações: src/notificacao/*, src/main/app.jsx | Badge chat via polling 5s e lastRead; tela distinta de notificações administrativas, busca, lido=false, alternar leitura e ler todos sequencial | Leitura do chat persiste globalmente, sem escopo por usuário/assembleia. Acúmulo no reducer não é cache deduplicado |
| Online/logs: src/onlines/*, src/logAcesso/* | Lista sockets, expulsão por id/todos, logs limit=300, heartbeat POST 30s | Menu administrativo não equivale a autorização; listeners sem remoção; resposta do heartbeat no servidor antecede persistência |
| Links: src/link/*, src/link-util/* | CRUD inline descricao/url, reconsulta em sucesso e erro; links úteis só leitura; abrir nova aba | PUT envia objeto inteiro selecionado; POST _id=null; sem validação/trava/confirmação de exclusão; erros silenciosos; links sem rel explícito |
| Login legado: src/login/Login.jsx | Rota login protegida pela sessão principal, GET usuarios com login/senha na query, storage usuarioLogado, setUser | Não confundir com login principal; import '../login/login' diverge de Login.jsx em caixa e pode quebrar em filesystem sensível a caixa |
| Contato: src/contato/*, src/auth/auth-contact.jsx | Texto/telefone/e-mail estáticos e logos | Preservar identidade/conteúdo; consistência do texto depende de revisão do produto |

## Rotas, permissões e isolamento

`src/main/routes.jsx` usa hashHistory: `/#/`, `/#/assembleias`, `/#/classes`, `/#/credores`, `/#/votos`, `/#/confirmarPresenca`, `/#/votar`, `/#/login`, `/#/votacaoTempoReal`, `/#/chat`, `/#/online`, `/#/logacesso`, `/#/notificacoes`, `/#/resultado`, `/#/aprovaAta`, `/#/Contato`, `/#/links`, `/#/links-uteis`. Desconhecidas redirecionam à raiz. Não há segmentos de detalhe ou paginação na URL. Não trocar o formato de deep links sem decisão. Reentrada autenticada, refresh, voltar/avançar e manutenção do destino após login ainda precisam de teste.

`tipo===1` identifica administração no menu. Somente online/logs/notificações/links são condicionados ali. Rotas continuam acessíveis por deep link. Presença/votar filtram codigoProcurador pelo codigoCredor de não administradores; no backend original validadorVoto permite administrador, próprio credor OU procurador. Essa diferença entre seleção da lista e permissão por registro merece teste com credor sem representação. Não há organizações declaradas no front; escopo real é identidade/credor/assembleia. Não inventar tenant.

Estado da assembleia tem fontes concorrentes: default 5, storage, usuário do login e consulta ativo=true (em render de AuthOrApp e no dashboard). Risco de consultas com assembleia anterior ou aplicação de resposta tardia. Backend usa assembleia ativa também em operações sem código no payload. Não há limpeza explícita de todos os storages no logout nem isolamento de cache por identidade.

No backend original, middleware autentica JWT, mas getters genéricos consultados e handlers Socket.IO não apresentam autorização por papel/assembleia. Votar/confirmar têm validação específica. O frontend não deve afirmar garantir isolamento remoto, nem alterar esses contratos unilateralmente. Há mecanismos legados sensíveis no código original de autenticação; valores não reproduzidos neste pacote. Nenhum segredo/ambiente real deve entrar em fixtures.

## Formulários, cache, arquivos e UX

- Login usa redux-form, sem validação local configurada ou submitting ligado ao botão. Cadastro existe em actions, porém loginMode de render é fixado true e alternância está comentada. Signup não é recurso visual ativo.
- Links usam estado local; chat e login legado leem DOM/jQuery. Pesquisas são disparadas por Enter, com regex interpolada sem codificação explícita. Texto com caracteres reservados pode alterar query; não mudar sem testar compatibilidade.
- Não há TanStack Query ou cache HTTP deliberado no código. Redux guarda dashboard, sessão, tabs, formulário, toastr e notificações; listas estão em state local. Store de tabs existe, sem consumo encontrado nas páginas de negócio. Não foi observado requisito offline.
- Polling e sockets coexistem; sem AbortController, proteção geral de respostas tardias, retry explícito ou timeout Axios. Muitos GETs sem catch deixam loading ativo; catches de escrita assumem response.data.errors e falham em erro de rede. Timers são neutralizados trocando métodos em vez de clearTimeout; listeners registrados não são removidos por off e podem continuar chamando callbacks capturados.
- Não encontrados fluxos ativos de upload, anexos, download/exportação ou FormData. Arquivos observados são recursos estáticos de public e fontes/imagens dos loaders. Assinar ata é POST de manifestação, não upload/PDF/assinatura criptográfica observada.
- Teclado: Enter em buscas/chat/login; faltam labels associados em muitos inputs e nomes acessíveis em botões de ícone. Dropdown de usuário depende de mouseleave; fluxo de foco, Tab/Escape e leitor de tela não foi verificado.
- Responsividade: grid Bootstrap, meta viewport, sidebar offcanvas, tabelas extensas com larguras fixas, scroll de 100% e footer fixo; chat com bolhas 60% e campos em col-md. Sem homologação em celular/zoom; MUI deve manter todos os dados e ações.
- Datas: util recorta HH:mm:ss e oculta sentinela 1899-12-30T00:00:00.000Z. Horários de abertura removem timezone ao usar substr(0,19) e Date local. Valores BRL e percentuais 4–6 casas; tipos numéricos são assumidos por toLocaleString. Não normalizar datas históricas ou precisão sem decisão.

## Testes e integração

Não há testes unitários, componentes ou navegador versionados, nem scripts test/lint/typecheck. Apenas `npm run dev` (watcher) e `npm run production` (finito) existem. Nesta etapa não se instalaram bibliotecas ou escreveram testes.

Build original executado com Node v24.21.0/npm.cmd 11.19.0, dependências preexistentes e override de output-path temporário: exit 0, Webpack 1.14.0, hash adda313c43a66ad871e2, 18.628s, app.js aproximadamente 1,53 MB e CSS 352 kB, com avisos UglifyJs. Não prova instalação limpa, portabilidade Linux ou equivalência do artefato publicado. Nenhum watcher iniciado.

API simulada: não executada. API real: não executada. Original backend disponível por commit, mas ambiente de teste exclusivo não foi demonstrado. `src/config/database.js` original aceita MONGODB_URI e tem fallback de banco local; não iniciar esse fallback. Ensaio futuro exige cópia isolada do commit original, segredo sintético fora do versionamento, MongoDB exclusivo identificado, dados sintéticos/anonimizados e portas/configuração separadas. Não esperar a migração do backend. Sem credenciais de produção, sem reset do outro checkout e sem operações de produção.

Proteção futura deve cobrir presença → voto → resultado → ata; credor/próprio/procurador/admin; múltiplas assembleias; lote filtrado com erro intermediário; duplo clique e duas abas; reconexão e eco socket; GETs fora de ordem; storage inválido; sem ativo; datas sentinelas; precisão/zero; filtros e limites; rotas ocultas; mobile/teclado. Mocks verificam UI/contrato, integração real verifica CORS, eventos, persistência e efeitos colaterais; um não substitui o outro.

## Riscos e decisões materiais

| ID | Pergunta para revisão | Consequência sem resposta |
| --- | --- | --- |
| D1 | A rota de login legado e as rotas assembleias/classes sem menu continuam necessárias? | Preservar todas no inventário; não remover. O GET de credenciais requer decisão explícita antes de redesenhar |
| D2 | Qual a matriz desejada de acesso às consultas, logs, expulsão, links e dados de credores por perfil/assembleia? | Documentar implementação atual; não prometer isolamento nem restringir recursos unilateralmente. Correções remotas estão fora deste chat |
| D3 | Podemos corrigir contagem Me/Epp da ata, cores/percentuais e interpretação de timezone, ou são comportamentos que devem permanecer? Qual semântica dos horários históricos? | Registrar como divergências; preservar até decisão, criar exemplos esperados no planejamento |
| D4 | “Todos” deve continuar atuando só na lista filtrada? Após erro de rede em presença/voto/ata, qual confirmação o usuário deve receber antes de tentar novamente? | Não transformar em lote global nem reexecutar automaticamente escritas; proposta de proteção precisa preservar resultado parcial |
| D5 | Qual ambiente original de teste exclusivo pode ser usado, com quais perfis/fixtures sintéticas e volume representativo? | Planejamento independente continua; homologação real permanece pendente, sem usar banco local desconhecido/produção |
| D6 | Qual hospedagem, subcaminho e navegadores/dispositivos suportados? Os links com hash devem permanecer compatíveis? | Manter URLs atuais como referência; não escolher rewrite/BrowserRouter ou remover globais sem verificar compatibilidade |

Não há mudança intencional de comportamento aprovada. Melhorias de erro, acessibilidade, concorrência, cache e sessão devem aparecer como propostas explícitas no planejamento. Encerrar esta etapa para revisão; não iniciar preparação ou migração.

## Caracterização complementar FRONT-01 — 18/10/2026

Suíte isolada de navegador com HTTP/socket simulados em migration-tests confirma os consumidores críticos sem alterar fontes. Primeiro login sem sessão emite em socket ausente no reducer, e catch da action provoca reload com sessão já persistida; depois há validação da sessão. Não é evidência de sucesso direto sem recarga. Outros diagnósticos reproduzidos: filtro do credor próprio como procurador, contagem Me/Epp não aprovada e dois POSTs após clique concorrente. Todos permanecem pendentes de decisão, separados dos contratos de regressão úteis.

Desktop/mobile da suíte são cobertura funcional automatizada, não homologação manual completa, dispositivo real ou auditoria de acessibilidade. Sem API real/backend/banco nesta etapa; resultados sintéticos não confirmam apuração ou persistência. Resultado quantitativo e arquivos no checkpoint atual de 04-progresso.md.
