# Sistema de Material Incorporado (Embed) por Disciplina

## 📋 Visão Geral

Sistema completo para incorporação segura de materiais externos (notebooks, vídeos, páginas) dentro da aplicação de estudos, com modal full-screen, postMessage, analytics e fallbacks.

## 🎯 Funcionalidades Implementadas

### ✅ Core Features
- [x] Modal full-screen responsivo (desktop/mobile)
- [x] Botão por disciplina no cartão
- [x] Lazy-load de iframe
- [x] Loading state com spinner e barra de progresso
- [x] Timeout configurável (20s default)
- [x] Fallback com opções de nova aba
- [x] Comunicação via postMessage segura
- [x] Validação de origens permitidas
- [x] Sandbox do iframe com permissões mínimas
- [x] Acessibilidade (ARIA, ESC, foco)
- [x] Analytics tracking
- [x] Botão "Reportar Problema"

### 🔐 Segurança
- [x] Verificação de origens permitidas no postMessage
- [x] Sandbox com políticas restritivas
- [x] Preparado para tokens JWT assinados (backend necessário)
- [x] CSP configurável
- [x] Validação de URLs

### 📱 Responsividade
- [x] Modal adapta para mobile/tablet/desktop
- [x] Layout vertical em mobile
- [x] Botões e controles otimizados para touch

## 🚀 Como Usar

### 1. Adicionar Material a uma Disciplina

Edite o objeto `disciplineEmbedConfig` no arquivo `estudo.html`:

```javascript
const disciplineEmbedConfig = {
    'Nome da Disciplina': {
        url: 'https://sua-url-aqui.com',
        icon: '📚',
        title: 'Título do Material',
        type: 'notebook', // ou 'video', 'page', 'app'
        requiresAuth: false // true se precisa de token
    }
};
```

### 2. Configurar via Firestore (Recomendado)

1. Crie um documento na coleção `embedConfigs` no Firestore
2. Use o console do Firebase ou o script `embed-config-manager.js`

Exemplo:
```javascript
await window.EmbedConfigManager.save({
    disciplina: 'Matemática',
    url: 'https://colab.research.google.com/...',
    icon: '🔢',
    title: 'Exercícios de Matemática',
    type: 'notebook',
    requiresAuth: false,
    fallbackUrl: 'https://drive.google.com/file/...',
    description: 'Notebook com 50 exercícios',
    loadTimeout: 25000,
    sandbox: ['allow-scripts', 'allow-same-origin'],
    allowedOrigins: ['https://colab.research.google.com']
});
```

### 3. Abrir Material Programaticamente

```javascript
window.openEmbeddedMaterial({
    url: 'https://exemplo.com/material',
    title: 'Meu Material',
    icon: '📖',
    discipline: 'Português',
    type: 'notebook'
});
```

## 📂 Estrutura de Arquivos

```
public/
├── css/
│   ├── estudo.css           # Estilos principais
│   └── embed-modal.css      # Estilos do modal de embed
├── js/
│   ├── embed-modal.js       # Lógica do modal e postMessage
│   └── embed-config-manager.js  # Gerenciamento de configurações
└── estudo.html              # Página principal com integração
```

## 🔧 Configurações Avançadas

### Timeout Personalizado

```javascript
embedModalInstance.LOADING_TIMEOUT = 30000; // 30 segundos
```

### Origens Permitidas

Edite no `embed-modal.js`:

```javascript
const allowedOrigins = [
    'https://notebooklm.google.com',
    'https://colab.research.google.com',
    'https://seu-dominio.com'
];
```

### Permissões do Iframe (Sandbox)

No HTML do modal:

```html
sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
```

Opções disponíveis:
- `allow-scripts` - Permite JavaScript
- `allow-same-origin` - Permite acesso à mesma origem
- `allow-forms` - Permite envio de formulários
- `allow-popups` - Permite popups
- `allow-downloads` - Permite downloads
- `allow-modals` - Permite modals
- `allow-orientation-lock` - Permite lock de orientação
- `allow-pointer-lock` - Permite pointer lock
- `allow-presentation` - Permite API de apresentação

## 📡 Comunicação PostMessage

### Mensagens Suportadas (iframe → host)

```javascript
// Iframe pronto
{ type: 'ready' }

// Ajustar altura
{ type: 'height', height: 800 }

// Navegação
{ type: 'navigate', url: 'https://...' }

// Anotação
{ type: 'annotation', data: {...} }

// Solicitar autenticação
{ type: 'request-auth' }

// Analytics
{ type: 'analytics', event: 'event_name', properties: {...} }

// Exercício completo
{ type: 'exercise_completed', exerciseId: '123', score: 85 }
```

### Mensagens Suportadas (host → iframe)

```javascript
// Configuração inicial
{
    type: 'config',
    userId: 'user-123',
    discipline: 'Matemática'
}

// Token de autenticação
{
    type: 'auth-token',
    token: 'jwt-token-here'
}
```

## 🔒 Segurança - Implementação Backend (Necessário)

### 1. Cloud Function para Assinar URLs

Crie uma Cloud Function no Firebase:

```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');

exports.signEmbedUrl = functions.https.onCall(async (data, context) => {
    // Verificar autenticação
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
    }
    
    const { url, discipline } = data;
    const userId = context.auth.uid;
    
    // Criar token JWT
    const token = jwt.sign({
        userId,
        discipline,
        originalUrl: url,
        exp: Math.floor(Date.now() / 1000) + 3600 // 1 hora
    }, process.env.JWT_SECRET);
    
    // Retornar URL com token
    const urlObj = new URL(url);
    urlObj.searchParams.set('token', token);
    
    return { signedUrl: urlObj.toString() };
});
```

### 2. Verificação no Iframe (se for seu próprio conteúdo)

```javascript
// No seu notebook/app incorporado
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

// Verificar token com backend
const response = await fetch('/api/verify-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
});

if (response.ok) {
    // Token válido, carregar conteúdo
    const data = await response.json();
    console.log('Usuário:', data.userId);
} else {
    // Token inválido
    alert('Acesso negado');
}
```

## 📊 Analytics

Eventos rastreados automaticamente:

- `modal_opened` - Modal aberto
- `modal_closed` - Modal fechado
- `iframe_ready` - Iframe carregado
- `fallback_shown` - Fallback exibido (com motivo)
- `opened_new_tab` - Aberto em nova aba
- `problem_reported` - Problema reportado
- `exercise_completed` - Exercício completo (via postMessage)

### Implementar Envio para Analytics

Edite `embed-modal.js`:

```javascript
async flushAnalytics() {
    if (this.analyticsQueue.length === 0) return;
    
    // Enviar para Firebase Analytics
    if (window.firebase && window.firebase.analytics) {
        const analytics = window.firebase.analytics();
        this.analyticsQueue.forEach(event => {
            analytics.logEvent(event.event, event);
        });
    }
    
    // Ou enviar para seu backend
    await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.analyticsQueue)
    });
    
    this.analyticsQueue = [];
}
```

## 🐛 Troubleshooting

### Modal não abre
- Verificar se `embed-modal.js` está carregado
- Verificar console para erros
- Confirmar que `initEmbedModal()` foi chamado

### Iframe não carrega
- Verificar se a URL permite embedding (X-Frame-Options)
- Testar URL diretamente no navegador
- Verificar timeout (aumentar se necessário)
- Ver console para erros de CORS/CSP

### PostMessage não funciona
- Verificar origens permitidas no código
- Confirmar que o iframe está enviando mensagens corretas
- Usar `console.log` para debugar mensagens

### Fallback sempre aparece
- Verificar lista de domínios em `checkEmbedPermission()`
- Adicionar domínio à lista ou desabilitar checagem temporariamente

## 🎨 Customização

### Cores e Estilos

Edite `embed-modal.css`:

```css
.embed-modal-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.embed-btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Ícones

Substitua emojis por ícones de biblioteca (Font Awesome, Material Icons):

```html
<span class="material-icons">book</span>
```

## 📋 Checklist de Deploy

- [ ] Testar em desktop, tablet e mobile
- [ ] Verificar todas as origens permitidas
- [ ] Configurar Cloud Functions (se usar auth)
- [ ] Configurar Firestore rules
- [ ] Adicionar configurações de disciplinas
- [ ] Testar fallbacks
- [ ] Configurar analytics
- [ ] Testar acessibilidade (tab, ESC, leitor de tela)
- [ ] Fazer deploy do Firebase Hosting

```bash
firebase deploy --only firestore:rules
firebase deploy --only hosting
```

## 🔄 Próximos Passos

1. **Implementar backend para signed URLs** (Cloud Functions)
2. **Adicionar cache de configurações** (localStorage + Firestore)
3. **Interface admin** para gerenciar embedConfigs
4. **Versionamento de materiais** (histórico de versões)
5. **Progresso sincronizado** (salvar progresso do iframe no Firestore)
6. **Download offline** (Service Worker para materiais)
7. **Comentários e anotações** (persistir no Firestore)

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs do console
2. Revisar esta documentação
3. Testar em ambiente local primeiro
4. Reportar issues com prints e logs

---

**Versão:** 1.0.0  
**Data:** 26/11/2025  
**Status:** ✅ Implementado e pronto para uso
