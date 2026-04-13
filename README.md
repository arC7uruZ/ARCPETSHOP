# Arc Pet Shop

Site completo para gerenciamento de uma pet shop, com agendamento de serviços, autenticação de usuários e integração com WhatsApp.

## Stack

- **Frontend:** SvelteKit 2 + Svelte 5 (runes), Tailwind CSS 3, tailwind-variants, lucide-svelte
- **Backend:** SvelteKit Server (SSR + API routes)
- **Banco de dados / Auth / Storage:** Supabase
- **Notificações:** Twilio WhatsApp
- **Testes:** Vitest (unitários) + Playwright (E2E)
- **Linguagem:** TypeScript

## Funcionalidades

- Cadastro e login de usuários (Supabase Auth)
- Gerenciamento de pets por usuário
- Agendamento de serviços em 4 etapas
- Dashboard com histórico de agendamentos
- Perfil do usuário editável
- CTA via WhatsApp
- Notificações via Twilio WhatsApp

## Serviços disponíveis

- Banho e Tosa
- Consulta Veterinária
- Vacinação
- Hospedagem Pet
- Adestramento
- Pet Taxi

## Páginas

| Rota | Descrição |
|---|---|
| `/` | Home |
| `/services` | Listagem de serviços |
| `/booking` | Agendamento (requer autenticação) |
| `/auth/login` | Login |
| `/auth/register` | Cadastro |
| `/dashboard` | Painel do usuário |
| `/profile` | Perfil do usuário |

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=
PUBLIC_WHATSAPP_NUMBER=
```

### 3. Banco de dados

Execute o arquivo `src/lib/supabase/schema.sql` no SQL Editor do Supabase para criar as tabelas (`profiles`, `pets`, `services`, `appointments`) e popular os 6 serviços.

### 4. Rodar em desenvolvimento

```bash
npm run dev
```

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run check` | Verificação de tipos Svelte |
| `npm run lint` | Lint + formatação |
| `npm run format` | Formatar código |
| `npm run test:unit` | Testes unitários (Vitest) |
| `npm run test:e2e` | Testes E2E (Playwright) |
| `npm run test` | Todos os testes |
| `npm run db:types` | Gerar tipos TypeScript do Supabase |

## Estrutura do projeto

```
src/
├── lib/
│   ├── components/   # Componentes reutilizáveis
│   ├── config/       # Configurações da aplicação
│   ├── server/       # Lógica exclusiva do servidor
│   ├── stores/       # Stores Svelte 5 (.svelte.ts)
│   ├── supabase/     # Cliente Supabase + schema SQL
│   ├── types/        # Tipos TypeScript
│   └── utils/        # Funções utilitárias
└── routes/           # Rotas SvelteKit
    ├── api/          # API endpoints
    ├── auth/         # Login e cadastro
    ├── booking/      # Agendamento
    ├── dashboard/    # Painel do usuário
    ├── profile/      # Perfil
    └── services/     # Listagem de serviços
```
