# Exemplo frontend: listagem e edição com MUI

Leia primeiro [arquitetura-destino.md](arquitetura-destino.md). Os caminhos abaixo pertencem ao minhassenhas-front, referência examinada em 11/10/2026. Os trechos são recortes reais, não componentes completos para colar.

## Estrutura existente

```text
src/
  main.tsx                  # Tema e composição dos providers
  App.tsx                   # Layout, rotas lazy e sessão
  lib/api.ts                # Axios, tipos, erros e projeção de respostas
  lib/query.ts              # QueryClient e políticas de cache
  auth/Session.tsx           # Contexto e ciclo de sessão
  auth/AuthPage.tsx          # Login e cadastro
  password/usePasswords.ts  # Consulta compartilhada
  password/PasswordsPage.tsx # Lista, seleção, notificações e invalidação
  password/PasswordDialog.tsx# Formulário, escrita e leitura de segredo
  dashboard/DashboardPage.tsx
```

Para mais de dez entidades, mantenha organização por funcionalidade e extraia componentes compartilhados quando houver reutilização concreta. A referência concentra tipos e funções HTTP em lib/api.ts por ser pequena; no destino, pode haver api.ts/types.ts por domínio com cliente compartilhado. Não concentrar toda a API em um arquivo apenas para copiar o layout acima.

## Tema, layout e navegação

main.tsx cria tema ptBR com createTheme: cor primária #214e80, fundo #f4f7fb, bordas 12 e tipografia de sistema. Compõe ThemeProvider, CssBaseline, QueryClientProvider, SessionProvider e HashRouter. Use o tema central como padrão; preserve identidade visual do outro produto.

App.tsx usa AppBar, Drawer, Container e breakpoints MUI. Drawer é permanente no desktop e temporário no celular. As páginas são carregadas com lazy/Suspense. Sessão ausente mostra AuthPage; sessão restaurada é verificada antes das páginas protegidas.

HashRouter é uma decisão da hospedagem estática desta referência, não requisito do MUI. Não perder URLs existentes, parâmetros, bookmarks e controle de acesso do destino. Ocultar navegação não substitui autorização no servidor.

## Separação de estado

| Estado | Implementação observada |
| --- | --- |
| Sessão | SessionProvider/contexto |
| Lista de metadados compartilhada com dashboard | TanStack Query |
| Registro selecionado, dialog e aviso de sucesso | useState em PasswordsPage |
| Valores, erros e envio do formulário | React Hook Form |
| Senha revelada | Estado local temporário de PasswordDialog, fora do cache |

```tsx
// password/usePasswords.ts
export function usePasswords() {
    const { user } = useSession()
    return useQuery({
        queryKey: ['passwords', user?.email],
        queryFn: ({ signal }) => listPasswords(signal),
        enabled: !!user,
    })
}
```

lib/query.ts configura staleTime 30000, retry false e refetchOnWindowFocus false. Mutations têm retry false/gcTime 0, mas as escritas deste dialog usam Axios diretamente. Não afirmar que o CRUD atual já usa useMutation.

No outro sistema, inclua usuário/organização e filtros/paginação nas query keys quando relevantes. Avalie useMutation para operações comuns sem dados sensíveis e mantenha política explícita para não expor segredos. Não remova Redux antes de mapear usos que não são estado remoto.

## Listagem até gravação

1. usePasswords consulta lib/api.ts com AbortSignal.
2. listPasswords projeta apenas _id, description, login e url antes do cache.
3. PasswordsPage renderiza carregamento, erro com retry manual, lista vazia ou tabela MUI.
4. Novo/Editar/Excluir define uma união tipada de seleção e monta PasswordDialog.
5. O dialog usa React Hook Form e Axios para POST/PUT/DELETE.
6. No sucesso, onSaved fecha o dialog, mostra Snackbar e invalida queries com prefixo passwords.
7. Dashboard e listagem podem voltar a refletir os mesmos metadados.

```tsx
// src/password/PasswordDialog.tsx: padrão real de campo
<TextField
    autoFocus
    label="Descrição"
    placeholder="Informe a descrição"
    {...register('description', {
        required: 'Informe a descrição.',
        validate: (value) => !!value.trim() || 'Informe a descrição.',
    })}
    error={!!errors.description}
    helperText={errors.description?.message}
    slotProps={{ htmlInput: { readOnly: deleting } }}
/>
```

A validação de UI melhora a experiência; o backend continua validando. Para componentes controlados ou formulários complexos, planeje a integração adequada com React Hook Form; não imponha register a qualquer componente.

## Dialog e proteção do fluxo

DialogSelection distingue criação de edição/exclusão com registro obrigatório. O mesmo dialog atende as três operações nesta funcionalidade pequena. Há confirmação para exclusão, estado isSubmitting, ref para impedir envio duplicado e bloqueio de fechamento durante gravação.

Na edição, password só entra no payload quando o usuário escolhe alterar a senha. Não enviar um campo vazio no lugar de uma propriedade omitida. Campos permitidos são montados explicitamente; o frontend não envia o documento inteiro nem o proprietário.

Cada leitura/escrita usa AbortController. Ao desmontar, o dialog aborta a requisição e respostas tardias são ignoradas. Segredo revelado fica localmente por até 30 segundos, pode ser ocultado e copiar usa Clipboard API. Limpar estado não garante apagar strings da memória; clipboard não é controlado pela aplicação após copiar.

No outro produto, formulários extensos podem exigir página própria, múltiplas etapas e confirmação de alterações não salvas. Preservar essas necessidades em vez de reduzir tudo a um dialog.

## HTTP e sessão

lib/api.ts centraliza Axios com timeout 15 segundos, VITE_API_BASE_URL e tratamento de errors: string[]. A referência manda authorization com token direto por compatibilidade. Não copie os endpoints localhost/Heroku nem a chave _minhassenhas_user para o outro sistema.

SessionProvider restaura localStorage, valida token via /oapi/validateToken, trata falha de rede com nova tentativa e limpa sessão/header/cache em logout ou 401. Um evento storage da chave de sessão encerra a sessão local. Falha de acesso ao storage permite sessão em memória.

Preserve o mecanismo de autenticação do destino e seus requisitos de refresh, SSO, cookies e múltiplos perfis. localStorage é acessível por JavaScript; não substituir cookies HttpOnly por esse exemplo. Variáveis VITE_ ficam públicas no bundle, nunca devem conter segredos.

A tipagem Axios não valida dados recebidos em runtime. No exemplo, há projeção de campos, não um schema completo de validação de resposta. Adicione validação quando o contrato e o risco justificarem.

## Testes e conclusão da etapa

playwright.config.js serve dist na porta 18080 e usa Chromium. tests/app.spec.js e tests/session.spec.js interceptam API e verificam fluxos de login, sessão, CRUD, segredos, erros e comportamentos no celular. São testes de navegador com API simulada, não integração real com Nest/MongoDB.

Comandos existentes: npm run format:check; npm run build (typecheck + Vite); npm test. O build deve estar atualizado antes do teste. Instalar Chromium do Playwright quando necessário. Não inventar um script lint que não existe no projeto de referência.

Para concluir cada módulo no destino, verificar formulários, permissões de ações, carregamento/erro/vazio, invalidação, navegação e deep links, teclado/foco, responsividade, envio duplicado e dados sensíveis. Incluir filtros, paginação, exportação e outros recursos existentes. Depois testar também com a API real em homologação. Registrar comandos e limitações no progresso antes da revisão.

