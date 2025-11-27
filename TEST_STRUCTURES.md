# Teste das Estruturas de Markdown

## Estrutura 1: Curso > Área > Disciplina > Conteúdos

```markdown
# Concurso ALEGO 2025

## Conhecimentos Básicos

### Língua Portuguesa
1. Compreensão e interpretação de textos
2. Ortografia oficial
3. Acentuação gráfica

### Raciocínio Lógico
1. Estruturas lógicas
2. Lógica de argumentação
3. Diagramas lógicos

## Conhecimentos Específicos

### Direito Constitucional
1. Princípios fundamentais
2. Direitos e garantias fundamentais
3. Organização do Estado

### Direito Administrativo
1. Princípios da Administração Pública
2. Atos administrativos
3. Licitações e contratos
```

**Resultado esperado:**
- Categoria 1: "Conhecimentos Básicos"
  - Disciplina: "Língua Portuguesa" (3 tópicos)
  - Disciplina: "Raciocínio Lógico" (3 tópicos)
- Categoria 2: "Conhecimentos Específicos"
  - Disciplina: "Direito Constitucional" (3 tópicos)
  - Disciplina: "Direito Administrativo" (3 tópicos)

---

## Estrutura 2: Categoria > Disciplina > Conteúdos (sem H1)

```markdown
## Conhecimentos Básicos

### Língua Portuguesa
1. Compreensão e interpretação de textos
2. Ortografia oficial
3. Acentuação gráfica

### Matemática
1. Números e operações
2. Álgebra básica
3. Geometria

## Conhecimentos Específicos

### Informática
1. Sistemas operacionais
2. Editores de texto
3. Planilhas eletrônicas

### Legislação
1. Constituição Federal
2. Leis orgânicas
3. Regimentos internos
```

**Resultado esperado:**
- Categoria 1: "Conhecimentos Básicos"
  - Disciplina: "Língua Portuguesa" (3 tópicos)
  - Disciplina: "Matemática" (3 tópicos)
- Categoria 2: "Conhecimentos Específicos"
  - Disciplina: "Informática" (3 tópicos)
  - Disciplina: "Legislação" (3 tópicos)

---

## Estrutura 3: Categoria (H1) > Disciplina (H2) > Conteúdos

```markdown
# Conhecimentos Básicos

## Língua Portuguesa
1. Compreensão e interpretação de textos
2. Ortografia oficial
3. Acentuação gráfica
4. Pontuação

## Raciocínio Lógico
1. Estruturas lógicas
2. Lógica de argumentação
3. Diagramas lógicos

# Conhecimentos Específicos

## Direito Constitucional
1. Princípios fundamentais
2. Direitos e garantias fundamentais
3. Organização do Estado

## Direito Administrativo
1. Princípios da Administração Pública
2. Atos administrativos
3. Licitações e contratos
```

**Resultado esperado:**
- Categoria 1: "Conhecimentos Básicos"
  - Disciplina: "Língua Portuguesa" (4 tópicos)
  - Disciplina: "Raciocínio Lógico" (3 tópicos)
- Categoria 2: "Conhecimentos Específicos"
  - Disciplina: "Direito Constitucional" (3 tópicos)
  - Disciplina: "Direito Administrativo" (3 tópicos)

---

## Compatibilidade com Estruturas Antigas

O parser continua funcionando com estruturas antigas que já foram salvas:

```markdown
## Categoria Antiga

### Disciplina
- Tópico com traço
- Outro tópico
* Tópico com asterisco
• Tópico com bullet
```

Todos os marcadores (-, *, •, 1., 2., etc) são removidos corretamente.
