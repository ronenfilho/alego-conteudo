# 🔍 Como Encontrar o Botão de Material Incorporado

## ⚠️ IMPORTANTE: O botão só aparece quando você EXPANDE a disciplina!

## 📍 Passo a Passo com Imagens Descritivas

### 1️⃣ Tela Inicial - Disciplinas Fechadas
```
┌─────────────────────────────────────────────────┐
│ 📊 Controle de Estudos                          │
│ ← Voltar                                        │
├─────────────────────────────────────────────────┤
│                                                 │
│ Progresso Geral: [████████░░] 80%              │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│ ▼ Língua Portuguesa                     85%    │  ← CATEGORIA FECHADA
│                                                 │
│ ▼ Raciocínio Lógico                     72%    │  ← CATEGORIA FECHADA
│                                                 │
│ ▼ Direito Constitucional                90%    │  ← CATEGORIA FECHADA
│                                                 │
└─────────────────────────────────────────────────┘
```

**Status:** Botão NÃO aparece ainda! ❌

---

### 2️⃣ Clique na Categoria para Expandir
```
┌─────────────────────────────────────────────────┐
│                                                 │
│ ▼ Língua Portuguesa                     85%    │  ← CLIQUE AQUI!
│   ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑                     │
│   Clique na seta ou no título                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

### 3️⃣ Categoria Expandida - Disciplinas Visíveis
```
┌─────────────────────────────────────────────────┐
│ ▲ Língua Portuguesa                     85%    │  ← CATEGORIA ABERTA
│                                                 │
│   ▼ Gramática                           90%    │  ← DISCIPLINA FECHADA
│                                                 │
│   ▼ Interpretação de Textos            80%    │  ← DISCIPLINA FECHADA
│                                                 │
│   ▼ Redação                             75%    │  ← DISCIPLINA FECHADA
│                                                 │
└─────────────────────────────────────────────────┘
```

**Status:** Ainda não! Precisa expandir a DISCIPLINA também! ⚠️

---

### 4️⃣ Clique na Disciplina para Expandir
```
┌─────────────────────────────────────────────────┐
│   ▼ Gramática                           90%    │  ← CLIQUE AQUI!
│     ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑                   │
│     Clique na seta ou no título                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

### 5️⃣ DISCIPLINA EXPANDIDA - BOTÃO APARECE! ✅
```
┌─────────────────────────────────────────────────┐
│   ▲ Gramática                           90%    │  ← DISCIPLINA ABERTA
│                                                 │
│   ┌───────────────────────────────────────────┐│
│   │ Sintaxe              [████████░░] 8       ││
│   │ Morfologia           [██████░░░░] 6       ││
│   │ Fonética             [██████████] 10      ││
│   │ Semântica            [████████░░] 7       ││
│   └───────────────────────────────────────────┘│
│   ─────────────────────────────────────────────│
│   │ 📚 Abrir Material Incorporado           │ │  ← AQUI ESTÁ! ✅
│   └───────────────────────────────────────────┘│
│                                                 │
└─────────────────────────────────────────────────┘
```

**🎉 ENCONTROU! O botão está no final da lista de tópicos!**

---

## 🎯 Resumo: Onde Está o Botão?

1. ✅ **Expanda a CATEGORIA** (## no markdown)
   - Exemplo: "Língua Portuguesa"
   - Clique na seta ▼ ou no título

2. ✅ **Expanda a DISCIPLINA** (### no markdown)
   - Exemplo: "Gramática", "Interpretação de Textos"
   - Clique na seta ▼ ou no título

3. ✅ **Role até o final dos tópicos**
   - O botão aparece **DEPOIS** de todos os sliders
   - Em um container com fundo cinza claro
   - Texto: "📚 Abrir Material Incorporado"

---

## 🔧 Testando Agora Mesmo

### Opção 1: Via Interface
1. Acesse: https://alego-conteudo.web.app
2. Faça login
3. Escolha um processo
4. **EXPANDA** uma categoria (clique no ▼)
5. **EXPANDA** uma disciplina (clique no ▼)
6. Role até o final
7. Veja o botão: **📚 Abrir Material Incorporado**

### Opção 2: Via Console (Teste Rápido)
Abra o console (F12) e cole:

```javascript
// Forçar abertura de todas as categorias e disciplinas
document.querySelectorAll('.category-content.collapsed').forEach(el => {
    el.classList.remove('collapsed');
});
document.querySelectorAll('.category-toggle.collapsed').forEach(el => {
    el.classList.remove('collapsed');
});
document.querySelectorAll('.discipline-content.collapsed').forEach(el => {
    el.classList.remove('collapsed');
});
document.querySelectorAll('.discipline-toggle-icon.collapsed').forEach(el => {
    el.classList.remove('collapsed');
});

// Agora role a página e verá TODOS os botões de embed!
```

---

## 🐛 Não Está Aparecendo?

### Debug Rápido no Console

```javascript
// 1. Verificar se o botão existe no DOM
console.log('Botões encontrados:', document.querySelectorAll('.discipline-embed-btn').length);

// 2. Se retornar 0, verificar se as disciplinas estão expandidas
console.log('Disciplinas colapsadas:', document.querySelectorAll('.discipline-content.collapsed').length);

// 3. Expandir todas e verificar novamente
document.querySelectorAll('.discipline-content').forEach(el => {
    el.classList.remove('collapsed');
});
console.log('Botões após expandir:', document.querySelectorAll('.discipline-embed-btn').length);

// 4. Verificar um botão específico
const btn = document.querySelector('.discipline-embed-btn');
if (btn) {
    console.log('Botão encontrado:', btn.innerHTML);
    console.log('Visível?', btn.offsetParent !== null);
    btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
} else {
    console.log('❌ Nenhum botão encontrado');
}
```

### Se AINDA não aparecer

```javascript
// Verificar se o JavaScript está carregado
console.log('EmbedModal carregado?', typeof window.openEmbeddedMaterial);
// Deve retornar: "function"

// Se retornar "undefined", recarregar a página
location.reload();
```

---

## ✅ Checklist de Verificação

- [ ] Fiz login na aplicação
- [ ] Escolhi um processo seletivo
- [ ] **Expandir CATEGORIA** (primeiro clique)
- [ ] **Expandir DISCIPLINA** (segundo clique)
- [ ] Rolei até o final dos tópicos
- [ ] Vi o botão com fundo cinza claro
- [ ] Texto do botão: "📚 Abrir Material Incorporado"

---

## 🎨 Aparência do Botão

```css
┌──────────────────────────────────────┐
│ 📚 Abrir Material Incorporado        │  ← Botão
└──────────────────────────────────────┘

Características:
✓ Fundo branco/cinza claro
✓ Ícone de livro (📚)
✓ Texto em roxo (#667eea)
✓ Borda arredondada
✓ Efeito hover (sobe 2px)
✓ Sombra ao passar o mouse
```

---

## 📱 Em Mobile

O botão fica:
- Logo após os sliders de progresso
- Largura total da tela
- Fácil de tocar (min 44px altura)
- Centralizado

---

## 🚀 Após Deploy Atual

✅ **Texto corrigido:** "Abrir Material Incorporado" (antes estava só "Notebook")  
✅ **Borda superior:** Separador visual adicionado  
✅ **Deploy realizado:** Mudanças já estão em produção  

**URL:** https://alego-conteudo.web.app

---

## 💡 Dica Extra

Se quiser ver TODOS os botões de uma vez:

```javascript
// Expandir tudo automaticamente
function expandirTudo() {
    // Expandir categorias
    document.querySelectorAll('.category-toggle.collapsed').forEach(toggle => {
        toggle.closest('.category-container').querySelector('.category-header').click();
    });
    
    // Aguardar animação
    setTimeout(() => {
        // Expandir disciplinas
        document.querySelectorAll('.discipline-toggle-icon.collapsed').forEach(icon => {
            icon.closest('.discipline-header').click();
        });
    }, 500);
}

// Executar
expandirTudo();

// Aguardar 1 segundo e rolar para o primeiro botão
setTimeout(() => {
    const btn = document.querySelector('.discipline-embed-btn');
    if (btn) {
        btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        btn.style.outline = '3px solid red'; // Destacar
    }
}, 1500);
```

---

**Encontrou o botão?** 🎉  
Agora é só clicar e testar o modal de embed!

**Ainda não apareceu?** 🤔  
Copie o resultado dos comandos de debug no console e me envie!
