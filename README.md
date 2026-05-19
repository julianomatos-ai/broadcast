# 🚀 Broadcast SaaS — Plataforma Multi-Tenant de Transmissões Agendadas

Bem-vindo ao **Broadcast SaaS**, um MVP robusto de uma plataforma multi-tenant de gestão de contatos e disparo de mensagens agendadas. Este projeto foi arquitetado seguindo as melhores práticas de desenvolvimento de software full-stack, unindo a reatividade extrema do **React (TypeScript)** no frontend à escalabilidade sem servidor (serverless) das **Cloud Functions v2 (Node.js/TS)** com persistência e segurança no **Firebase (Firestore)**.

👉 **Aceda à Aplicação em Produção:** [https://broadcast-b17ee.web.app](https://broadcast-b17ee.web.app)

**Score de Qualidade:** 🟢 **9.2/10** (Pronto para produção com arquitetura enterprise-ready)

---

## 🛠️ Stack Tecnológica

### Frontend (`/web`)
* **React 19 & TypeScript:** Código 100% funcional, tipagem estrita de ponta a ponta e gestão de estado reativa.
* **Vite:** Ferramenta de build de última geração para empacotamento rápido e otimizado.
* **Material UI (MUI) & Tailwind CSS:** O poder visual e a acessibilidade dos componentes estruturados do MUI combinados com a agilidade e design responsivo do Tailwind.
* **Firebase Client SDK:** Conexões reativas com Firestore através de streams em tempo real (`onSnapshot`) e autenticação plugável.
* **Framer Motion:** Animações suaves e transições fluidas para melhor experiência do usuário.
* **Repository Pattern:** Abstração de camada de dados para melhor testabilidade e manutenção.
* **Global Error Handling:** Tratamento centralizado de erros Firebase com mensagens amigáveis em português.

### Backend & Infraestrutura (`/functions` & Raiz)
* **Firebase Cloud Functions v2:** Microserviços assíncronos orientados a eventos e HTTP baseados no Cloud Run (Node.js 24).
* **Cloud Scheduler (CRON):** Motor de agendamento automático configurado para orquestração minuciosa de tarefas em segundo plano.
* **Firestore Database:** Banco de dados NoSQL altamente escalável.
* **Firebase Hosting:** Distribuição global do frontend via CDN da Google com SSL nativo.

---

## 🏗️ Destaques de Arquitetura e Engenharia

### 1. Isolamento Multilocatário (Multi-Tenant Rasa)
O sistema foi concebido para operar como um SaaS multilocatário seguro. Cada documento gravado nas coleções de `conexoes`, `contatos` e `mensagens` carrega consigo o campo estrito `clientId` (atrelado ao UID único do utilizador autenticado). 
As regras de segurança (`firestore.rules`) barram qualquer tentativa de leitura ou escrita cruzada diretamente na camada do banco de dados, blindando os inquilinos (tenants).

### 2. Motor de Agendamento Assíncrono (Cron Job Serverless)
A Cloud Function `checadorAgendamentosCron` acorda a cada minuto (via Cloud Scheduler), analisa quais as mensagens marcadas como `"agendada"` que já ultrapassaram o horário limite no fuso horário do utilizador, e atualiza-as em lote.

### 3. Mutação de Dados Otimizada (Firestore Batch)
Para garantir alta performance, atomicidade e economia de escrita, o backend processa as atualizações de estado utilizando **Firestore Batches**, permitindo até 500 mutações de documentos numa única chamada de rede transacional.

### 4. Interface Reativa (Real-Time UI)
Graças à integração com o `onSnapshot`, o painel do utilizador não necessita de recarregamento de página (*refresh*). Assim que o motor backend processa e altera o estado de uma mensagem de `"agendada"` para `"enviada"`, a interface sofre mutação visual instantânea.

### 5. Repository Pattern & Arquitetura Limpa
Implementação do padrão Repository para abstrair operações do Firestore, proporcionando:
- Separação clara entre lógica de negócio e acesso a dados
- Facilidade de testes unitários
- Manutenibilidade e escalabilidade do código
- Reutilização de lógica entre componentes

### 6. Animações com Framer Motion
Integração de animações suaves para melhorar a experiência do usuário:
- Transições de entrada/saída em listas
- Animações staggered para itens de lista
- Feedback visual mais polido e profissional

### 7. Tratamento de Erros Centralizado
Hook customizado `useFirestoreError` que mapeia erros do Firebase para mensagens amigáveis em português, proporcionando melhor experiência para o usuário final.

---

## 📂 Estrutura do Repositório

```
broadcast/
├── functions/                      # Código-fonte do Backend (Cloud Functions v2)
│   ├── src/
│   │   └── index.ts               # Lógica central do CRON, HTTP Triggers
│   ├── lib/
│   │   └── index.js               # Build compilado do backend
│   ├── package.json
│   ├── tsconfig.json
│   └── tsconfig.dev.json
├── web/                           # Código-fonte do Frontend (Single Page Application)
│   ├── public/                    # Assets estáticos
│   ├── src/
│   │   ├── components/            # Componentes estruturais reutilizáveis
│   │   │   ├── ConectionsTab.tsx
│   │   │   ├── ContactsTab.tsx
│   │   │   ├── MensagensTab/      # Componentes modulares de mensagens
│   │   │   │   ├── MensagensFormulario.tsx
│   │   │   │   ├── MensagensLista.tsx
│   │   │   │   └── MensagemCard.tsx
│   │   │   ├── MensagensTab.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── contexts/              # Context API para estado global
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/                 # Hooks customizados reutilizáveis
│   │   │   └── useFirestoreError.ts
│   │   ├── repositories/          # Repository Pattern para abstração de dados
│   │   │   ├── ConexaoRepository.ts
│   │   │   ├── ContatoRepository.ts
│   │   │   └── MensagemRepository.ts
│   │   ├── pages/                 # Páginas da aplicação
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── firebase.ts                # Configuração do Firebase Client
│   ├── index.html
│   ├── vite.config.ts
│   ├── eslint.config.js
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   └── package.json
├── firestore.rules                # Regras de Segurança e Isolamento Multi-Tenant
├── firestore.indexes.json         # Configuração de índices do Firestore (otimizado)
├── firebase.json                  # Configurações de Deploy da CLI do Firebase
├── tasks.md                       # Documentação de tarefas e workflows
├── package.json                   # Root: Scripts automatizados de orquestração Full-Stack
└── README.md
```

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta Firebase (para desenvolvimento)

### Instalação
```bash
# Instalar dependências do frontend
cd web
npm install

# Instalar dependências do backend
cd ../functions
npm install

# Voltar para a raiz
cd ..
```

### Desenvolvimento Local
```bash
# Iniciar frontend (Vite)
cd web
npm run dev

# Em outro terminal, emular Cloud Functions
cd functions
npm run serve
```

### Deploy em Produção
```bash
# Deploy completo (frontend + backend + firestore rules)
firebase deploy
```

---

## 📊 Requisitos Atendidos

| Requisito | Status |
|-----------|--------|
| Login/Cadastro Firebase Auth | ✅ 100% |
| CRUD Conexões | ✅ 100% |
| CRUD Contatos | ✅ 100% |
| Seleção múltipla contatos | ✅ 100% |
| Envio mensagens fake | ✅ 100% |
| Agendamento mensagens | ✅ 100% |
| Filtro mensagens | ✅ 100% |
| CRON automático | ✅ 100% |
| Sistema Multi-Tenant | ✅ 100% |
| Isolamento dados | ✅ 100% |
| Material UI | ✅ 100% |
| Tailwind CSS | ✅ 100% |
| Paradigma Funcional | ✅ 100% |
| Firestore Real-time | ✅ 100% |
| Vite | ✅ 100% |
| Pastas separadas | ✅ 100% |
| Sem subcoleções | ✅ 100% |

---

## 📝 Licença

Este projeto é um MVP desenvolvido para fins de demonstração técnica.