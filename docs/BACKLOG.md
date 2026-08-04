# Backlog do Produto - Conta Comigo

## 1. Visão Geral
Este documento traduz toda a visão do produto (PRD, Arquitetura, Banco de Dados, API e Design) em itens acionáveis de trabalho. O Backlog é um artefato vivo, priorizado com base na entrega de valor contínuo e estruturado utilizando metodologias ágeis (Scrum/Kanban).

**Critérios de Priorização (MoSCoW):**
*   **Must Have (Obrigatório):** Itens essenciais para o MVP (Minimum Viable Product). Sem eles, o produto não funciona.
*   **Should Have (Importante):** Itens de alto valor, mas que possuem *workarounds* temporários.
*   **Could Have (Desejável):** Melhorias que aumentam o engajamento e a qualidade da experiência (Nice to have).
*   **Won't Have (Não nesta versão):** Ideias valiosas, mas postergadas para versões futuras (V2).

---

## 2. Épicos e Features

Abaixo está o detalhamento dos Épicos do sistema.

### Épico 1: Autenticação e Segurança
*   **Feature 1.1:** Login / Cadastro via E-mail e Senha.
*   **Feature 1.2:** Login Social (Google). [DONE]
*   **Feature 1.3:** Recuperação de Senha.

### Épico 2: Estrutura Base (Contas e Categorias)
*   **Feature 2.1:** Gestão de Contas Bancárias.
*   **Feature 2.2:** Gestão de Categorias (Receitas/Despesas).

### Épico 3: Motor Financeiro (Transações)
*   **Feature 3.1:** Lançamento de Despesas e Receitas Simples.
*   **Feature 3.2:** Lançamentos Recorrentes e Parcelados.
*   **Feature 3.3:** Transferências entre Contas.

### Épico 4: Cartões de Crédito [DONE]
*   **Feature 4.1:** Cadastro e Gestão de Cartões. (Concluído)
*   **Feature 4.2:** Faturas e Pagamento de Faturas. (Concluído)
*   **Feature 4.3:** Compras no crédito e parcelamentos. (Concluído)
*   *Nota:* Motor de recorrências automáticas via Cron/Edge Function permanece como melhoria futura.

### Épico 5: Dashboard e Relatórios
*   **Feature 5.1:** Dashboard Consolidado (Saldos e Gráfico Base).
*   **Feature 5.2:** Relatórios Mensais e Exportação (PDF/CSV).

### Épico 6: Inteligência e Planejamento
*   **Feature 6.1:** Objetivos Financeiros (Metas).
*   **Feature 6.2:** Orçamentos por Categoria. [DONE]
*   **Feature 6.3:** Calendário financeiro. [DONE]
*   *Nota:* Melhorias futuras de projeção avançada de parcelamentos e cartões no calendário.

### Épico 7: Investimentos
*   **Feature 7.1:** Carteira de Ativos.
*   **Feature 7.2:** Proventos e Rentabilidade.

### Épico 8: Configurações e Perfil
*   **Feature 8.1:** Customização de Perfil (Tema, Moeda).
*   **Feature 8.2:** LGPD e Deleção de Dados.

---

## 3. Histórias de Usuário, Critérios de Aceite e Estimativas

Abaixo está a decomposição das principais Features em Histórias de Usuário (US). 
*As estimativas (Pontos) utilizam a sequência de Fibonacci (1, 2, 3, 5, 8, 13).*

### Épico 1: Autenticação
**US-01: Cadastro via E-mail**
*   *Como* usuário recém-chegado
*   *Quero* me cadastrar utilizando meu e-mail e uma senha forte
*   *Para* criar meu espaço seguro de gestão financeira.
*   **Critérios de Aceite:** Validar e-mail, senha mínima de 8 caracteres; Enviar e-mail de confirmação (Supabase Auth); Criar registro na tabela `profiles` via Trigger.
*   **Prioridade:** Must Have
*   **Estimativa:** 5 Pontos

**US-02: Login Social (Google) [CONCLUÍDA]**
*   *Como* usuário frequente
*   *Quero* fazer login com apenas um clique via Google
*   *Para* acessar minha conta rapidamente sem lembrar senhas.
*   **Critérios de Aceite:** Integração OAuth Google configurada no Supabase; Redirecionamento correto após sucesso.
*   **Status:** Concluída utilizando Supabase Auth OAuth Google.
*   **Prioridade:** Should Have
*   **Estimativa:** 3 Pontos

### Épico 2: Estrutura Base
**US-03: Cadastro de Conta Bancária**
*   *Como* usuário do sistema
*   *Quero* cadastrar minhas contas bancárias informando o saldo inicial
*   *Para* refletir fielmente meu dinheiro em diferentes instituições.
*   **Critérios de Aceite:** Campos obrigatórios: Nome, Tipo, Saldo; Bloquear cadastro duplicado com mesmo nome; Gravar no Supabase (RLS protegido).
*   **Prioridade:** Must Have
*   **Estimativa:** 5 Pontos

### Épico 3: Motor Financeiro
**US-04: Adicionar Despesa Simples**
*   *Como* usuário do sistema
*   *Quero* registrar um gasto (Despesa)
*   *Para* que o valor seja abatido do meu saldo atual.
*   **Critérios de Aceite:** Input de valor "tipo calculadora"; Selecionar conta e categoria; Deduzir imediatamente do saldo no cache local (Optimistic Update).
*   **Dependência:** Requer US-03 (Contas) concluída.
*   **Prioridade:** Must Have
*   **Estimativa:** 8 Pontos

**US-05: Adicionar Compra Parcelada**
*   *Como* usuário do sistema
*   *Quero* registrar uma compra no cartão dividida em várias vezes
*   *Para* que o sistema projete automaticamente as faturas dos próximos meses.
*   **Critérios de Aceite:** Informar número de parcelas; Gerar registros atrelados à `transaction_installments`; Distribuição do valor entre os meses seguintes.
*   **Prioridade:** Should Have
*   **Estimativa:** 13 Pontos (Alta Complexidade)

### Épico 5: Dashboard e Relatórios
**US-06: Visão Geral de Saldos**
*   *Como* usuário do sistema
*   *Quero* ver meu saldo total e saldo de investimentos na tela principal
*   *Para* ter ciência imediata da minha capacidade financeira diária.
*   **Critérios de Aceite:** Soma correta de todas as contas do tipo CHECKING/CASH; Atualização em tempo real via Supabase Subscriptions.
*   **Prioridade:** Must Have
*   **Estimativa:** 5 Pontos

---

