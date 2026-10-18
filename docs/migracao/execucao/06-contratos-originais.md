# Contratos originais do frontend

Data: 11/10/2026. Inventário de compatibilidade, não proposta de API nova.

## Origem e limites de evidência

Frontend original: `41478a83b74a8d27c7058a1d79b2ed1deab271c3`. Checkout analisado: HEAD `e326a9c9b33cfc5e19553209a737d4c7285c8527`, branch `migracao-arquitetura-front`. `git diff 41478a8 HEAD -- src package.json webpack.config.js` vazio; diff global contém somente documentação. Backend original: `d1bd37e031d8b699a8dd5a33e039b4ef8a861c8a`, lido por `git show`, sem checkout, uso de documentos em execução, leitura de .env ou acesso a banco.

Evidência principal: consumidores src na referência acima. Evidência complementar: backend original `src/config/routes.js`, `auth.js`, `cors.js`, `socketio.js`, services de usuario/auth, voto/validadorVoto, aprovaAta, chat, logAcesso, link, notificacao e assembleia. Não há testes versionados no front. Não houve captura de tráfego ou integração real. Status não especificados explicitamente no código de handlers genéricos permanecem pendentes de ensaio; não inferir envelopes/status somente de Axios.

## Transporte, autenticação e erros

- `src/consts.js`: host dev `http://localhost:3000`, host build production `https://gladius-portalvotacao-back.herokuapp.com`; API sob `/api`, autenticação sob `/oapi`. São valores de código, não confirmação de disponibilidade. Não foi feita chamada remota.
- `src/index.jsx`: URL_API termina em `/`. Consumidores que acrescentam `/` podem emitir `/api//...`; outros concatenam diretamente. Matrizes abaixo usam caminho lógico com barra simples; normalização e barras finais precisam de teste de proxy/servidor antes de alteração.
- `src/main/authOrApp.jsx`: Axios global `authorization: user.token`, token direto, sem Bearer, cookies ou refresh configurados no frontend. O original backend aceita esse token e retorna 403 com `{errors: [...]}` quando ausente/inválido; não substituir por 401 por convenção.
- Axios serializa objetos como JSON; corpo vazio nas chamadas sem segundo argumento. Sem interceptor, timeout, retry ou cancelamento explícitos compartilhados.
- Escritas de presença/voto/ata/chat/notificações esperam `response.data.errors` iterável em erro. Login também trata errors[]; outros erros de login recarregam a página. GETs geralmente não tratam falha. Links reconsultam inclusive no catch e silenciam erro. Erros de rede não têm envelope HTTP: registrar lacuna da UI.

## Autenticação

| Método/caminho | Entrada | Saída/erro conhecido | Fonte frontend |
| --- | --- | --- | --- |
| POST /oapi/login | `{login, senha}` do authForm; demais valores redux-form podem existir | Backend res.json (200): `{id,nome,login,codigoCredor,codigoAssembleia,codigo,tipo,token}`; inválido ou assembleia incompatível 400 errors[] | src/auth/auth.jsx, authActions.js |
| POST /oapi/validateToken | `{token}` | 200 `{valid:boolean}`; falha de transporte no front vira TOKEN_VALIDATED=false | src/auth/authActions.js |
| POST /oapi/signup | Valores `{nome,email,login,senha,confirm_senha}` | Action existe, UI não oferece cadastro; original contém inconsistências de variáveis, sucesso não garantido | src/auth/auth.jsx, authActions.js |
| GET /api/usuarios | `sort=-_id&login=<texto>&senha=<texto>` | Lista, escolhe [0] e verifica _id; guarda documento em usuarioLogado | src/login/Login.jsx |

JWT original dura um dia; não incluir token real em fixtures. Não reproduzir dados sensíveis internos do token no pacote. Login legado é distinto da sessão principal e não deve ser confundido com endpoint de login público.

## Leituras por módulo

Notação: A = window.Params.codigoAssembleiaAtiva; C = usuário.codigoCredor; T = texto digitado; L = última leitura; O = ultimaOrdem. Parâmetros regex são construídos literalmente como `/T/` sem escape próprio. Listagens consomem array direto `resp.data`, sem `{items,total}`. Ausência de paginação visual não comprova ausência de limite/default no node-restful.

| Consumidor/fonte | GET lógico e parâmetros |
| --- | --- |
| AuthOrApp, dashboardActions, resultado | `/api/assembleias/?ativo=true`; primeiro item é assembleia ativa; AuthOrApp consulta dentro de render |
| assembleia/assembleia.jsx | `/api/assembleias?param=true&sort=-ativo[&descricao__regex=/T/]` |
| classe/classe.jsx | `/api/classes?sort=-_id` |
| credor/credor.jsx | `/api/credores/?codigoAssembleia=A&sort=-_id[&nome__regex=/T/]`; depois `/api/votos/?codigoAssembleia=A&sort=-_id[&nomeCredor__regex=/T/]` |
| confirmarpresenca/confirmarPresenca.jsx | `/api/credores/?codigoAssembleia=A&sort=-_id[&nome__regex=/T/]&confirmouPresenca__ne=true&apenasProcurador__ne=true[&codigoProcurador=C se tipo!=1]` |
| votar/votar.jsx | `/api/votos?codigoAssembleia=A&sort=-_id[&nomeCredor__regex=/T/][&codigoProcurador=C se tipo!=1]` |
| voto/voto.jsx | `/api/votos/?codigoAssembleia=A&sort=-ordem[&nomeCredor__regex=/T/]` |
| votacaotemporeal/votacaoTempoReal.jsx | `/api/votos/?codigoAssembleia=A&ordem__gt=O&sort=-ordem` |
| Presença/votar/ata/tempo real | `/api/assembleias/?codigo=A`; primeiro item usado para janelas/pergunta. Poll 5s nas três primeiras, leitura inicial no tempo real |
| dashboard/dashboardActions.js; aprovaata/aprovaAta.jsx | `/api/votos/dashboard` (ata usa barra final); sem filtro A no request; dashboard 10s, ata inicialmente |
| resultado/resultado.jsx | `/api/resultados/?codigoAssembleia=A&sort=codigoClasse` |
| aprovaata/aprovaAta.jsx | `/api/aprovaAtas/?codigoAssembleia=A&sort=-_id[&nomeCredor__regex=/T/]` |
| chat/chat.jsx | `/api/chats/?codigoAssembleia=A&sort=data&limit=300` |
| notificacao/notificacaoActions.js | `/api/chats/?codigoAssembleia=A[&data__gt=L]&sort=data&limit=300`; acrescenta data__gt conforme heurística anoValido; polling 5s |
| notificacao/notificacao.jsx | `/api/notificacoes?sort=-_id[&mensagem__regex=/T/][&lido=false]` |
| logAcesso/logAcesso.jsx | `/api/logsAcessos?codigoAssembleia=A&sort=-data&limit=300` |
| link/link.jsx, link-util/link.jsx | `/api/links?sort=-_id` |

`myChats` e `usuarios/chat` estão comentados no chat; não são requests ativos. SignalR auxiliar não tem consumidor encontrado. Online usa sockets, contato é estático.

## Escritas e efeitos colaterais

| Método/caminho | Payload exato ou montagem observada | Resposta e efeitos | Fonte |
| --- | --- | --- | --- |
| POST /api/votos/confirmar | `{_id:credor._id}` | Backend 200 documento de voto; cria voto tipo vazio, marca credor confirmouPresenca e cria notificação. Erros de janela/permissão/gravação 500 errors[]. Front remove credor da lista e emite confirmouPresenca após sucesso | src/confirmarpresenca/confirmarPresenca.jsx; backend votoService/validadorVoto |
| PUT /api/votos/votar | `{_id:todo._id,tipo:'S'|'N'|'A'}` | Backend 200 voto atualizado, sincronizado=false/votoOnline=true e notificação. Janela/permissão 500 errors[]. Front altera tipo local e emite votou com registro | src/votar/votar.jsx; backend votoService/validadorVoto |
| POST /api/aprovaAtas/aprovar | Sem corpo | Backend 200 `{Ok:true}` ao fim; usa credor do token/representados na assembleia ativa, cria ou atualiza manifestações aprovou=true/sincronizado=false. Sem credor: 500 errors[]. Front emite aprovarata. podeAta é trava visual; não foi encontrada validação correspondente no service original | src/aprovaata/votoAction.jsx; backend aprovaAtaService |
| POST /api/chats/ | `{codigoAssembleia:A,codigoCredor:usuario.codigoCredor,msg,nomeCredor:usuario.nome,idUsuario:usuario.id,privateMessageTo:objeto,codigoCredorDest:privateMessageTo?privateMessageTo.codigo:null}` | privateMessageTo inicial {}; codigoCredorDest pode ficar undefined e ser omitido no JSON. Documento retornado emitido em sendMessage; render depende do eco newMessage. Schema original não declara privateMessageTo. Status exato de POST genérico não verificado | src/chat/chat.jsx; backend chat.js/chatService |
| PUT /api/notificacoes/:id | `{lido:boolean}` | Front altera estado local e pode continuar lote. Service original usa new:true/runValidators:true; status e payload completo a confirmar em teste | src/notificacao/notificacao.jsx |
| POST /api/logsAcessos/register | Sem corpo | 200 `{ok:true}` emitido antes da gravação; upsert de acesso por idUsuario se token possui codigoAssembleia/codigoCredor | src/logAcesso/logAcessoRegister.js; backend logAcessoService |
| POST /api/links/ | Objeto editing, `_id:null` em criação; descricao/url conforme edição; campos não preenchidos podem ser omitidos | Front limpa edição e recarrega; mesmo no erro. Status/documento genérico a confirmar | src/link/link.jsx |
| PUT /api/links/:id | Objeto inteiro selecionado, não apenas descricao/url; `_id` mantido | Reconsulta/limpa edição; campos extras do documento podem ir no request | src/link/link.jsx |
| DELETE /api/links/:id | Sem corpo | Reconsulta em sucesso/erro; sem confirmação visual | src/link/link.jsx |

Presença/voto/notificações “todos” iteram sequencialmente sobre a lista atual filtrada, interrompendo a cadeia no catch; não existe endpoint de lote consumido. Não há lock para iniciar duas cadeias ou retry automático. Abortar request não desfaz escrita recebida. Original votar não impede segunda alteração de tipo; UI impede somente após resposta. Não presumir idempotência, atomicidade de lote ou proteção contra duplicatas.

## Campos consumidos e formatos históricos

| Recurso | Campos exigidos pelo consumidor, além de _id quando usado |
| --- | --- |
| Sessão | id, nome, login, tipo, codigoCredor, codigoAssembleia, codigo, token; navbar tenta email embora login original não o retorne |
| Assembleia | codigo, descricao, assunto, data, ativo, inicioConfPres, inicioVotacao, podeConfirmar, podeVotar, podeAta, pergunta |
| Classe | descricao, tipo (P percentual, demais unitário) |
| Credor | codigo, codigoClasse, descricaoClasse, nome, cpfCnpj, valor numérico, codigoProcurador, nomeProcurador; flags de presença/apenasProcurador nos filtros |
| Voto | codigo, nomeCredor, codigoProcurador, nomeProcurador, descricaoClasse, valor, percentualClasse numéricos, tipo vazio/S/N/A, data string, ordem; votarList também tenta cpfCnpj |
| Dashboard | quorum2/votos2 arrays: codigoClasse, descricaoClasse, valorEsperado, valorConfirmado; ata lê resConfPres com codigoClasse/quant. Campos quorum/votos permanecem no reducer legado |
| Resultado | codigoClasse, descricaoClasse, tipoResultado, valorCredito, quantCredores, valorSim/Nao/Abs, quantSim/Nao/Abs, percValorSim/Nao, percQuantSim/Nao; primeiro item contém valorSubTotalSim/Nao, percSubTotalSim/Nao, valorTotalGeral |
| Ata | codigoClasse, descricaoClasse, nomeCredor, nomeProcurador, aprovou, secretario, empresaRecuperanda; listagem usa data |
| Chat | codigoAssembleia, codigoCredor, msg, nomeCredor, idUsuario, data; campos de destinatário no request, sem UI ativa de seleção |
| Notificação | mensagem, tipo, data, lido |
| Logs | nome, data, dataUltimoAcesso, tipo (0 login; demais logout no texto, cor específica para 1) |
| Links/online | Links descricao/url; online id/nome/codigoCredor |

Tipos completos devem ser extraídos/validados no planejamento; esta projeção não é schema universal. Dados ausentes, null, strings numéricas, arrays vazios e zero precisam de fixtures. Não há exemplos reais anonimizados disponíveis.

Datas em `src/common/util/dateTimeConversor.js`: oculta sentinela `1899-12-30T00:00:00.000Z`, senão substr(11,8), sem conversão de fuso. Aberturas no dashboard/presença/voto usam substr(0,19) e Date local. Chat lastRead inicial usa outra sentinela `1899-12-30T21:05:19.000Z`. Valores BRL e percentuais 4–6 casas; não arredondar payloads nem alterar horários silenciosamente.

## Socket.IO e sessão persistida

Conexão `io(window.Params.URL_API)` via global do script public/socket.io.js; backend original namespace `api/`. Não há auth handshake JWT ou rooms por assembleia observados no código original; setUser recebe objeto fornecido pelo cliente. Não presumir autorização/privacidade de eventos.

| Direção | Evento e payload | Efeito/consumidor |
| --- | --- | --- |
| Servidor → cliente → servidor | getUser → setUser(objeto usuário) | Identidade associada ao socket; setUser também emitido após login principal/legado |
| Servidor → cliente | usuarioOnline({id,nome,...}) | Toast para usuário diferente |
| Cliente → servidor → clientes | getConnectedUsers → connectedUsers(array de usuários) | Online e credores, consulta inicial após 500ms |
| Cliente → servidor → clientes | confirmouPresenca(credor) → confirmacaoPresenca(credor) | Toast administrativo |
| Cliente → servidor → clientes | votou(voto) → voto(voto) | Toast administrativo |
| Cliente → servidor → clientes | sendMessage(documento retornado) → newMessage(documento) | Acrescenta mensagem, rola, atualiza leitura |
| Cliente → servidor → clientes | aprovarata sem payload → aprovouata sem payload | Ata reconsulta lista |
| Servidor → cliente | reprovouata sem payload | Ata reconsulta; reprovação não oferecida pela UI |
| Cliente → servidor → clientes | expulsarTodos → expulsar; expulsarId(id) → expulsarId(id) | Redireciona para site Gladius; expulsar limpa sessão, expulsarId só redireciona |
| Servidor → cliente | derrubar({id,message}) | Alert, remove sessão, reload; emissão correspondente comentada no original |

Listeners não são removidos explicitamente. Sem teste de reconexão, ordem/duplicação ou desconexão durante escrita. Eventos não garantem persistência e não devem substituir resposta HTTP.

Storage: `_application_user` JSON da sessão; `codigoAssembleiaAtiva` escopo; `_chat_notify_last_read` string temporal; `usuarioLogado` JSON do login legado. Redux: auth, dashboard, tab, form, toastr, notificacao. Não existem keys por identidade/assembleia ou listener storage multiaba. Reentrada com storage inválido pode falhar no JSON.parse. Mudar essas chaves exige tratamento de compatibilidade/limpeza explícito.

## Compatibilidade a validar

Preservar métodos/caminhos, formato hash e caixa das rotas de `src/main/routes.jsx`, filtros/ordem/limite, token direto, errors[], S/N/A, datas/precisão e efeitos após sucesso. Query param param=true e barras duplicadas/finais não devem ser descartados por parecerem redundantes sem ensaio. Autorização visual não prova autorização do servidor. Respostas genéricas node-restful, filtros regex especiais, limites implícitos e portabilidade do import login/Login precisam de caracterização.

Nenhuma chamada externa, API simulada, integração com MongoDB ou operação de produção realizada. Para confirmar contratos restantes, usar API original isolada com banco e dados exclusivos de teste. Documentar diferenças como mudanças propostas e submetê-las à revisão; não depender de commits da migração do backend.

## Evidência complementar FRONT-01 — 18/10/2026

Fonte frontend continua idêntica ao original 41478a83b74a8d27c7058a1d79b2ed1deab271c3, protegida por diff no início do harness. migration-tests/ caracteriza consumidor no navegador com HTTP/Socket simulados: token direto, filtros/ordem/queries, payload presença/voto/ata, janelas, evento após resposta e renderização de resultados. Nenhum acesso ao backend nesta etapa; status/respostas sintéticos não comprovam status node-restful ou efeitos persistidos. Lacunas de integração original permanecem.

Diagnósticos separados: primeiro login passa por reload após socket ausente; credor próprio filtra codigoProcurador; Me/Epp conta manifestação não aprovada; clique concorrente gera dois requests. Evidência de comportamento atual não aprova correção nem transforma defeito em contrato de entrega. D1–D6/M1–M5 sem resposta. Código/runtime da aplicação inalterados.
