import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../core/ui/layout/MainLayout';
import { AuthLayout } from '../core/ui/layout/AuthLayout';
import { AuthGuard } from './guards/AuthGuard';
import { GuestGuard } from './guards/GuestGuard';
import { OnboardingGuard } from './guards/OnboardingGuard';
import { LoginPage } from '../modules/auth/pages/LoginPage';
import { RegisterPage } from '../modules/auth/pages/RegisterPage';
import { ForgotPasswordPage } from '../modules/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../modules/auth/pages/ResetPasswordPage';
import { VerifyEmailPage } from '../modules/auth/pages/VerifyEmailPage';
import { OnboardingPage } from '../modules/onboarding/pages/OnboardingPage';
import { DashboardPage } from '../modules/dashboard/pages/DashboardPage';
import { TransactionsPage } from '../modules/transactions/pages/TransactionsPage';
import { TransactionCreatePage } from '../modules/transactions/pages/TransactionCreatePage';
import { TransactionEditPage } from '../modules/transactions/pages/TransactionEditPage';

import { AccountsPage } from '../modules/accounts/pages/AccountsPage';
import { AccountCreatePage } from '../modules/accounts/pages/AccountCreatePage';
import { AccountEditPage } from '../modules/accounts/pages/AccountEditPage';

// Placeholder components just for route resolving
import { CategoriesPage } from '../modules/categories/pages/CategoriesPage';
import { CategoryCreatePage } from '../modules/categories/pages/CategoryCreatePage';
import { CategoryEditPage } from '../modules/categories/pages/CategoryEditPage';
import { GoalsPage } from '../modules/goals/pages/GoalsPage';
import { GoalCreatePage } from '../modules/goals/pages/GoalCreatePage';
import { GoalEditPage } from '../modules/goals/pages/GoalEditPage';
import { ReportsPage } from '../modules/reports/pages/ReportsPage';

import { SettingsPage } from '../modules/settings/pages/SettingsPage';
import { BudgetsPage } from '../modules/budgets/pages/BudgetsPage';
import { BudgetCreatePage } from '../modules/budgets/pages/BudgetCreatePage';
import { BudgetEditPage } from '../modules/budgets/pages/BudgetEditPage';
import { CalendarPage } from '../modules/calendar/pages/CalendarPage';
import { CreditCardsPage } from '../modules/credit-cards/pages/CreditCardsPage';
import { CreditCardCreatePage } from '../modules/credit-cards/pages/CreditCardCreatePage';
import { CreditCardInvoicesPage } from '../modules/credit-cards/pages/CreditCardInvoicesPage';
import { SubscriptionsPage } from '../modules/subscriptions/pages/SubscriptionsPage';


export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/',
    element: (
      <GuestGuard>
        <AuthLayout />
      </GuestGuard>
    ),
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
      { path: 'verify-email', element: <VerifyEmailPage /> },
    ],
  },
  {
    path: '/onboarding',
    element: (
      <AuthGuard>
        <OnboardingPage />
      </AuthGuard>
    ),
  },
  {
    path: '/',
    element: (
      <OnboardingGuard>
        <MainLayout />
      </OnboardingGuard>
    ),
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'transactions', element: <TransactionsPage /> },
      { path: 'transactions/new', element: <TransactionCreatePage /> },
      { path: 'transactions/:id/edit', element: <TransactionEditPage /> },
      { path: 'accounts', element: <AccountsPage /> },
      { path: 'accounts/new', element: <AccountCreatePage /> },
      { path: 'accounts/:id/edit', element: <AccountEditPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'categories/new', element: <CategoryCreatePage /> },
      { path: 'categories/:id/edit', element: <CategoryEditPage /> },
      { path: 'goals', element: <GoalsPage /> },
      { path: 'goals/new', element: <GoalCreatePage /> },
      { path: 'goals/:id/edit', element: <GoalEditPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'budgets', element: <BudgetsPage /> },
      { path: 'budgets/new', element: <BudgetCreatePage /> },
      { path: 'budgets/:id/edit', element: <BudgetEditPage /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'credit-cards', element: <CreditCardsPage /> },
      { path: 'credit-cards/new', element: <CreditCardCreatePage /> },
      { path: 'credit-cards/:id/invoices', element: <CreditCardInvoicesPage /> },
      { path: 'subscriptions', element: <SubscriptionsPage /> },

    ],
  },
]);
