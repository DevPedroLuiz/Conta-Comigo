# Conta Comigo - Sistema de Gestão Financeira Pessoal

## Visão Geral
Sistema profissional para gestão de finanças pessoais, projetado para escalar para milhares de usuários. O ecossistema é composto por uma aplicação Web e um aplicativo Android nativo, operando sob uma arquitetura de Monorepo com backend Serverless.

## Tecnologias Principais
- **Frontend Web:** React, Vite (adaptado do Next.js para este ambiente), TypeScript, Tailwind CSS, Shadcn/UI.
- **Frontend Mobile:** React Native, Expo (Estrutura planejada para o ecossistema externo).
- **Gerenciamento de Estado/Dados:** TanStack Query, React Hook Form, Zod.
- **Backend/Database:** Supabase (PostgreSQL, Auth, Storage, Edge Functions).

## Princípios de Engenharia
- **Clean Architecture & SOLID:** Separação clara de responsabilidades, regras de negócio isoladas de frameworks.
- **DRY & KISS:** Código reutilizável, simples e de fácil manutenção.
- **Segurança First:** RLS (Row Level Security) no Supabase, validações com Zod em todas as pontas, sanitização e proteção CSRF/XSS.
- **Performance:** Lazy loading, otimização de bundle, paginação e cache distribuído (TanStack Query).

## Status do Projeto
Atualmente na **Fase 1: Planejamento, Arquitetura e Documentação**.
Consulte o arquivo `ROADMAP.md` para visualizar as próximas entregas.
