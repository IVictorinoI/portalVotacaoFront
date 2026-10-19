# Adaptação do frontend à API Nest

## Fonte e escopo

Orientações anexadas pelo usuário em18/10/2026, implementadas mediante pedido explícito. Não houve leitura da pasta do backend. O contrato original em06-contratos-originais.md permanece como referência histórica; as diferenças abaixo são intencionais para a API nova. Referência Git antes desta correção:6225673; alterações anteriores de login foram preservadas. Sem publicação ou alteração do backend.

## Alterações implementadas

- HTTP autenticado usa Authorization: Bearer, sem acrescentar token em URL/corpo de negócio. validateToken mantém corpo próprio do endpoint.401 de uma requisição da identidade atual encerra sessão, cache, timers e socket; resposta antiga não encerra identidade nova.403 é exibido como erro de autorização sem renovar token/logout. Escritas não recebem retry automático.
- Socket.IO cliente4.8.4 e servidor sintético4.8.4; tipos nativos substituem @types antigos. Namespace /api/, handshake auth.token, sem identidade em setUser. Reconexões de transporte limitadas a3;401 explícito no erro e desconexão administrativa encerram sessão. A fixture candidata exige CORS explícito para sua origem local; isso não configura CORS do backend.
- Sucessos de presença/voto/ata/chat não emitem mais confirmouPresenca/votou/aprovarata/sendMessage. Escritas HTTP e invalidação de cache continuam; eventos recebidos e deduplicação por_id permanecem. Expulsar por ID e expulsarTodos são comandos administrativos preservados.
- Chat envia apenas msg. Nome/autor/assembleia são definidos pelo servidor, sem destinatário privado. Resposta HTTP entra no histórico com deduplicação; rascunho/reconsulta após falha continuam.
- Administrador pode não ter codigoCredor/codigoAssembleia no login, sem inventar códigos. Campos presentes são validados. Múltiplas assembleias ativas produzem erro de escopo, sem escolher a primeira. A API continua definindo a ativa.
- Horários com fuso explícito usam Date e America/Sao_Paulo, sem remover Z nem subtrair3h. Sentinela histórica vazia é preservada. Fórmulas, cores e regras de classes não mudaram.
- Tela informa voto online definitivo; votoOnline=true não permite nova escolha mesmo se tipo vier vazio. Lotes continuam filtrados, sequenciais, com trava e interrupção/reconsulta após erro.
- Controles de edição/exclusão de links e expulsão são visíveis somente para tipo1. Menus administrativos já eram restritos. Isso não é autorização de servidor nem interpretação de JWT. Rotas/deep links são preservados.
- Falha no login mostra erro e mantém formulário, sem reload. errors[] permanece tratado independentemente dos códigos400/401/403/404/409/429/503; sem repetir escritas.

## Fora desta alteração

Não há UI de cadastro público, importação de lotes/Delphi, remoção administrativa de votos ou edição de índices; nenhuma foi criada. Basic é exclusivamente integração técnica e não deve entrar no frontend. Sem migração de dados, índices ou credenciais.

Listagens e histórico mantêm limites atuais; navegação em conjuntos maiores que300 não foi adicionada nesta adaptação de transporte. É uma lacuna de produto a validar com volume representativo. Histórico privado legado e registros sem fuso explícito precisam de amostras anonimizadas e homologação: o anexo não especifica URL completa/shape de myChats nem autoriza adivinhar rota. Não foi feita troca especulativa desse endpoint. Novo signup sem vínculo também não tem fluxo nesta UI.

## Verificação e retomada

npm.cmd run check:62 testes unitários, TypeScript/build/format e8 HTTP/runtime aprovados. Regressão Chrome completa contra fixture candidata:132/132 aprovados em3,1min, desktop e viewport mobile. Não é prova de integração real. Baseline original e fixtures originais permanecem intactos. As expectativas candidatas mudam explicitamente para Bearer/UTC/autoria e ausência de anúncios do cliente, não para esconder incompatibilidades.

Sem teste automatizado na API local real ou dados do usuário. Frontend manual já iniciado em http://127.0.0.1:8080, com API http://localhost:3000/api, oapi http://localhost:3000/oapi e Socket http://localhost:3000/api/. Recarregar após alteração de dependências. Homologação/integração real/reversão operacional continuam sem conclusão declarada.

## Correção posterior: junção de URLs

Após404 reportado pelo usuário em/api//assembleias/, a fronteira entre base de API e caminho passou a usar exatamente uma barra. Exemplo:base http://localhost:3000/api e caminho //assembleias/?ativo=true geram http://localhost:3000/api/assembleias/?ativo=true. Query e barra final são preservadas, inclusive URLs/regex dentro da query. Essa mudança substitui a concatenação literal legada para a API Nest; fixtures e testes originais permanecem históricos. Consultar04-progresso.md para resultado final desta correção.
