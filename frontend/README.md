# VITAS Frontend

Frontend PWA (Progressive Web App) do sistema VITAS, desenvolvido com React, TypeScript, Vite e Capacitor para suporte multiplataforma (Web, iOS, Android).

## 🚀 Tecnologias

- **React 18** - Biblioteca UI
- **TypeScript 5** - Tipagem estática
- **Vite 5** - Build tool e dev server
- **Tailwind CSS 3** - Framework CSS utility-first
- **React Router 6** - Roteamento
- **React Query 5** - Gerenciamento de estado do servidor
- **Zustand 4** - State management offline
- **Axios** - Cliente HTTP
- **Capacitor 5** - Runtime nativo para iOS/Android
- **vite-plugin-pwa** - Suporte PWA com Service Worker

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Backend VITAS rodando em `http://localhost:3000`

## 🔧 Instalação

1. Clone o repositório e entre na pasta do frontend:

```bash
cd frontend
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

Edite o arquivo `.env` se necessário (padrão: `http://localhost:3000/api`).

## 🏃 Desenvolvimento

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O app estará disponível em `http://localhost:5173`.

## 🏗️ Build

### Build Web/PWA

```bash
npm run build
```

Os arquivos de produção estarão em `dist/`.

### Preview do Build

```bash
npm run preview
```

## 📱 Mobile (Capacitor)

### Adicionar plataformas

```bash
# iOS
npx cap add ios

# Android
npx cap add android
```

### Sincronizar código web com plataformas nativas

```bash
npm run build
npx cap sync
```

### Abrir projetos nativos

```bash
# iOS (requer macOS)
npx cap open ios

# Android (requer Android Studio)
npx cap open android
```

## 🎨 Estrutura do Projeto

```
frontend/
├── public/              # Arquivos estáticos
├── src/
│   ├── components/      # Componentes reutilizáveis
│   │   ├── Layout.tsx
│   │   └── PrivateRoute.tsx
│   ├── contexts/        # Contextos React
│   │   └── AuthContext.tsx
│   ├── lib/             # Utilitários e configurações
│   │   ├── api.ts       # Cliente axios
│   │   └── offline.ts   # Store offline (Zustand)
│   ├── pages/           # Páginas da aplicação
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Home.tsx
│   │   ├── Cases.tsx
│   │   ├── Groups.tsx
│   │   ├── Profile.tsx
│   │   └── NotFound.tsx
│   ├── App.tsx          # Componente raiz com rotas
│   ├── main.tsx         # Entry point
│   └── index.css        # Estilos globais
├── capacitor.config.ts  # Configuração Capacitor
├── vite.config.ts       # Configuração Vite
├── tailwind.config.js   # Configuração Tailwind
└── package.json
```

## 🔐 Autenticação

O app utiliza JWT (JSON Web Tokens) para autenticação:

- **Access Token**: Armazenado em `localStorage`, expira em 15 minutos
- **Refresh Token**: Usado para renovar o access token, expira em 7 dias
- **Auto-refresh**: Interceptor axios renova tokens automaticamente em 401

### Fluxo de autenticação

1. Login/Register → Backend retorna tokens
2. Tokens salvos em `localStorage`
3. Requisições incluem `Authorization: Bearer {accessToken}`
4. Em caso de 401, interceptor tenta refresh automático
5. Se refresh falhar, redireciona para `/login`

## 📴 Suporte Offline

O app suporta modo offline através de:

- **Service Worker**: Cache de assets estáticos
- **Zustand Store**: Fila de ações pendentes
- **Indicador visual**: Ícone Wifi/WifiOff no header
- **Sincronização**: Ao voltar online, ações pendentes são processadas

## 🎯 Funcionalidades Implementadas

- ✅ Autenticação (login, registro, logout)
- ✅ Layout responsivo (desktop + mobile)
- ✅ Navegação com React Router
- ✅ Dashboard com estatísticas
- ✅ Perfil de usuário editável
- ✅ Suporte offline básico
- ✅ PWA instalável
- ⏳ Integração completa com backend (em andamento)
- ⏳ Upload de arquivos/fotos
- ⏳ Push notifications

## 📜 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run lint         # Executar ESLint
```

## 🌐 Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `VITE_API_URL` | URL base da API backend | `http://localhost:3000/api` |

## 🔍 Debugging

### DevTools

- **React DevTools**: Extensão do Chrome/Firefox
- **Network tab**: Inspecionar requisições HTTP
- **Application tab**: Ver localStorage, Service Worker, Cache

### Logs

```typescript
// Ativar logs de requisições
// src/lib/api.ts - adicionar interceptor
api.interceptors.request.use(config => {
  console.log('Request:', config);
  return config;
});
```

## 📄 Licença

Propriedade de VITAS - Todos os direitos reservados.

## 👥 Equipe

Desenvolvido pela equipe VITAS.

---

**VITAS** - Sistema de Gestão de Cuidados
