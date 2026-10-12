# Arquitetura de destino para migração de outro sistema

Referência verificada em 11/10/2026 nos repositórios minhassenhas-back e minhassenhas-front. Este pacote descreve código existente; não é um diagnóstico do sistema que será migrado.

## Como usar este pacote

Copie os três arquivos desta pasta para docs/migracao do outro backend. Eles são autocontidos; os caminhos de código abaixo identificam as fontes nos projetos de referência e não precisam existir no projeto de destino. Se possível, disponibilize também os dois repositórios de referência para consulta. Não copie segredos, .env, dados reais, node_modules ou dist.

Leia este documento e os exemplos [backend](exemplo-backend.md) e [frontend](exemplo-frontend.md) antes de implementar. No outro projeto, crie diagnóstico, plano e progresso próprios. As decisões deste pacote definem a direção técnica; o sistema que será migrado define seus contratos, regras e dados. Divergências devem ser registradas, não resolvidas por simplificação silenciosa.

## Tecnologias e versões observadas

As versões abaixo foram lidas dos package.json locais. São uma fotografia da referência, não uma verificação externa de disponibilidade, suporte ou compatibilidade com o outro sistema. Avalie engines, dependências e lockfile do destino antes de escolher as versões finais. Não troque bibliotecas apenas para igualar números.

| Área | Referência |
| --- | --- |
| Backend | NestJS common/core/platform-express 12.1.2; TypeScript 6.0.3; Express 5.3.0 |
| Persistência | Mongoose 9.11.1; @nestjs/mongoose 12.0.0 |
| Fronteiras | class-validator 0.15.1; class-transformer 0.5.1; @nestjs/config 12.0.1; Swagger 12.0.2 |
| Autenticação | jsonwebtoken 9.0.3; bcrypt 6.0.0; throttler 6.7.1 |
| Frontend | React/React DOM 19.3.0; TypeScript 7.0.2; Vite 8.3.4 |
| Interface | MUI Material/Icons 9.5.0; Emotion react 11.14.0/styled 11.14.1 |
| Estado e HTTP | TanStack React Query 5.104.2; React Hook Form 7.90.0; Axios 1.20.0; React Router 8.4.0 |
| Qualidade | node:test no back; Playwright 1.64.0/Chromium no front; Prettier em ambos; ESLint com tipos no back |
| Runtime | engines em ambos: Node ^22.22.0 ou >=24.11.0; ADR do backend usa Node 24 LTS como referência |

## Backend: decisões a transportar

Adotar NestJS com adaptador Express, TypeScript estrito e monólito modular organizado por funcionalidades. Controllers cuidam de HTTP, DTOs validam entrada, services executam regras, repositories encapsulam Mongoose. Usar injeção de dependência Nest. Não introduzir microsserviços, CQRS ou repositório genérico sem requisito concreto.

A referência usa ESM, module/moduleResolution NodeNext, imports relativos com extensão .js no TypeScript, experimentalDecorators, emitDecoratorMetadata, strict e noUncheckedIndexedAccess. Compila com tsc para dist e inicia node dist/main.js. Não depende de Nest CLI nem de executar TypeScript diretamente no Node.

AppModule compõe configuração, banco, ApiModule e realtime. ApiModule registra HTTP, filtro e pipe globais e permite testes com providers substituídos. ConfigModule valida ambiente no startup. ValidationPipe usa whitelist e não converte tipos implicitamente; o filtro mantém o contrato de erros público. ObjectIdPipe valida identificadores; AuthGuard e CurrentUser separam autenticação da regra de negócio.

Manter MongoDB/Mongoose e os nomes/formatos de documentos existentes quando esse também for o banco do destino. Não trocar banco como consequência automática de adotar Nest. Se o outro sistema usa outro banco, registrar uma decisão própria antes de alterar persistência.

Índices são explícitos, autoIndex fica desativado e um comando de release usa createIndexes. Não usar syncIndexes nem corrigir duplicatas apagando dados automaticamente. Filtros de acesso devem incorporar o escopo autorizado do sistema: proprietário, organização, unidade ou outro requisito real. JWT válido sozinho não substitui autorização por operação.

A referência configura CORS HTTP/Socket.IO, headers de segurança, no-store, Swagger opcional e rate limiting de autenticação. Limites, política de cache, storage distribuído e proxy precisam ser avaliados para a infraestrutura do destino. O gateway atual só trata conexão/desconexão; não é modelo suficiente para eventos de negócio autenticados.

## Frontend: decisões a transportar

Manter SPA React independente da API, com TypeScript strict e Vite. Organizar por funcionalidade, com cliente HTTP/cache compartilhados. main.tsx compõe tema e providers; App.tsx compõe layout, sessão e rotas; páginas usam lazy/Suspense.

Usar MUI, Emotion e ícones MUI, tema centralizado com ThemeProvider/createTheme, localização ptBR e CssBaseline. Substituir o sistema visual legado por etapas completas. Remover dependências antigas apenas quando não houver consumidores. Cores, marca e fluxos pertencem ao produto de destino.

Usar React Hook Form para valores, validações e envio; TanStack Query para estado remoto; contexto para sessão; estado local para seleção e dialogs. O objetivo é separar responsabilidades. Não remover um store global do outro sistema antes de inventariar estado compartilhado, fluxos offline e outros usos legítimos.

A referência usa HashRouter para hospedagem estática sem rewrite, tabela MUI simples e consultas de lista inteira. Não impor hash, ausência de paginação ou um único dialog a um sistema que já depende de deep links, filtros, grandes listas ou formulários complexos. Preserve os recursos existentes e documente a adaptação.

Centralizar Axios, URL base por variável pública VITE_API_BASE_URL, tratamento de erros e ciclo de sessão. Limpar cache na troca de identidade e incluir identidade/organização/filtros relevantes nas query keys. Cancelar leituras descartadas e ignorar respostas tardias. Abortar HTTP não desfaz uma escrita já recebida no servidor.

## Particularidades deste projeto que não são regras universais

| Particularidade observada | Como tratar no outro sistema |
| --- | --- |
| Rotas /oapi e /api/passwords; errors: string[]; PUT parcial | Preservar o contrato próprio do destino; não renomear sua API para imitar o exemplo |
| JWT HS256 de um dia, token direto ou Bearer e fontes legadas body/query | Inventariar o mecanismo existente; não acrescentar fontes legadas de token sem necessidade |
| Sessão em localStorage sob _minhassenhas_user | Compatibilidade local, não exigência arquitetural; preservar cookies/SSO/refresh token se existentes |
| bcrypt custo 12 e limite de 72 bytes para novas senhas de autenticação | Avaliar autenticação existente; não alterar credenciais ou invalidar sessões implicitamente |
| AES-256-GCM v2 e leitura de CBC/texto histórico | Específico do cofre; manter chaves/formatos se houver dados equivalentes, sem recriptografia implícita |
| Segredos fora do cache; revelação por 30 segundos | Aplicar classificação de dados do produto; não colocar conteúdo sensível em cache indiscriminadamente |
| Chave de query com e-mail; cache stale por 30 segundos, sem retry/refetch no foco | Definir identificadores, escopo e políticas próprias para cada recurso |
| Models registrados em DatabaseModule global | Pode funcionar na referência pequena; avaliar registro por módulo para mais de dez entidades |
| Repository concreto injetado e tipos Mongoose no service | É o padrão realmente implementado, sem ports/interfaces obrigatórios nem domínio completamente isolado do ODM |
| URLs localhost/Heroku de fallback | Configurar endpoints do destino; nunca transportar a URL de produção deste projeto |

## Plano recomendado: uma entrega final, várias etapas revisáveis

1. Diagnosticar back/front sem alterar código. Mapear entidades, regras, permissões, contratos, integrações, jobs, uploads, índices, transações e dependências. Separar fatos de hipóteses.
2. Registrar arquitetura adaptada, mudanças intencionais e critérios de aceitação. Criar matriz por módulo com risco, dependências, cenários e estado.
3. Cobrir comportamentos críticos existentes antes da refatoração. Preservar expectativas; adaptar mocks quando a estrutura interna mudar.
4. Criar a infraestrutura mínima de Nest/TypeScript e React/Vite/MUI, mantendo aplicação executável ou documentando a transição necessária.
5. Migrar um módulo piloto representativo do banco à tela. Validar o padrão antes de multiplicá-lo.
6. Migrar os demais módulos por ordem de dependência e por fluxos completos. Não limitar o diagnóstico a CRUD.
7. Executar integração real, regressão total, ensaio de publicação/reversão e homologação dos usuários.
8. Publicar a versão completa após aprovação, sem presumir autorização para deploy a partir da autorização para editar código.

Trabalhar em branch de migração e fazer commits por unidade verificável: documentação, proteção por testes, infraestrutura e módulos. Em dois repositórios, registrar hashes compatíveis. Não incluir alterações preexistentes alheias. Após cada etapa, atualizar progresso com arquivos alterados, comandos/resultados, verificações ignoradas, pendências e roteiro manual; parar para revisão quando isso estiver previsto no prompt.

## Validação e publicação

Na referência, backend: npm run check; integração exige TEST_MONGODB_URI e usa banco aleatório exclusivo. Sem a variável, os testes de integração são explicitamente ignorados. Frontend: npm run format:check, npm run build e npm test; Playwright exige Chromium instalado e build atualizado. O front não tem script lint/check equivalente ao do back. Transpor a intenção dos checks e registrar os comandos reais do outro projeto.

Playwright com API simulada não verifica CORS, MongoDB, criptografia ou integração real. Acrescentar homologação back/front juntos, dados históricos anonimizados, diferentes perfis/organizações, erros, concorrência e fluxos entre entidades. Não afirmar sucesso remoto da CI apenas porque seu arquivo existe.

Mudanças de schema/dados exigem plano separado: script versionado e seguro para reexecução, ensaio, integridade, backup/restauração e compatibilidade com a versão anterior. Reverter código não reverte dados. Preservar chaves, artefato anterior e configurações; avaliar mudanças recebidas na branch de produção durante a migração antes da entrega final.

## Prompt inicial para o outro projeto

```text
Migre este sistema para a direção técnica dos documentos:
- docs/migracao/arquitetura-destino.md
- docs/migracao/exemplo-backend.md
- docs/migracao/exemplo-frontend.md

O destino inclui NestJS com TypeScript estrito, repositórios para a
persistência, React com TypeScript/Vite, MUI/Emotion, React Hook Form
e TanStack Query. Examine o banco atual antes de adotar MongoDB:
não está autorizada uma troca automática de banco.

Nesta primeira etapa, apenas analise e documente; não altere código.
Leia as instruções dos dois repositórios e examine código e testes.
O sistema atual é a referência das regras, contratos e dados.
As particularidades do Minhas Senhas não devem substituir essas regras.

Crie diagnóstico, plano, matriz de módulos, validação e progresso em
docs/migracao. Inclua dependências, riscos, mudanças intencionais,
commits propostos e pontos para minha revisão. Diferencie fatos de
hipóteses e registre lacunas antes de decidir mudanças de contrato.
Planeje uma entrega final com etapas pequenas e verificáveis.
Não execute deploy, migração de dados ou mudanças em produção.
```

## Prompt para executar uma etapa após revisar o plano

```text
Execute somente a etapa [ID] do plano aprovado.
Leia AGENTS.md, arquitetura de destino, exemplos, plano e progresso.
Examine consumidores e dependências antes de editar. Preserve os
contratos e regras existentes, salvo mudanças registradas no plano.
Não amplie o escopo silenciosamente nem simplifique funcionalidades.
Implemente, revise o diff e execute os checks aplicáveis. Documente
resultados reais, pendências e roteiro de validação manual.
Atualize o progresso e pare para minha revisão. Não faça commit
nem inicie a próxima etapa automaticamente.
```

## Fontes verificadas

Backend: package.json, tsconfig.json, src/app.module.ts, src/api.module.ts, src/database/database.module.ts, src/config/configure-app.ts, src/modules/passwords e test/README.md. ADRs 0001 a 0005 em docs/decisoes-arquiteturais registram módulos, persistência, compatibilidade/criptografia, fronteiras e qualidade.

Frontend: package.json, tsconfig.json, src/main.tsx, src/App.tsx, src/lib, src/auth/Session.tsx, src/password e playwright.config.js. ADRs 0001 a 0005 em docs/decisoes-arquiteturais do frontend registram SPA, MUI/forms, cache, sessão e qualidade. O ADR de sessão relata o contexto da migração original do front; a descrição conjunta deste pacote considera também o backend atual.

