# Meridian - Aplicativo de Finanças Pessoais

O Meridian é um aplicativo completo de gestão de finanças pessoais desenvolvido com o objetivo de ajudar os usuários a controlarem suas receitas, despesas e metas financeiras de forma inteligente, contando com o apoio de Inteligência Artificial para dicas e análises personalizadas.

## 🚀 Funcionalidades Principais

### 1. Autenticação e Segurança
- Login e Cadastro seguros utilizando **Supabase Auth**.
- Sessões protegidas e persistidas através do Next.js SSR (Server-Side Rendering).

### 2. Gestão de Transações
- Registro de transações (receitas e despesas) com categorias customizáveis.
- Listagem detalhada de transações com suporte a filtros e ordenação.
- Edição, exclusão e visualização rápida das movimentações.
- (Suporte em andamento para transações recorrentes).

### 3. Painel de Controle (Dashboard)
- Visão geral rápida do saldo atual, total de receitas e despesas do mês.
- Gráficos interativos diários e mensais demonstrando o fluxo de caixa.

### 4. Objetivos Financeiros (Metas)
- Criação de metas financeiras personalizadas (ex: "Viagem", "Reserva de Emergência").
- Registro de depósitos específicos para cada meta.
- Acompanhamento visual do progresso de cada objetivo através de barras de progresso e estatísticas.

### 5. Relatórios e Análises
- Análise de gastos divididos por categorias em gráficos de pizza interativos.
- Tabelas detalhadas de relatórios financeiros mensais.
- Funcionalidade para **exportação de dados em CSV**, facilitando o backup e uso em planilhas externas.

### 6. Inteligência Artificial Integrada (Claude)
- **Assistente de Chat Integrado:** Converse com um consultor financeiro virtual alimentado pelo Claude (Anthropic), que possui contexto do seu resumo financeiro mensal para fornecer conselhos altamente personalizados.
- **Dicas Financeiras Automáticas:** O app analisa seus hábitos de consumo e gera automaticamente insights práticos e acionáveis para melhorar sua saúde financeira.

### 7. Interface e Experiência de Usuário (UI/UX)
- Interface moderna com **Glassmorphism** e design premium.
- Suporte nativo para **Dark Mode** e **Light Mode** (com transições suaves).
- Componentes interativos animados com Framer Motion.
- Totalmente responsivo, funcionando perfeitamente no celular, tablet ou desktop.

---

## 🛠️ Stack Tecnológica

O projeto foi construído utilizando tecnologias modernas e robustas para garantir performance e manutenibilidade:

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Biblioteca UI:** [React 18](https://react.dev/)
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend & Banco de Dados:** [Supabase](https://supabase.com/) (PostgreSQL & Auth)
- **Inteligência Artificial:** [Anthropic SDK (Claude Opus 4.7)](https://www.anthropic.com/)
- **Gráficos:** [Recharts](https://recharts.org/)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Validação de Dados:** [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/)
- **Animações:** [Framer Motion](https://www.framer.com/motion/)

---

## 📂 Estrutura do Projeto

A arquitetura do projeto segue o padrão do Next.js App Router:

- `/app`: Rotas da aplicação (Dashboard, Autenticação, API Routes para a IA).
- `/components`: Componentes reutilizáveis isolados por contexto (UI genérica, Transações, Metas, Relatórios, IA).
- `/lib`: Funções utilitárias, configurações do Supabase, rate-limiting e clientes externos (Anthropic).
- `/supabase`: Configurações de banco de dados e arquivos de migração (PostgreSQL).

---

## 💻 Como Rodar o Projeto

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure as variáveis de ambiente baseando-se no `.env.example` (se disponível) criando um `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=seu_url_aqui
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_key_aqui
   ANTHROPIC_API_KEY=sua_api_key_do_claude
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Acesse `http://localhost:3000` no seu navegador.
