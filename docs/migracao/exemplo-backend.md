# Exemplo backend: fluxo real de credenciais

Leia primeiro [arquitetura-destino.md](arquitetura-destino.md). Os caminhos abaixo pertencem ao minhassenhas-back, referência examinada em 11/10/2026. Os trechos são recortes do código real e não arquivos completos prontos para colar.

## Estrutura e responsabilidades

```text
src/
  main.ts
  app.module.ts
  api.module.ts
  config/                 # Ambiente, configuração HTTP e adapters
  common/                 # Filtro de erros, pipe de ObjectId e validação
  database/               # Conexão, models e comando de índices
  modules/
    auth/                 # Guard, CurrentUser, tokens, login e cadastro
    users/                # Schema e repository de usuários
    passwords/
      dto/password.dto.ts
      schemas/password.schema.ts
      passwords.controller.ts
      passwords.service.ts
      passwords.repository.ts
      passwords.module.ts
    crypto/               # Criptografia explícita
    realtime/             # Gateway sem eventos de negócio
```

AppModule importa configuração validada, DatabaseModule, ApiModule e RealtimeModule. ApiModule reúne auth/passwords, ThrottlerModule, APP_FILTER e APP_PIPE. DatabaseModule é global e registra User/Password com MongooseModule.forFeature; PasswordsModule importa AuthModule/CryptoModule e fornece controller/service/repository. Não atribua ao módulo de passwords um registro de model que hoje está no módulo global.

Para um sistema maior, agrupe por domínio de negócio; não crie obrigatoriamente um módulo para cada coleção. Registre providers e exports necessários explicitamente. Avalie registro de schemas por módulo e dependências entre domínios no plano, sem inventar repositórios genéricos ou circularidades para imitar a referência.

## Caminho de uma criação

1. POST /api/passwords passa pelo AuthGuard; CurrentUser entrega a identidade verificada.
2. O pipe global valida CreatePasswordDto antes de chegar ao service.
3. PasswordsController delega user._id e dto ao PasswordsService.
4. O service seleciona os campos permitidos e criptografa password.
5. PasswordsRepository recebe ciphertext e grava pelo model injetado.
6. O service projeta somente _id, description, login e url na resposta.

```ts
// passwords.controller.ts: dentro de PasswordsController
@Post()
@ApiCreatedResponse({ type: PasswordSummaryDto })
create(
  @CurrentUser() user: AuthenticatedUser,
  @Body() dto: CreatePasswordDto,
): Promise<PasswordSummaryDto> {
  return this.passwords.create(user._id, dto);
}
```

```ts
// passwords.service.ts: dentro de PasswordsService
async create(user: string, dto: CreatePasswordDto): Promise<PasswordSummaryDto> {
  const doc = await this.passwords.create({
    description: dto.description,
    login: dto.login,
    url: dto.url,
    password: this.crypto.encrypt(dto.password),
    user,
  });
  return this.summary(doc);
}
```

Controller não consulta Mongoose. Repository não criptografa. Na referência, service usa exceções Nest e o tipo PasswordDocument do Mongoose; portanto não há isolamento completo de domínio/framework. Não apresentar ports/interfaces como se já existissem.

## DTOs e atualização parcial

CreatePasswordDto usa IsString/IsNotEmpty para description, login e password; url usa ValidateIf para validar quando não é undefined. UpdatePasswordDto usa PartialType(CreatePasswordDto, { skipNullProperties: false }). Campos extras são ignorados pelo whitelist; null não equivale a omissão. A validação não usa coerção implícita.

PUT /api/passwords/:id permanece parcial por compatibilidade. O service monta um objeto de atualização campo a campo. Só criptografa password se a propriedade veio na entrada. Atualizar descrição não deve apagar nem recriptografar o segredo. Essa regra deve ter teste específico.

No outro sistema, preservar a diferença entre omitido, null, vazio e valor default para cada campo. Não aplicar o PUT parcial deste exemplo a um contrato que tenha semântica diferente.

## Repository e autorização

```ts
// passwords.repository.ts: dentro de PasswordsRepository
constructor(@InjectModel(Password.name) private readonly model: Model<Password>) {}

async findOwned(_id: string, user: string): Promise<PasswordDocument | null> {
  return this.model.findOne({ _id, user });
}

async deleteOwned(_id: string, user: string): Promise<PasswordDocument | null> {
  return this.model.findOneAndDelete({ _id, user });
}
```

listOwned filtra por user e ordena por description. updateOwned busca por id/proprietário, aplica doc.set(data) e doc.save(). O service converte resultado nulo em 404, incluindo tentativa de acessar credencial alheia. A identidade não vem do corpo da requisição.

Esse update com leitura seguida de save é o comportamento observado; não comprova proteção geral contra atualizações concorrentes. No destino, preservar/reavaliar versionamento, atomicidade, transações e regras de concorrência conforme as operações reais. Se há organizações, permissões por papel ou compartilhamento, o filtro user deste exemplo é insuficiente.

## Schema e índices

Password usa @Schema({ collection: 'passwords' }); user é ObjectId com ref User. PasswordSchema declara índice composto user/description com nome passwords_user_description. UserSchema tem índice único de e-mail. autoIndex fica false.

O comando npm run db:indexes compila e executa dist/database/ensure-indexes.js. Usa createIndexes, não remove índices existentes nem resolve duplicatas sozinho. E11000 no cadastro é traduzido para erro público. Preservar coleções, referências e representação dos dados do destino; não importar nomes deste cofre.

A criptografia ocorre antes da persistência, sem hooks de schema. CryptoService mantém formatos históricos deste produto. Não transportar chaves ou aplicar esse formato a outro domínio sem necessidade.

## Contratos observados

| Operação | Endpoint | Resposta de sucesso |
| --- | --- | --- |
| Listar | GET /api/passwords/myPasswords | Lista de resumos, sem segredo |
| Revelar | GET /api/passwords/viewPassword?_id=... | Objeto com password |
| Criar | POST /api/passwords | Resumo, HTTP 201 |
| Atualizar | PUT /api/passwords/:id | Resumo, HTTP 200 |
| Excluir | DELETE /api/passwords/:id | Resumo, HTTP 200 |

Erros públicos usam errors: string[]. ObjectIdPipe valida ids antes das consultas. Os endpoints acima explicam o exemplo; não são uma proposta de substituir os contratos do outro sistema.

## Verificações e arquivos de referência

- test/password-contract.test.cjs: HTTP e isolamento por proprietário.
- test/nest-contract.test.cjs: DTOs, identidade JWT, rate limit, OpenAPI, headers, CORS, gateway e duplicidade.
- test/models.test.cjs e test/crypter.test.cjs: escrita criptografada, atualização e dados históricos.
- test/api.test.cjs: AppModule e MongoDB reais, índices, concorrência e CRUD.
- test/bootstrap.test.cjs: entrada compilada e encerramento.

npm run check executa tipos, lint, formatação e testes. npm run test:contracts e npm run test:unit permitem verificações específicas. npm run test:integration precisa de TEST_MONGODB_URI para executar a integração; usa banco exclusivo aleatório e remove apenas esse banco. Uma integração ignorada não conta como validada.

## Critério para concluir um módulo no destino

O módulo deve preservar seus contratos, regras, autorização, relações e efeitos colaterais; usar DTO/controller/service/repository conforme as responsabilidades; registrar dependências Nest corretamente; manter dados existentes legíveis; passar checks relevantes e oferecer roteiro manual. Fluxos que atravessam várias entidades exigem testes próprios. Atualize progresso antes de submeter a etapa à revisão.
