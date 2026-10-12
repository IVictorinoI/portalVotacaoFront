# Instruções da migração de frontend

## Escopo e referência

Este pacote migra somente o frontend. A direção técnica é: React, TypeScript estrito, Vite, MUI/Emotion, React Hook Form e TanStack Query. Preserve recursos, rotas, autenticação e necessidades legítimas de estado global. Não imponha HashRouter, dialogs ou tabelas simples ao produto.

Leia referencia/arquitetura-destino.md e referencia/exemplo-frontend.md nesta pasta. São referências de outro sistema, não substitutos das regras do projeto atual. Os exemplos não autorizam simplificar funcionalidades.

Backend e frontend podem migrar em paralelo. Não espere arquivos, commits ou etapas da outra migração. Não altere o outro repositório. Não use seu diretório em alteração como referência de contratos. Use commits/artefatos anteriores às migrações ou cópias isoladas, sem fazer checkout no diretório da outra execução.

Preserve métodos, URLs, parâmetros, headers, autenticação, payloads, respostas, status, erros, datas, filtros e paginação usados na integração atual. Registre um inventário local desses contratos. Incompatibilidades exigem decisão explícita do usuário; não as implemente unilateralmente. Se a referência original não estiver disponível, registre a lacuna sem inventar comportamento.

## Arquivos gerados neste projeto

Crie docs/migracao/execucao/ com:
- 00-plano.md: etapas FRONT-01, FRONT-02 etc., dependências e aceitação;
- 01-diagnostico.md: fatos, arquivos examinados, dúvidas e riscos;
- 02-matriz-de-modulos.md: cobertura, dependências e estado por módulo;
- 03-validacao.md: comandos e cenários técnicos/manuais;
- 04-progresso.md: checkpoint atual e resultados;
- 05-publicacao-e-reversao.md: procedimento proposto, sem execução;
- 06-contratos-originais.md: contratos e evidências da versão de referência.

Não sobrescreva documentação existente sem conciliar seu conteúdo.

## Continuidade obrigatória

Mantenha em 04-progresso.md: branch e commit de referência, alterações preexistentes, etapa/subetapa, arquivos alterados, estado parcial, comandos/resultados, verificações não executadas, próximo passo e decisões pendentes. Identifique commits pelo histórico quando necessário; não crie commits recursivos apenas para registrar o próprio hash.

Atualize o checkpoint após cada subetapa e antes de operações demoradas. Logs extensos ficam em local ignorado pelo Git, sem segredos. Use execução acompanhável/em segundo plano se disponível. Registre processo, sessão e log quando houver; identificadores de sessão podem não sobreviver à retomada.

Não execute watchers como checks finitos. Timeout ou sessão perdida não prova que o comando falhou. Confira processos e efeitos antes de repetir. Não mate processos desconhecidos. Não use tempo decorrido como aprovação. Não dependa de estimar tokens restantes para salvar progresso.

Preserve arquivos parciais após interrupção. Não faça reset, limpeza ou reversão automática. Diferencie implementado, validado e commitado. Uma verificação ignorada não equivale a sucesso. Se as ferramentas falharem antes de ler/gravar, relate que o checkpoint não pôde ser salvo.

## Validação e autorização

Inclua formulários, rotas/deep links, sessão, permissões, cache, filtros/paginação, arquivos, teclado, responsividade e envio duplicado. Diferencie API simulada de integração real. Use o backend original em ambiente de testes quando disponível; sua migração não é pré-requisito.

Execute comandos reais do projeto; não copie scripts inexistentes da referência. Não enfraqueça testes para passarem. Não use segredos nem dados de produção em fixtures/logs. Abortar HTTP não desfaz gravações já recebidas.

Cada prompt autoriza somente sua etapa. Pare nos pontos de revisão. Não faça commit fora do prompt 05, push, deploy ou operações em produção. Mudanças de dados exigem planejamento próprio e autorização pertinente.

## Sequência

Execute prompts/01-diagnostico.md, revise; execute 02-planejamento.md, revise; aprove e execute 03-preparacao.md. Valide e use 05-commit-validado.md para a preparação. Repita 04-executar-etapa.md e 05-commit-validado.md por ID. Finalize com 06-revisao-final.md, valide e faça o commit final com 05. Use retomar.md em novas conversas e corrigir-problema.md para defeitos encontrados.
