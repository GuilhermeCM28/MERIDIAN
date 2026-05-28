# Guia de Estudo: Como o Meridian foi Construído

Este guia foi criado para ajudar você a entender a fundo como as features do aplicativo foram desenvolvidas, quais tecnologias foram usadas e como as funções TypeScript operam no código. É um material excelente para estudo e consulta!

---

## 1. Arquitetura Base: Next.js App Router

O projeto utiliza o **Next.js 14** com o padrão **App Router** (pasta `/app`).
Neste modelo, existem dois tipos de componentes principais:

- **Server Components (Padrão):** Renderizados no servidor. Eles podem buscar dados diretamente do banco (Supabase) de forma segura, sem expor chaves no navegador. Eles não podem ter interatividade (como `onClick` ou `useState`).
  - *Exemplo no projeto:* A página principal do Dashboard (`app/(dashboard)/page.tsx`) busca o perfil do usuário e as transações diretamente antes de enviar o HTML para a tela.
- **Client Components:** Usam a diretiva `"use client"` na primeira linha. São usados quando precisamos de interatividade (formulários, modais, gráficos).
  - *Exemplo no projeto:* O botão de alternar o tema (`ThemeToggle.tsx`) ou os gráficos (`SpendingChart.tsx`).

---

## 2. Autenticação e Rotas Protegidas (Supabase)

A autenticação foi implementada usando o `@supabase/ssr` (Server-Side Rendering). 

### Como criamos isso:
1. **Clientes Supabase (`lib/supabase/`):**
   - `server.ts`: Usado em Server Components e API Routes. Lê os cookies da requisição para saber quem é o usuário logado.
   - `client.ts`: Usado em Client Components. Atualiza os cookies no próprio navegador.
   - `middleware.ts`: Roda antes de carregar qualquer página. Se o usuário tentar acessar uma rota dentro de `(dashboard)` sem estar logado, o `middleware.ts` força um redirecionamento automático para a página de `/login`.

**Função Principal (TypeScript):**
```typescript
// Exemplo de como buscamos o usuário no servidor (Server Component)
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser() // Pega o usuário logado

  if (!user) return <Redirect href="/login" />
  // ...
}
```

---

## 3. Gestão de Transações (CRUD)

Para exibir e criar transações, dividimos a responsabilidade:

1. **Leitura (Read):** Feita no lado do Servidor. Em `app/(dashboard)/transactions/page.tsx`, executamos uma query via Supabase para pegar as transações.
2. **Criação e Edição (Create/Update):** Feita no lado do Cliente. O componente `TransactionForm.tsx` (e os modais) capturam os dados do usuário.
   - Utilizamos o **Zod** para validar se os dados digitados estão corretos antes de salvar (ex: garantir que o valor não é negativo, garantir que a data existe).
   - Utilizamos o **React Hook Form** para gerenciar os estados dos formulários (para não ter que criar dezenas de variáveis `useState`).

**Exemplo de Query Supabase (TypeScript):**
```typescript
const { data, error } = await supabase
  .from('transactions') // Tabela
  .select('*, category:categories(name)') // Join com a tabela categories
  .eq('user_id', user.id) // Apenas dados DESTE usuário (Segurança)
  .order('date', { ascending: false }) // Mais recentes primeiro
```

---

## 4. Estilização e Temas (Tailwind v4 e CSS)

Nós criamos uma interface "Glassmorphism" (efeito de vidro) e suporte a Modo Escuro/Claro.

- Ao invés de escrever classes complexas espalhadas, usamos "Design Tokens" (Variáveis CSS) no `app/globals.css`.
- As variáveis como `--color-background-primary` mudam seus valores quando a classe `data-theme="dark"` ou `light` é ativada no `<html>`.
- Usamos a diretiva `@theme` (nova funcionalidade do Tailwind v4) para mapear as variáveis do CSS diretamente para as classes do Tailwind (ex: `bg-background-primary`).

---

## 5. Integração com IA (Claude / Anthropic)

A funcionalidade da Inteligência Artificial funciona usando **Route Handlers** (API internas do Next.js).

### Como criamos o Chat (em `app/api/ai/chat/route.ts`):
1. **Recepção:** O cliente envia uma mensagem para `/api/ai/chat`.
2. **Coleta de Contexto:** Antes de falar com a IA, nosso backend vai ao banco de dados e calcula as finanças do usuário no mês atual (renda, gastos por categoria).
3. **Prompt do Sistema:** Criamos uma variável `systemPrompt` (Instrução invisível) que diz ao Claude: *"Você é um assistente financeiro. Os dados deste mês do usuário são X e Y. Responda em português."*
4. **Chamada via SDK:** A função `anthropic.messages.create()` faz o contato com o Claude Opus enviando o histórico e o prompt, de forma completamente transparente para o usuário (a chave da API nunca vaza pro navegador).

**Função Principal:**
```typescript
const response = await anthropic.messages.create({
  model: 'claude-opus-4-7',
  max_tokens: 1024,
  system: systemPrompt, // Dados e contexto financeiro injetado aqui
  messages: [{ role: 'user', content: 'mensagem do usuário' }]
})
```

---

## 6. Segurança e Performance (Rate Limiting)

Para evitar abusos (ou custos altos de API), criamos a função `checkRateLimit` no arquivo `lib/rate-limit.ts`.
- Usamos um simples controle em memória (Map do JS) que armazena o ID do usuário e o número de vezes que ele usou a API de IA nos últimos minutos.
- Se ultrapassar o limite, a API do servidor retorna imediatamente o status HTTP `429 (Too Many Requests)` antes mesmo de chamar o banco ou a Anthropic.

---

## Dica para seus estudos 🚀

1. Explore a pasta `app/api/ai/` para entender como o Backend do Next.js funciona.
2. Explore a pasta `components/ui/` para ver como botões, badges e temas foram componentizados.
3. Leia o arquivo `database.types.ts` dentro de `supabase/`. Ele contém todo o "mapa" do seu banco de dados em TypeScript, o que garante que o editor de código sempre vai te ajudar a preencher os nomes de colunas corretos quando você digitar `supabase.from(...)`.
