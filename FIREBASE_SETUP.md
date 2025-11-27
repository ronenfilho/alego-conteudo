# Sistema de Estudos - Firebase

Sistema completo de gerenciamento de estudos para processos seletivos com autenticação e persistência em nuvem usando Firebase.

## 🚀 Funcionalidades

- ✅ **Autenticação**: Login com Google ou Email/Senha
- ✅ **Gestão de Processos**: Criar, editar e excluir processos seletivos
- ✅ **Conteúdo em Markdown**: Organize seus estudos com formatação markdown
- ✅ **Controle de Progresso**: Acompanhe seu progresso em cada tópico (0-10)
- ✅ **Persistência em Nuvem**: Dados salvos no Firebase Firestore
- ✅ **Multi-dispositivo**: Acesse de qualquer lugar

## 📋 Estrutura do Projeto

```
alego-conteudo/
├── public/                    # Pasta pública (hospedada no Firebase)
│   ├── index.html            # Página inicial (redireciona para login)
│   ├── login.html            # Página de login/cadastro
│   ├── processos.html        # Lista de processos seletivos
│   ├── estudo.html           # Página de controle de estudos
│   ├── css/
│   │   ├── login.css
│   │   └── processos.css
│   └── js/
│       ├── firebase-config.js    # Configuração do Firebase
│       ├── auth.js               # Lógica de autenticação
│       └── processos.js          # Lógica de processos
├── firebase.json             # Configuração do Firebase Hosting
├── .firebaserc              # ID do projeto Firebase
├── firestore.rules          # Regras de segurança do Firestore
└── firestore.indexes.json   # Índices do Firestore
```

## 🔧 Configuração

### 1. Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Dê um nome ao projeto (ex: `alego-conteudo`)
4. Siga as instruções até concluir

### 2. Ativar Serviços

#### Authentication (Autenticação)
1. No menu lateral, vá em **Authentication**
2. Clique em "Começar"
3. Ative os provedores:
   - **Email/Password**: Clique em "Email/senha" e ative
   - **Google**: Clique em "Google" e ative (forneça email de suporte)

#### Firestore Database
1. No menu lateral, vá em **Firestore Database**
2. Clique em "Criar banco de dados"
3. Escolha **modo de produção**
4. Selecione a localização (ex: `us-east1` ou mais próxima)

### 3. Configurar o Código

#### Obter credenciais do Firebase

1. No Firebase Console, vá em **Configurações do projeto** (ícone de engrenagem)
2. Role até "Seus aplicativos"
3. Clique no ícone **</>** (Web)
4. Registre o app com um nome (ex: `Sistema de Estudos`)
5. **Não** marque Firebase Hosting por enquanto
6. Copie o objeto `firebaseConfig`

#### Editar `public/js/firebase-config.js`

Abra o arquivo `public/js/firebase-config.js` e substitua as credenciais:

```javascript
export const firebaseConfig = {
    apiKey: "sua-api-key-aqui",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto-id",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123def456"
};
```

#### Editar `.firebaserc`

Substitua `YOUR_PROJECT_ID` pelo ID do seu projeto:

```json
{
  "projects": {
    "default": "seu-projeto-id"
  }
}
```

### 4. Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

### 5. Fazer Login no Firebase

```bash
firebase login
```

### 6. Deploy das Regras do Firestore

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### 7. Deploy do Hosting

```bash
firebase deploy --only hosting
```

Seu site estará disponível em: `https://alego-conteudo.web.app`

## 🧪 Testar Localmente

Para testar antes de fazer deploy:

```bash
firebase emulators:start
```

Acesse: `http://localhost:5000`

## 📱 Como Usar

### 1. Fazer Login
- Acesse a página inicial
- Faça login com Google ou crie uma conta com email/senha

### 2. Criar Processo Seletivo
- Na página de processos, clique em "**➕ Estudo**"
- Preencha:
  - **Nome**: Nome do processo (ex: "Analista Legislativo - ALEGO")
  - **Descrição**: Descrição opcional
  - **Conteúdo**: Cole o conteúdo em Markdown
- Clique em "Salvar"

### 3. Formato do Conteúdo Markdown

```markdown
# Analista Legislativo - ALEGO

## Conhecimentos Gerais - 20

### Português - 10
- Interpretação de texto
- Ortografia
- Gramática
- Concordância verbal

### Raciocínio Lógico - 10
- Sequências
- Proposições lógicas
- Tabelas verdade

## Conhecimentos Específicos - 30

### Direito Constitucional - 15
- Princípios fundamentais
- Direitos e garantias
- Organização do Estado
```

**Regras:**
- Use `##` para categorias principais
- Use `###` para disciplinas
- Use `-` para listar tópicos
- Números após o nome indicam quantidade de questões (opcional)

### 4. Estudar
- Clique em um processo para abrir a página de estudos
- Use os sliders (0-10) para marcar seu progresso em cada tópico
- O progresso é salvo automaticamente
- Acompanhe estatísticas gerais e por disciplina

### 5. Exportar/Importar Progresso
- **Exportar**: Baixe um arquivo JSON com seu progresso
- **Importar**: Carregue um arquivo JSON previamente exportado
- **Resetar**: Limpa todo o progresso (irreversível)

## 🔒 Segurança

As regras do Firestore garantem que:
- Usuários só podem ler seus próprios processos
- Usuários só podem criar processos associados à sua conta
- Usuários só podem editar/excluir seus próprios processos
- Dados de outros usuários são completamente inacessíveis

## 🆘 Solução de Problemas

### Erro de autenticação
- Verifique se ativou os provedores em Authentication
- Confirme que as credenciais em `firebase-config.js` estão corretas

### Erro ao carregar processos
- Verifique se fez deploy das regras: `firebase deploy --only firestore:rules`
- Verifique se criou o índice: `firebase deploy --only firestore:indexes`
- Abra o console do navegador (F12) e verifique erros

### Erro de permissão no Firestore
- As regras de segurança estão ativas
- Verifique se está logado com o usuário correto
- Cada usuário só vê seus próprios processos

## 📝 Comandos Úteis

```bash
# Deploy completo
firebase deploy

# Deploy apenas hosting
firebase deploy --only hosting

# Deploy apenas firestore
firebase deploy --only firestore

# Ver logs
firebase functions:log

# Abrir Firebase Console
firebase open
```

## 🎯 Próximos Passos

Possíveis melhorias:
- 
- [ ] Compartilhamento de processos entre usuários
- [ ] Temas (modo escuro)
- [ ] Gráficos de progresso
- [ ] Notificações de estudo
- [ ] App mobile (PWA)
- [ ] Exportar para PDF
- [ ] Adicionar imagens no markdown

## 📄 Licença

Projeto de código aberto. Use livremente!

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

---

**Desenvolvido com ❤️ para facilitar seus estudos**
