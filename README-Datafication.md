# Atividade de Datafication — Relatório Expandido

## Dados essenciais do desafio
- **Tema:** Datafication aplicada à gestão pessoal de estudos.
- **Objetivo:** mostrar como ações subjetivas de estudo (movimentação de sliders, escolha de tópicos, revisão) geram dados úteis para análise e recomendação.
- **Entrega:** sexta-feira, 5 de dezembro de 2025, às 18h, via Moodle (https://notebooklm.google.com/notebook/b7a7c833-b025-4edc-80af-053530233f4b).
- **Formato orientado:** relatório técnico ampliado, documentação comentada e artefatos multimídia (vídeo demonstrativo, dashboards simulados, dados gerados).

## Justificativa e contexto teórico
1. **Definição de dataficação:** segundo Dell Technologies (2023), datafication consiste em transformar comportamentos humanos em dados mensuráveis e acionáveis. O projeto contextualiza isso no cotidiano escolar, oferecendo rastreabilidade do progresso de estudo.
2. **Problema identificado:** aprendizes têm dificuldades em quantificar o esforço e o progresso, baseando-se apenas em sensações subjetivas. Com a dataficação, é possível gerar indicadores como `engajamento diário`, `score médio de retenção` e `tempo dedicado por tópico`.
3. **Referências-chave:** Van Dijck (2014) (sociedade orientada a dados); Siemens & Long (2011) (learning analytics); mecanização do `quantified self` aplicado à educação.

## Estrutura do relatório completo
1. **Introdução:** contextualização do desafio, motivação (avaliação subjetiva de estudos), definição de termos e objetivo geral.
2. **Fundamentação teórica:** explanação sobre datafication, quantified self e learning analytics; destaque para como o rastreio de comportamento permite ciclos de feedback.
3. **Metodologia:** descrição do fluxo de coleta → modelagem → persistência; explicação dos paradigmas reativos adotados.
4. **Implementação técnica:** descrição detalhada do stack (HTML/VanillaJS + Firebase Auth/Realtime Database ou Firestore); mapeamento do modelo de dados e funcionalidades de interface.
5. **Experimentos e simulações:** descrição das coletas simuladas (30 dias); apresentação de métricas e visualizações (tabelas, gráficos de tendência, heatmap de horários produtivos).
6. **Resultados e insights:** análise de curvas de aprendizado, detecção de tópicos críticos, previsão de desempenho; inclui discussões sobre aplicabilidade de modelos simples (regressão linear, árvores de decisão) para recomendações rápidas.
7. **Contribuições e limitações:** discurso sobre impacto (dados em tempo real, transparência) e restrições (auto-relato, viés, necessidade de validação de dados).
8. **Conclusão:** reforça a transformação de sinais subjetivos em evidência quantificada e propõe passos futuros.

## Metodologia e fluxos técnicos
- **Captura de eventos:** movimentos de sliders (0-10), seleções de linhas em topicNotebooks, abertura de notas e categorias são registrados via ouvintes (listeners) no frontend e enriquecidos com timestamps (UTC) e contexto (topicId, category).
- **Normalização e persistência:** leituras são normalizadas (padronizadas de 0 a 1) e salvas em coleções como `progressData`, `topicNotebooks`, `sessionSummary`; cada documento inclui `autoSaveVersion`, `timestamp`, `userId` e `rawScore`.
- **Arquitetura Firebase:** Auth controla sessões; Firestore armazena estados e logs; Cloud Functions (opcional) agrega métricas periódicas; Realtime Database pode ser usado para dashboards com atualizações instantâneas.
- **Experiência de usuário:** auto-save em background (300ms após mudança); feedback visual com barras de progresso e mensagens de commit; mensagens de erro tratadas localmente para evitar perda de dados.
- **Integração com dashboards:** dados agregados alimentam widgets que mostram `averageScore`, `consistency`, `topicsCompleted` e `alertas de estagnação`.

## Experimentos e resultados simulados
1. **Cenário simulado:** 30 dias de estudo com 3 tópicos principais, usando 3 sessões por dia; cada sessão registra 5 sliders e 2 checkpoints.
2. **Métricas calculadas:** total de tópicos ativos, média de progresso, tempo médio diário, consistência semanal (desvio padrão dos scores), taxa de retomada de tópicos negligenciados.
3. **Visualização:** planos para gráficos (linhas de evolução, radar de tópicos) e heatmaps (horários de maior desempenho), exportados como PNG para anexar ao relatório.
4. **Insights esperados:** identificação de horários mais produtivos (ex.: 18h-20h), tópicos críticos (ex.: “Álgebra Linear”), impacto de pausas longas e avalição de padrões autoregresivos para recomendar sessões de revisão.

## Cronograma detalhado
| Semana | Atividades principais |
| --- | --- |
| Semana 1 (até 10/nov) | Desenho do relatório, coleta inicial dos dados simulados, revisão teórica. |
| Semana 2 (11-17/nov) | Desenvolvimento da documentação técnica, rascunho das seções de metodologia e implementação. |
| Semana 3 (18-24/nov) | Geração de gráficos e experimentos, edição de vídeo demonstrativo, validação de entregar materiais. |
| Semana 4 (25/nov - 1/dez) | Revisão completa do relatório, ajustes nas visualizações, revisão por pares. |
| Últimos dias (2-5/dez) | Finalizar e subir artefatos no Moodle, assegurar consistência entre texto e dados, preparar resumo executivo. |

## Entregáveis completos
- Documento técnico completo (PDF/Word) contendo todas as seções descritas, tabelas, gráficos e referências.
- Arquivo `datafication-simulated.json` com 30 dias de eventos (structure: `date`, `topicId`, `sliderValues`, `duration`, `moodScore`).
- Vídeo curto (3-5 minutos) gravado com tela, mostrando login, manipulação de sliders, dashboards e auto-save no Firebase.
- Slides com destaque das descobertas e recomendações estratégicas.
- Código frontend comentado (pasta `src/`) com destaque para listeners, chamadas Firebase e geração de dashboards.
- Dashboard exportado (PNG/SVG) e planilha Excel/CSV com métricas de simulação.

## Extensões e próximos passos sugeridos
1. **Deploy e autenticação real:** conectar Firebase Hosting e habilitar OAuth Google para usuários reais.
2. **Modelos simples de ML:** treinar regressão linear ou árvore de decisão usando `progressData` para prever `moodScore` ou `probabilidade de revisão urgente`.
3. **Exploração de notificações:** criar triggers para alertar via Firebase Cloud Messaging sobre tópicos atrasados.
4. **Comparativo histórico:** implementar exportação/importação para comparar ciclos de diferentes semanas.

## Referências e leituras complementares
1. Van Dijck, J. (2014). *Datafication, dataism and dataveillance.* Surveillance & Society.
2. Dell Technologies (2023). *Datafication: A New Business Model.* https://learning.dell.com/content/dam/dell-emc/documents/en-us/2023KS_Venkatesh-Datafication_A_New_Business_Model.pdf
3. Siemens, G. & Long, P. (2011). *Penetrating the Fog: Analytics in Learning and Education.*
4. McKinsey (2021). *The value of data-driven learning.*
5. Firestore Documentation on timestamped writes and offline persistence.
