# 🚀 Roadmap: Ideias para Novas Features (Meridian)

Este documento reúne sugestões e propostas arquitetadas para continuar evoluindo o **Meridian**, tornando-o um aplicativo financeiro ainda mais robusto e inteligente.

---

## 🤖 1. IA Ativa (Function Calling no Claude)
Atualmente, a IA atua apenas como conselheira lendo seus dados. A ideia é transformá-la em um **Agente Ativo**.
- **Como funciona:** Você digita *"Comprei um lanche no McDonald's por R$ 35 agora"*. O Claude entende a intenção, extrai o valor, a data (hoje), categoriza como "Alimentação" e **salva a transação no banco de dados automaticamente**.
- **Técnica:** Uso de *Function Calling* (ou Tool Use) na API do Anthropic.

## 💳 2. Controle Inteligente de Parcelamentos
Aprofundar a gestão de transações para cobrir compras em cartão de crédito.
- **Como funciona:** Ao registrar uma compra, você marca "Parcelado em X vezes". O sistema insere automaticamente todas as parcelas futuras já com a nomenclatura "Compra Y (1/10)", "Compra Y (2/10)" nos meses seguintes.
- **Visualização:** Uma aba dedicada para mostrar o "Comprometimento Futuro" da renda baseado apenas em faturas a vencer.

## 🏆 3. Gamificação e Conquistas (Badges)
Incentivar a economia através de recompensas visuais.
- **Como funciona:** Quando o usuário atinge certas marcas (ex: "Ficou abaixo do orçamento de Lazer por 3 meses seguidos", "Atingiu 50% da Meta de Viagem"), ele ganha *Badges* no perfil.
- **Benefício:** Aumenta exponencialmente a retenção (engajamento) e torna o processo de economizar mais divertido.

## 🌍 4. Modo Viagem (Multi-Moeda)
Ideal para controle de finanças internacionais sem bagunçar os relatórios padrões.
- **Como funciona:** Criação de "Wallets" temporárias. Você inicia uma viagem ("Europa 2026"), lança gastos em Euros (€), e o sistema converte automaticamente para BRL (usando uma API de câmbio) para mostrar o impacto real no seu orçamento, mas preservando o valor original na moeda local.

## 👨‍👩‍👧‍👦 5. Modo Família / Contas Conjuntas
Para casais ou famílias que dividem os mesmos gastos.
- **Como funciona:** O modelo de permissões (RLS do Supabase) é alterado para permitir "Workspaces". Duas contas diferentes do Meridian podem acessar um espaço compartilhado para lançar despesas de casa, mantendo separadas as despesas individuais.

## 📄 6. Exportação Avançada em PDF
Hoje o sistema possui exportação bruta em formato CSV (Excel).
- **Como funciona:** Geração de um "Extrato Executivo" lindo em PDF. O PDF compilaria os gráficos gerados pelo Recharts, as dicas fornecidas pela IA no mês e as tabelas, ideal para arquivamento pessoal ou prestação de contas.

## 🔎 7. Filtros Avançados e Busca Global
- **Como funciona:** Uma barra de pesquisa rápida (`Cmd + K` ou `Ctrl + K`) no topo do dashboard que permite pesquisar transações passadas apenas digitando (ex: "Oficina", "Netflix"). 
- Além disso, filtros múltiplos nas tabelas: buscar por tags, por range customizado de datas ou múltiplas categorias ao mesmo tempo.

---

> **Dica:** Caso queira implementar alguma destas funcionalidades no futuro, basta copiar a ideia deste arquivo e me pedir para criar o **Plano de Implementação** dela!
