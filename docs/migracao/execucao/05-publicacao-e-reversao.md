# Publicação, compatibilidade e reversão

12/10/2026 — PROCEDIMENTO PROPOSTO. Não executar produção, deploy, backup/restauração de banco ou alteração de dados nesta etapa. Escopo deste chat: frontend. [Plano](00-plano.md), [validação](03-validacao.md), [contratos](06-contratos-originais.md).

## Premissas e bloqueios

Uma entrega completa após FRONT-14, checkpoints/commits internos anteriores sem releases parciais. Hospedagem real, raiz estática, subcaminho, CDN/cache e navegadores ainda dependem D6; não inventar comando de deploy de provedor. `Procfile` original usa http-server sem public explícito; isso é lacuna, não confirmação da infraestrutura vigente. Planejar a candidata servida por dist explicitamente, sem expor raiz do repositório.

Compatibilidade se mede com backend ORIGINAL `d1bd37e031d8b699a8dd5a33e039b4ef8a861c8a` em teste isolado. Não exige Nest ou entrega da outra migração. Se o backend efetivo da futura entrega diferir do original, identificar a versão efetiva somente no gate final e ensaiar a mesma suíte; não vincular etapas a commits ainda inexistentes. Incompatibilidade material reabre revisão. Não alterar backend para fazer teste passar.

## Compatibilidade obrigatória

- Rotas existentes com hash, casing caracterizado, fallback, refresh/bookmarks/voltar/avançar e subcaminho. Não trocar URLs por conveniência de hosting.
- HTTP/token direto, métodos/URLs/barras/params, filtros/limites/ordem, null/omitido, status/errors[] e tipos/formatos históricos. Sem renomear endpoints ou acrescentar Bearer.
- Socket.IO namespace/eventos e protocolo original, logout/expulsões, reconexão sem reenviar escrita. Testar browser com bundle anterior e conexão aberta durante a troca.
- `_application_user`, `codigoAssembleiaAtiva`, `_chat_notify_last_read` e `usuarioLogado`: leitura da versão anterior, alterações só aprovadas. Proposta M3 usa marcador de leitura com escopo, mantendo marcador legado intacto até política revisada; não reescrever objeto de sessão num formato que o original não lê. Storage/cache não é backup de dados de negócio.
- Sem schema, índices, recriptografia, reset de credenciais ou migração de banco. Dados gravados pela nova UI devem continuar legíveis pela UI/backend original; validar isso no ensaio. Se algum formato novo se tornar necessário, exige plano/autorização específicos antes de implementação.
- Conteúdo estático: marca/fontes/logos, links úteis/externos e textos. Novo bundle não deve carregar arquivos antigos por coincidência de nome ou depender de public/app.js.

## Artefatos e backup propostos

| Item | O que preservar antes de qualquer futura publicação | Como verificar no ensaio |
| --- | --- | --- |
| Versão anterior | Artefato efetivamente servido, não apenas fonte Git; index, JS/CSS, fonts/imagens e configuração de serving/cache | Manifesto SHA-256, origem/data/responsável, startup e deep links |
| Fonte/ambiente | Commit fonte, lockfile, Node/npm, configuração pública por ambiente e build flags/base, dependências de serving | Reconstruir em cópia limpa, comparar manifestos; diferenciar build reproduzido do artefato publicado |
| Versão candidata | Dist imutável do commit validado e manifesto de assets; hashes de contratos/testes e relatório Q/R/manual | Instalar/build/testar em cópia limpa e servir exatamente o artefato ensaiado, sem recompilar no momento da troca |
| Configuração operacional | Host/base/CORS/origens/namespace/socket/cache/headers e comando de start aprovados | Reaplicar em ambiente de teste; nada de segredos em manifestos/logs |
| Dados do banco | Não operados pelo frontend. Responsável pelo banco define backup consistente e restauração, somente com autorização própria | Banco sintético exclusivo restaurado numa segunda instância/banco de teste, comparação de contagens/relacionamentos/totais/representação |
| Browser/storage | Compatibilidade de chaves e objeto de sessão; não coletar tokens/senhas de usuários | Storage sintético antes/depois, nova UI → UI anterior, logout/login e marcador de leitura |

Commit Git não substitui artefato de reversão. Não presumir que public/app.js versionado corresponde ao site publicado. RPO/RTO/retenção/local de backup e responsável de produção dependem D5/D6 e aprovação operacional; não atribuir números inventados.

No ensaio pode-se calcular manifesto com `Get-FileHash -Algorithm SHA256 -LiteralPath <arquivo-do-artefato>`; substituir o caminho por arquivo real previamente identificado. Não listar .env, tokens, fixtures reais ou logs sensíveis. Armazenar manifests/evidência sem segredos e arquivos volumosos em local ignorado/artefatos do ensaio. Os comandos de backup/restauração MongoDB dependem das ferramentas/topologia do ambiente e não foram verificados; devem ser concretizados pelo responsável e testados exclusivamente em banco próprio de teste, sem comandos genéricos de drop/restore contra URI desconhecida.

## Ensaio em teste (FRONT-14)

1. Confirmar D1–D6 afetadas, mudanças M aprovadas, ambiente/fixtures exclusivos e permissões. Registrar source hashes/configuração sanitizada e snapshot sintético. A cópia do backend nunca usa fallback de MONGODB_URI nem .env real.
2. Servir artefato anterior numa origem de teste e executar smoke; preservar sessão sintética/browser aberto e lista de chunks. Fonte original fixada não autoriza visitar produção.
3. Validar dist candidata, Q/R e matriz inteira: presença → voto → resultado → ata, chat/admin/links, todas as rotas, perfis/duas assembleias, dados históricos e browsers D6. Comparação com baseline usa bancos distintos/fixtures equivalentes quando houver escrita.
4. Ensaiar troca do artefato inteiro de maneira atômica oferecida pelo host de teste, sem mistura index novo/JS antigo. Política proposta: index revalidado, assets com hash imutáveis, reter chunks anteriores enquanto browsers antigos possam requisitá-los. Prazo exato depende D6; Vite preview é ferramenta local, não plano de servidor de produção.
5. Simular sessão expirada, chunk antigo requisitado, rede interrompida depois de escrita, socket desconectado e duas abas com versões distintas. Não recarregar automaticamente com mutation em andamento. Reconsultar resultado de escrita antes de nova tentativa.
6. Ensaiar gatilho de reversão, reativar artefato/configuração anterior, recarregar uma sessão sintética e conferir leitura dos dados gravados pela candidata, deep links e socket. Respostas/ações em voo são reconciliadas, não repetidas por suposição.
7. Restaurar snapshot sintético numa segunda área de teste sob controle do responsável, verificar integridade e documentar tempo/limites. Nenhuma restauração de produção está autorizada; rollback do frontend não requer restaurar banco por padrão.
8. Registrar resultados reais, falhas e mitigação; obter homologação. Sem R ou restauração/rollback demonstrados, etapa fica parcial e não gera autorização implícita de publicação.

## Gate de publicação futura

Exigir: todas as etapas revisadas, módulos sem placeholder, D1/D2/D4 com política aceita, D3 resolvida ou preservação explícita aceita, D5 ambiente real de teste, D6 host/browsers confirmados; Q/R/manual/ensaio aprovados; riscos conhecidos aceitos; alterações de produção ocorridas durante migração reconciliadas; artefato/configuração/hashes anteriores e novos identificados; responsável/ponto de decisão e comunicação operacional definidos pelo usuário.

Preparar procedimento específico do host com comandos reais e alvos concretos depois de D6; submetê-lo à autorização de publicação. Não há comando de deploy comprovado neste repositório, nem publish pelo prompt de planejamento/commit. Não fazer push ou enviar mensagens a terceiros.

Quando futuramente autorizada, publicação deverá: conferir backup/artefatos, evitar troca durante votação/assinatura/lote em curso conforme janela acordada, ativar somente pacote validado, verificar smoke sem escrita de negócio em produção e observar erros HTTP, assets/chunks/socket/sessão e relatos de usuários. Janela e duração de observação precisam de decisão operacional; não inventadas aqui.

## Reversão futura — gatilhos e limites

Gatilhos propostos: perda de deep link/login, falha generalizada de assets/socket, divergência de resultado/ata, envio repetido introduzido pela UI, dados de outra identidade visíveis no cache, regressão impeditiva em browser suportado. Limiares numéricos e autoridade de disparo serão acordados em D6; discrepância crítica deve interromper novas ações antes de ampliar impacto.

Procedimento: registrar incidente sem tokens/credenciais → confirmar versão/alvo e escritas em voo → responsável autoriza/aciona troca atômica para artefato e configuração anteriores preservados → verificar index/chunks/hash/socket/login/deep links → reconsultar gravações possivelmente aceitas pelo servidor antes de retomar lotes → observar e registrar resolução. Não usar git reset/checkout destrutivo no workspace compartilhado como deploy/rollback.

Reverter código não desfaz votos, presenças, mensagens, assinaturas ou leitura de notificações. Não restaurar banco automaticamente: isso apagaria gravações legítimas posteriores ao backup. Correção de dados exige investigação, plano e autorização própria do responsável. Chaves de leitura novas podem permanecer inertes para o legado; incompatibilidade de sessão deve ter saída de logout/login prevista e aprovada, nunca reset amplo do storage do usuário.

Critério de sucesso: artefato anterior volta a servir rotas/recursos/sessão com dados atuais legíveis, nenhuma escrita é repetida cegamente, configurações/hashes e evidência do ensaio permitem identificar o estado real. Nenhuma operação descrita de produção foi executada.

## Compatibilidade de leitura de chat aprovada na FRONT-10

Candidata usa _chat_notify_last_read:<id codificado>:<assembleia>. Não importa nem apaga a chave global antiga, cuja identidade não pode ser inferida. Novas chaves guardam somente data e permanecem inertes para o legado em reversão; ele volta à própria política global. Nenhuma migração de banco, limpeza ampla de localStorage ou restauração automática de dados. Troca de sessão limpa cache/socket em memória; não desfaz POST aceito. Esta documentação prepara compatibilidade e não executa publicação/reversão.

## Decisões complementares explícitas — 18/10/2026

D1: preservar o fluxo antigo /#/login por compatibilidade, incluindo segunda sessão e contrato GET original; não substituir pelo login principal. D6: aprovado preparar URLs hash, build dist e servidor estático exclusivamente dist, sem publicar. Hospedagem/subpath/browsers e homologação continuam pendentes. Cursor FRONT-08: aprovado usar maior ordem recebida e atualizar registros existentes por _id preservando posições, sem repetir escritas. Estas respostas substituem somente as pendências correspondentes dos registros históricos. Fórmulas/cores/datas e novas permissões continuam sem aprovação.
