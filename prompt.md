# 🧠 Sistema de Performance de Conhecimento – Módulo Concurso

## 📘 Visão Geral
O objetivo deste projeto é desenvolver um **sistema SaaS** que auxilie candidatos de concursos públicos a **melhorar sua performance de estudo e simulação de provas**, com base em **bancos de questões calibrados**, **simulados inteligentes** e **análises personalizadas por IA (LLM)**.

O sistema deverá funcionar como um ambiente de aprendizado adaptativo, oferecendo simulados, relatórios de desempenho, análise inteligente das respostas e planos de estudo personalizados.

---

## 🎯 Objetivos do Sistema
- Disponibilizar **banco de questões calibrado por banca e nível de dificuldade**.
- Realizar **calibragem inicial do candidato** (avaliação diagnóstica rápida).
- Permitir **criação de simulados personalizados** (por cargo, matéria ou tema).
- Gerar **avaliações detalhadas** com relatórios de desempenho e evolução.
- Integrar **análise de questões e feedback automatizado via LLM**.
- Oferecer **comparativos de desempenho e ranking** entre usuários.
- Disponibilizar um **painel inteligente** para acompanhamento do progresso.

---

## 🧩 Estrutura do Sistema

### 1. Calibragem Inicial
- Avaliação diagnóstica com **1 ou 2 questões por disciplina**.
- Mede o nível inicial do candidato (**iniciante / intermediário / avançado**).
- Critérios: acertos, tempo médio, nível de confiança.
- Gera um **perfil cognitivo inicial** com foco nas áreas a desenvolver.

**Exemplo – Calibragem ALEGO (Analista de Ciência de Dados):**
| Disciplina | Questões | Tipo de Avaliação |
|-------------|-----------|------------------|
| Língua Portuguesa | 2 | Gramática e interpretação |
| Raciocínio Lógico | 2 | Sequências e proporções |
| Realidade de Goiás | 1 | História e economia |
| Legislação Estadual | 1 | Constituição do Estado |
| Ciência de Dados | 2 | Estatística e Python |

---

### 2. Simulado Inteligente
- Geração automática de provas no **formato e estilo da banca (FGV)**.
- Opção de **personalizar o simulado**:
  - Por cargo (ex: Analista de Ciência de Dados)
  - Por matéria ou tema
  - Por dificuldade (fácil, médio, difícil)
- Cronômetro e cálculo de nota automática.

**Exemplo – Estrutura ALEGO (FGV):**
- 70 questões totais  
  - 28 de conhecimentos básicos  
  - 42 de conhecimentos específicos  
- Tempo de prova: **5 horas**  
- Critério de reprovação: menos de 50% em qualquer parte

---

### 3. Avaliação e Relatórios
Após o simulado, o sistema gera:
- **Nota geral e percentual de acerto**
- **Radar de desempenho por disciplina**
- **Tempo médio por questão**
- **Taxa de acerto por dificuldade**
- **Evolução histórica**
- Sugestões de conteúdo e revisão

**Exemplo de saída:**
> Você teve 72% de acertos totais.  
> Seus pontos fortes são Estatística e Lógica.  
> Reforçar: Legislação Estadual e Redação Técnica.

---

### 4. Análise com LLM
O modelo de linguagem analisa:
- Erros conceituais e padrões de distração.
- Explica o raciocínio correto passo a passo.
- Gera plano de estudos individualizado.
- Cria feedback textual para questões discursivas.

**Exemplo de feedback:**
> “Você errou 3 questões sobre Teorema de Bayes.  
> Seu padrão de resposta indica confusão entre probabilidade condicional e total.  
> Recomendo revisar os tópicos 2.3 e 2.4 do edital e praticar exercícios FGV 2022.”

---

### 5. Banco de Questões (Modelo de Dados)
| Campo | Exemplo |
|--------|----------|
| ID | Q-FGV-2025-001 |
| Banca | FGV |
| Concurso | ALEGO 2025 |
| Cargo | Analista de Ciência de Dados |
| Matéria | Estatística |
| Tema | Distribuições de Probabilidade |
| Dificuldade | Alta |
| Enunciado | Texto da questão |
| Alternativas | A, B, C, D, E |
| Resposta Correta | C |
| Explicação | Texto detalhado com justificativa |

---

### 6. Dashboard do Candidato
Indicadores visuais:
- Desempenho geral e por disciplina
- Evolução semanal/mensal
- Comparativo com média nacional
- Recomendação automática de estudo
- Histórico de simulados

---

### 7. Futuro: Módulo de Coach / Psicólogo
Baseado no modelo **Bono (Decode)**:
- Relatórios de progresso cognitivo e emocional
- Padrões de foco, atenção e consistência
- Recomendações de técnicas de estudo (Pomodoro, Mapa mental, Feynman)

---

## 📚 Estudo de Caso – ALEGO 2025

**Cargo:** Analista Legislativo – Analista de Ciência de Dados  
**Banca:** FGV  
**Formato de Prova:**
- 28 questões de conhecimentos básicos
  - Língua Portuguesa (14)
  - Raciocínio Lógico (6)
  - Realidade e Legislação de Goiás (8)
- 42 questões específicas
  - Direito Constitucional (6)
  - Direito Administrativo (6)
  - Ciência de Dados (30)
- Prova discursiva: 2 questões dissertativas (10 pontos cada)

---

## 💡 Tecnologias Recomendadas

| Camada | Stack Sugerida |
|---------|----------------|
| Frontend | Next.js + Tailwind + React Query |
| Backend | FastAPI (Python) |
| Banco de Dados | PostgreSQL (com pgvector) |
| IA | OpenAI GPT-5 + Embeddings |
| Avaliação adaptativa | Item Response Theory (IRT) + Bayesian Calibration |
| Autenticação | Auth0 / Firebase |
| Infraestrutura | GCP |
| BI / Dashboard | Metabase|
| Pagamentos | Stripe / Mercado Pago |

---

## 🧱 Estrutura de Módulos (SaaS)
/core
/users
/auth
/questions
/tests
/analytics
/feedback
/billing
/ui
/dashboard
/simulado
/calibragem
/admin
/docs
readme.md
roadmap.md
api.md


---

## 🚀 Roadmap Inicial

**Fase 1 – MVP (Prova ALEGO)**
- [ ] Modelagem de banco de dados (questões e usuários)
- [ ] Módulo de calibragem
- [ ] Simulado no formato FGV
- [ ] Avaliação automática com relatórios

**Fase 2 – IA e Feedback**
- [ ] Integração com LLM (análise e correção discursiva)
- [ ] Geração de plano de estudo personalizado

**Fase 3 – SaaS Comercial**
- [ ] Painel multi-tenant (plano gratuito e premium)
- [ ] Módulo de pagamento e assinatura
- [ ] Dashboard administrativo de desempenho global

---

## 🔍 Prompt Base para Desenvolvimento
> Você é um especialista em design e desenvolvimento de sistemas educacionais inteligentes.  
> Seu papel é projetar e documentar um **sistema de performance de conhecimento para concursos públicos**, com foco inicial no concurso da ALEGO (cargo Analista Legislativo – Ciência de Dados).  
>  
> O sistema deve permitir calibragem de candidatos, simulações adaptativas, avaliação automática, análise por IA (LLM) e relatórios personalizados.  
>  
> Crie diagramas, estruturas de banco, fluxos de interface e recomendações de implementação em cada etapa.

---

## 🧾 Fonte de Dados
- **Edital ALEGO nº 01/2025 (FGV)**  
- **Referências complementares**: provas FGV anteriores, bases públicas de questões, material estatístico e de legislação de Goiás.

---

## 🧩 Licença
Projeto inicial sob licença MIT – voltado a uso acadêmico e comercial controlado.

---

**Autor:** Ronen Filho  
**Projeto:** Decode – Performance de Conhecimento  
**Data:** Novembro/2025  
