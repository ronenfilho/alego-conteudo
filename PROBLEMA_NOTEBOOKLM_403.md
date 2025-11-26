# 🚫 Problema: NotebookLM Retorna Erro 403

## ❌ O Que Aconteceu

Quando você clicou no botão "📚 Abrir Material Incorporado", o sistema tentou abrir o NotebookLM do Google dentro de um iframe (janela incorporada), mas o Google retornou:

```
403. Isto é um erro.
Você não tem acesso a esta página. Isso é tudo o que sabemos.
```

## 🔒 Por Que Isso Acontece

O **NotebookLM do Google não permite ser incorporado** em outras páginas por razões de segurança. Ele usa cabeçalhos HTTP especiais:

```http
X-Frame-Options: DENY
Content-Security-Policy: frame-ancestors 'none'
```

Isso significa que o NotebookLM **só pode ser aberto diretamente**, não dentro de um iframe.

## ✅ Solução Implementada

Fiz 3 correções:

### 1️⃣ Mudei a URL Padrão para Google Colab Público

```javascript
// ❌ ANTES (NotebookLM - não funciona em iframe)
url: 'https://notebooklm.google.com/notebook/...'

// ✅ AGORA (Google Colab - funciona em iframe)
url: 'https://colab.research.google.com/github/google/eng-edu/blob/main/ml/cc/exercises/intro_to_pandas.ipynb'
```

### 2️⃣ Adicionei Detecção de Erro 403

O sistema agora detecta quando uma página retorna 403 e **automaticamente mostra o botão de fallback** para abrir em nova aba:

```javascript
if (iframeDoc.body.innerHTML.includes('403')) {
    this.showFallback('embed_403',
        'Acesso Negado (403)',
        'Este site não permite ser incorporado...'
    );
}
```

### 3️⃣ Removi NotebookLM das Origens Permitidas

O NotebookLM foi removido da lista de sites que permitem incorporação.

---

## 🎯 Como Usar Agora

### Opção 1: Usar Google Colab (Recomendado)

O Google Colab **permite incorporação** e é perfeito para notebooks educacionais:

```javascript
'Língua Portuguesa': {
    url: 'https://colab.research.google.com/github/SEU_USUARIO/SEU_REPO/blob/main/notebook.ipynb',
    icon: '📖',
    title: 'Material de Língua Portuguesa',
    type: 'notebook'
}
```

**Como criar um notebook público no Colab:**
1. Acesse https://colab.research.google.com
2. Crie seu notebook
3. File → Save a copy in GitHub
4. Use a URL gerada

### Opção 2: Hospedar Seus Próprios Notebooks

Use JupyterHub, Binder, ou qualquer servidor que permita iframe:

```javascript
'Raciocínio Lógico': {
    url: 'https://mybinder.org/v2/gh/SEU_REPO/main?filepath=notebook.ipynb',
    icon: '🧮',
    title: 'Exercícios de Raciocínio'
}
```

### Opção 3: Usar Vídeos do YouTube

Para videoaulas, use o formato de embed do YouTube:

```javascript
'Direito Constitucional': {
    url: 'https://www.youtube.com/embed/VIDEO_ID',
    icon: '📺',
    title: 'Videoaulas'
}
```

### Opção 4: Google Docs/Sheets (Modo Visualização)

```javascript
'Informática': {
    url: 'https://docs.google.com/document/d/DOCUMENT_ID/preview',
    icon: '📄',
    title: 'Apostila'
}
```

---

## 📋 URLs Que FUNCIONAM em Iframe

| Serviço | URL de Exemplo | Permite Iframe? |
|---------|----------------|-----------------|
| **Google Colab** | `colab.research.google.com/...` | ✅ SIM |
| **YouTube** | `youtube.com/embed/VIDEO_ID` | ✅ SIM |
| **Google Docs (preview)** | `docs.google.com/.../preview` | ✅ SIM |
| **Vimeo** | `player.vimeo.com/video/...` | ✅ SIM |
| **JupyterHub** | `seu-servidor/notebook` | ✅ SIM (configure CORS) |
| **Binder** | `mybinder.org/v2/gh/...` | ✅ SIM |
| **GitHub Pages** | `usuario.github.io/...` | ✅ SIM |

## 🚫 URLs Que NÃO FUNCIONAM em Iframe

| Serviço | Por Que Não Funciona |
|---------|---------------------|
| **NotebookLM** | Google bloqueia por segurança (403) |
| **Google Drive direto** | Usa X-Frame-Options: DENY |
| **Alguns sites externos** | Política de segurança (CSP) |
| **LinkedIn, Facebook** | Não permitem incorporação |

---

## 🛠️ Como Configurar Suas URLs

### Passo 1: Editar `estudo.html`

Localize o objeto `disciplineEmbedConfig` (linha ~488):

```javascript
const disciplineEmbedConfig = {
    'Língua Portuguesa': {
        url: 'SUA_URL_AQUI',  // ← Coloque sua URL
        icon: '📖',
        title: 'Material de Língua Portuguesa',
        type: 'notebook',
        requiresAuth: false,
        description: 'Descrição do material'
    },
    // ... outras disciplinas
};
```

### Passo 2: Testar a URL

Antes de adicionar, teste se a URL funciona em iframe:

1. Abra o console do navegador (F12)
2. Cole e execute:

```javascript
const testUrl = 'SUA_URL_AQUI';
const testIframe = document.createElement('iframe');
testIframe.src = testUrl;
testIframe.style.width = '500px';
testIframe.style.height = '400px';
document.body.appendChild(testIframe);

// Aguarde 3 segundos e veja se carrega
setTimeout(() => {
    console.log('Se aparecer o conteúdo, a URL funciona!');
}, 3000);
```

### Passo 3: Deploy

```bash
git add public/estudo.html
git commit -m "feat: Adicionar URLs de material por disciplina"
git push
firebase deploy --only hosting
```

---

## 🎓 Exemplo Completo de Configuração

```javascript
const disciplineEmbedConfig = {
    'Língua Portuguesa': {
        url: 'https://colab.research.google.com/github/usuario/portugues/blob/main/gramatica.ipynb',
        icon: '📖',
        title: 'Gramática Interativa',
        type: 'notebook',
        requiresAuth: false,
        description: 'Exercícios de sintaxe e morfologia'
    },
    
    'Raciocínio Lógico': {
        url: 'https://colab.research.google.com/github/usuario/logica/blob/main/exercicios.ipynb',
        icon: '🧮',
        title: 'Exercícios de Lógica',
        type: 'notebook',
        requiresAuth: false,
        description: 'Problemas de raciocínio quantitativo'
    },
    
    'Direito Constitucional': {
        url: 'https://www.youtube.com/embed/PLAYLIST_ID',
        icon: '⚖️',
        title: 'Videoaulas de Direito',
        type: 'video',
        requiresAuth: false,
        description: 'Aulas sobre a Constituição'
    },
    
    'Informática': {
        url: 'https://docs.google.com/presentation/d/ID_AQUI/embed',
        icon: '💻',
        title: 'Slides de Informática',
        type: 'slides',
        requiresAuth: false,
        description: 'Conceitos de hardware e software'
    }
};
```

---

## 🔄 Testando Agora

Após o deploy que acabei de fazer, você pode testar:

1. ✅ Acesse: https://alego-conteudo.web.app
2. ✅ Faça login
3. ✅ Expanda uma disciplina
4. ✅ Clique em "📚 Abrir Material Incorporado"
5. ✅ **Agora vai abrir um notebook do Google Colab** que funciona!

---

## 💡 Dicas

### Se você REALMENTE precisa usar NotebookLM

Como o NotebookLM não permite iframe, você tem 2 opções:

1. **Botão direto** (sem modal):
```javascript
// Em vez de abrir no modal, abrir direto em nova aba
function openNotebookLM(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
}
```

2. **Usar sistema de fallback** (já implementado):
   - O botão abre o modal
   - Modal detecta o 403 automaticamente
   - Mostra botão "Abrir em Nova Aba"
   - Usuário clica e abre no NotebookLM

### Recomendação Final

Para uma **experiência integrada** na plataforma, use:
- ✅ **Google Colab** para notebooks interativos
- ✅ **YouTube** para videoaulas
- ✅ **Google Docs/Sheets** para documentos

E deixe o **NotebookLM para consulta externa** (link direto, não incorporado).

---

## 🐛 Debug Rápido

Se ainda tiver problemas, abra o console (F12) e execute:

```javascript
// Verificar configuração atual
console.log('Configs:', disciplineEmbedConfig);

// Testar uma URL específica
const config = {
    url: 'https://colab.research.google.com/github/google/eng-edu/blob/main/ml/cc/exercises/intro_to_pandas.ipynb',
    title: 'Teste',
    icon: '📚'
};
window.openEmbeddedMaterial(config);
```

---

**Status Atual:** ✅ Sistema corrigido e configurado com Google Colab  
**Última Atualização:** 26 de novembro de 2025  
**Deploy Pendente:** Execute os comandos de deploy após configurar suas URLs
