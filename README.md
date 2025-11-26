# Alego Conteúdo

Sistema de gerenciamento de estudos para concursos com controle de progresso por tópicos e materiais de apoio.

## Funcionalidades

- **Gestão de Processos**: Crie e gerencie processos seletivos (concursos, provas, etc)
- **Controle de Progresso**: Acompanhe evolução por categoria/disciplina/tópico (escala 0-10)
- **Notebooks por Tópico**: Adicione múltiplos materiais (links) para cada tópico com nomes personalizados
- **Estado de Expansão**: Sistema salva automaticamente quais categorias/disciplinas estão abertas
- **Responsivo**: Layout otimizado para desktop (botões verticais) e mobile (botões horizontais)
- **Firebase**: Autenticação e armazenamento em tempo real

## Tecnologias

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Firebase (Authentication, Firestore, Hosting)
- **Deploy**: Firebase Hosting

## Estrutura

```
public/
├── login.html          # Autenticação
├── processos.html      # Lista de processos
├── estudo.html         # Página principal de estudos
├── css/
│   ├── login.css
│   ├── processos.css
│   └── estudo.css
└── js/
    ├── firebase-config.js
    ├── auth.js
    └── processos.js
```

## Como usar

1. Clone o repositório
2. Configure Firebase: `firebase init`
3. Deploy: `firebase deploy --only hosting`
4. Acesse: https://alego-conteudo.web.app

## Desenvolvido por

Decode - Sistema de Performance de Conhecimento
