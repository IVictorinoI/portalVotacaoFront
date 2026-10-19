# FRONT-13 — checkpoint de consolidação

## Situação

FRONT-01–12 implementadas na candidata; FRONT-12 verificada no commit 13db3ab. FRONT-13.A preparada e verificada; FRONT-13 completa ainda pendente. Não retirar legado nem trocar Procfile raiz por consequência deste checkpoint. Backend fora do escopo, sem push/deploy/produção.

## Evidência disponível

- Windows: npm ci --offline em cópia nova sem node_modules/dist/.env; build, 52 unitários e 4 HTTP estáticos aprovados. Cópia ignorada .migration-verification/front13-clean-TS4wpJ.
- Linux: Ubuntu WSL, cópia /tmp/portal-frontend13.o0SIH3, prova de arquivos distintos CaseProbe/caseprobe, Node 24.21.0 temporário. Instalação npm limpa, build (364 ms), 52 unitários (812 ms), 4 HTTP estáticos (170 ms), todos exit 0. Sem backend/configuração real.
- Runtime Linux baixado de nodejs.org/dist/v24.21.0 e verificado contra SHASUMS256.txt oficial: fd8e59d5a511510f6a298afb548f18c7d2b1be404d8b4a27d94fbe49f56cb2d6. Sem instalação global; artefatos locais ignorados, não necessários ao runtime do produto.
- Regressão candidata completa 124/124 desktop/mobile, 2,6 min; sem retries/skips. Browser Windows Chromium; não é matriz completa de navegadores homologada.
- Snapshot original: .migration-verification/frontend-original-41478a8.zip, SHA256 237488661df9130ceaa788a5e54b9f7df1ca06461451eee37561180290675463. Gerado por git archive do original 41478a83b74a8d27c7058a1d79b2ed1deab271c3: src public package.json package-lock.json webpack.config.js Procfile. Manifest local sanitizado ao lado. Não contém backend/banco; não atesta a versão atualmente publicada.

## Inventário de retirada futura

| Original/evidência | Candidata/substituição | Condição para retirar |
| --- | --- | --- |
| src/index.jsx, src/main/reducers.js: Redux/middlewares | auth/Session, Query e ChatProvider para estado compartilhado legítimo | Cobertura completa e baseline original preservada fora da raiz |
| src/common/template/dependencies.js: AdminLTE/jQueryUI/fastclick/slimScroll/bootstrap/iCheck/fontes | MUI/Emotion, layout React, tabelas completas/scroll interno, teclado | Revisão visual/browsers; não copiar plugins sem consumidores |
| public/index.html: jquery-3.5.0.js e socket.io.js globais | React module e socket.io-client 2.3.0 com dono de sessão | Ensaio do protocolo do produto segue FRONT-14; fixture local não o substitui |
| Chart.js/plugin datalabels, fontes dashboard | SVG declarativo com percentuais/cores preservados | D3 não autoriza corrigir apuração ou limiares |
| React Router 3/hash | navigation/routes e listener de hash/lazy | Todos deep links preservados; sem impor outra estratégia |
| public logo.png/logo_login.png/profile.png | migration-ui/public correspondentes | Três SHA256 idênticos; demais assets só remover após conferir ausência de consumidores |
| Webpack/Babel6 e source legado | Vite/TS estrito e módulos funcionais migration-ui | Adaptar baseline primeiro; não quebrar harness ao substituir dependências da raiz |

Não há consumidor Redux/jQuery/AdminLTE/SignalR/Chart.js em migration-ui/src ou index.html. O arquivo PendingPage não tem import ativo; remoção pertence à consolidação. Ausência de import direto não autoriza apagar assets do legado que ainda é executável.

## Próxima unidade concreta

1. Obter D6: host, raiz/subpasta e browsers. Preparação atual usa URLs hash/base relativa e servidor de ensaio na raiz, exclusivamente dist; não presume configuração do host final. D2/D3: preservar permissões/fórmulas/cores/datas enquanto correções não forem aprovadas.
2. Preservar último baseline legado testado e adaptar migration-tests/server.cjs e unit.test.cjs para referência original isolada. Ambos ainda dependem de Webpack/Babel/node_modules/fontes da raiz; não remover essas dependências antes de adaptar/verificar. Manter guarda de SHA/original e isolamento de rede.
3. Consolidar candidata na raiz, scripts/lock e CI finita sem deploy, revisar assets e só então retirar consumidores/dependências legados. Conferir alterações preexistentes antes; sem reset/stash/clean. Não publicar módulos parciais.
4. Repetir instalação limpa/build/unitários/static e regressão contra os paths finais, Windows e Linux; testar host/subpath/deep links/chunks. Preparar Procfile que aponte somente dist com build explícito, bind/porta conforme host, sem assumir npm antigo prepara candidata automaticamente.
5. FRONT-14 continua sem integração real/homologação/ensaio operacional. Exige ambiente exclusivo e autorização correspondente; não acessar backend por este checkpoint.

Logs: migration-ui/front13-* e migration-tests/front12-* ignorados. Processos de verificação encerrados; conferir Git e progresso na retomada.
