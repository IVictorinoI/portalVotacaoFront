# 02 — Planejamento de frontend

Leia instruções, referências, diagnóstico, contratos originais e progresso. Incorpore as respostas fornecidas pelo usuário. Se houver decisão impeditiva sem resposta, não invente a aprovação; planeje as partes independentes e destaque o bloqueio.

Crie em docs/migracao/execucao/: 00-plano.md, 02-matriz-de-modulos.md, 03-validacao.md e 05-publicacao-e-reversao.md. Atualize progresso.

Direção técnica: React, TypeScript estrito, Vite, MUI/Emotion, React Hook Form e TanStack Query. Preserve recursos, rotas, autenticação e necessidades legítimas de estado global. Não imponha HashRouter, dialogs ou tabelas simples ao produto.

Planeje etapas FRONT-01, FRONT-02 etc. pequenas e revisáveis, com dependências, subetapas, escopo, checks, critérios de conclusão, roteiro manual e commits propostos. Inclua proteção dos comportamentos críticos, infraestrutura mínima, piloto representativo e demais módulos por fluxos completos. Evite uma etapa única para todas as entidades.

Inclua formulários, rotas/deep links, sessão, permissões, cache, filtros/paginação, arquivos, teclado, responsividade e envio duplicado. Diferencie API simulada de integração real. Use o backend original em ambiente de testes quando disponível; sua migração não é pré-requisito.

Registre comandos reais e pré-requisitos. Separe mudanças intencionais de comportamento preservado. Não vincule etapas a arquivos ou commits gerados pela outra migração. Planeje uma entrega final, com checkpoints e commits intermediários. Planeje compatibilidade, backup/restauração e reversão; não execute operações de produção.

Não altere código ou dependências. Apresente decisões e pare para revisão.
