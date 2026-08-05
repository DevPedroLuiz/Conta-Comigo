import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense, ComponentType } from 'react';
import { MainLayout } from '../core/ui/layout/MainLayout';
import { AuthLayout } from '../core/ui/layout/AuthLayout';
import { AuthGuard } from './guards/AuthGuard';
import { GuestGuard } from './guards/GuestGuard';
import { OnboardingGuard } from './guards/OnboardingGuard';
import { Spinner } from '../core/ui/components/spinner';

const withSuspense = (Component: ComponentType) => (
  <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Spinner className="h-8 w-8" /></div>}>
    <Component />
  </Suspense>
);

const LoginPage = lazy(() => import('../modules/auth/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../modules/auth/pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('../modules/auth/pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('../modules/auth/pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const VerifyEmailPage = lazy(() => import('../modules/auth/pages/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage })));
const OnboardingPage = lazy(() => import('../modules/onboarding/pages/OnboardingPage').then(m => ({ default: m.OnboardingPage })));
const DashboardPage = lazy(() => import('../modules/dashboard/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const TransactionsPage = lazy(() => import('../modules/transactions/pages/TransactionsPage').then(m => ({ default: m.TransactionsPage })));
const TransactionCreatePage = lazy(() => import('../modules/transactions/pages/TransactionCreatePage').then(m => ({ default: m.TransactionCreatePage })));
const TransactionEditPage = lazy(() => import('../modules/transactions/pages/TransactionEditPage').then(m => ({ default: m.TransactionEditPage })));
const AccountsPage = lazy(() => import('../modules/accounts/pages/AccountsPage').then(m => ({ default: m.AccountsPage })));
const AccountCreatePage = lazy(() => import('../modules/accounts/pages/AccountCreatePage').then(m => ({ default: m.AccountCreatePage })));
const AccountEditPage = lazy(() => import('../modules/accounts/pages/AccountEditPage').then(m => ({ default: m.AccountEditPage })));
const CategoriesPage = lazy(() => import('../modules/categories/pages/CategoriesPage').then(m => ({ default: m.CategoriesPage })));
const CategoryCreatePage = lazy(() => import('../modules/categories/pages/CategoryCreatePage').then(m => ({ default: m.CategoryCreatePage })));
const CategoryEditPage = lazy(() => import('../modules/categories/pages/CategoryEditPage').then(m => ({ default: m.CategoryEditPage })));
const GoalsPage = lazy(() => import('../modules/goals/pages/GoalsPage').then(m => ({ default: m.GoalsPage })));
const GoalCreatePage = lazy(() => import('../modules/goals/pages/GoalCreatePage').then(m => ({ default: m.GoalCreatePage })));
const GoalEditPage = lazy(() => import('../modules/goals/pages/GoalEditPage').then(m => ({ default: m.GoalEditPage })));
const ReportsPage = lazy(() => import('../modules/reports/pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const BudgetsPage = lazy(() => import('../modules/budgets/pages/BudgetsPage').then(m => ({ default: m.BudgetsPage })));
const BudgetCreatePage = lazy(() => import('../modules/budgets/pages/BudgetCreatePage').then(m => ({ default: m.BudgetCreatePage })));
const BudgetEditPage = lazy(() => import('../modules/budgets/pages/BudgetEditPage').then(m => ({ default: m.BudgetEditPage })));
const CalendarPage = lazy(() => import('../modules/calendar/pages/CalendarPage').then(m => ({ default: m.CalendarPage })));
const SettingsPage = lazy(() => import('../modules/settings/pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const CreditCardsPage = lazy(() => import('../modules/credit-cards/pages/CreditCardsPage').then(m => ({ default: m.CreditCardsPage })));
const CreditCardCreatePage = lazy(() => import('../modules/credit-cards/pages/CreditCardCreatePage').then(m => ({ default: m.CreditCardCreatePage })));
const CreditCardInvoicesPage = lazy(() => import('../modules/credit-cards/pages/CreditCardInvoicesPage').then(m => ({ default: m.CreditCardInvoicesPage })));
const SubscriptionsPage = lazy(() => import('../modules/subscriptions/pages/SubscriptionsPage').then(m => ({ default: m.SubscriptionsPage })));
const InvestmentsPage = lazy(() => import('../modules/investments/pages/InvestmentsPage').then(m => ({ default: m.InvestmentsPage })));
const InvestmentCreatePage = lazy(() => import('../modules/investments/pages/InvestmentCreatePage').then(m => ({ default: m.InvestmentCreatePage })));
const AssetCreatePage = lazy(() => import('../modules/investments/pages/AssetCreatePage').then(m => ({ default: m.AssetCreatePage })));
const AssetDetailsPage = lazy(() => import('../modules/investments/pages/AssetDetailsPage').then(m => ({ default: m.AssetDetailsPage })));
const MovementCreatePage = lazy(() => import('../modules/investments/pages/MovementCreatePage').then(m => ({ default: m.MovementCreatePage })));
const DividendCreatePage = lazy(() => import('../modules/investments/pages/DividendCreatePage').then(m => ({ default: m.DividendCreatePage })));

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
      { path: 'login', element: withSuspense(LoginPage) },
      { path: 'register', element: withSuspense(RegisterPage) },
      { path: 'forgot-password', element: withSuspense(ForgotPasswordPage) },
      { path: 'reset-password', element: withSuspense(ResetPasswordPage) },
      { path: 'verify-email', element: withSuspense(VerifyEmailPage) },
    ],
  },
  {
    path: '/onboarding',
    element: (
      <AuthGuard>
        {withSuspense(OnboardingPage)}
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
      { path: 'dashboard', element: withSuspense(DashboardPage) },
      { path: 'transactions', element: withSuspense(TransactionsPage) },
      { path: 'transactions/new', element: withSuspense(TransactionCreatePage) },
      { path: 'transactions/:id/edit', element: withSuspense(TransactionEditPage) },
      { path: 'accounts', element: withSuspense(AccountsPage) },
      { path: 'accounts/new', element: withSuspense(AccountCreatePage) },
      { path: 'accounts/:id/edit', element: withSuspense(AccountEditPage) },
      { path: 'categories', element: withSuspense(CategoriesPage) },
      { path: 'categories/new', element: withSuspense(CategoryCreatePage) },
      { path: 'categories/:id/edit', element: withSuspense(CategoryEditPage) },
      { path: 'goals', element: withSuspense(GoalsPage) },
      { path: 'goals/new', element: withSuspense(GoalCreatePage) },
      { path: 'goals/:id/edit', element: withSuspense(GoalEditPage) },
      { path: 'reports', element: withSuspense(ReportsPage) },
      { path: 'budgets', element: withSuspense(BudgetsPage) },
      { path: 'budgets/new', element: withSuspense(BudgetCreatePage) },
      { path: 'budgets/:id/edit', element: withSuspense(BudgetEditPage) },
      { path: 'calendar', element: withSuspense(CalendarPage) },
      { path: 'settings', element: withSuspense(SettingsPage) },
      { path: 'credit-cards', element: withSuspense(CreditCardsPage) },
      { path: 'credit-cards/new', element: withSuspense(CreditCardCreatePage) },
      { path: 'credit-cards/:id/invoices', element: withSuspense(CreditCardInvoicesPage) },
      { path: 'subscriptions', element: withSuspense(SubscriptionsPage) },
      { path: 'investments', element: withSuspense(InvestmentsPage) },
      { path: 'investments/new', element: withSuspense(InvestmentCreatePage) },
      { path: 'investments/assets/new', element: withSuspense(AssetCreatePage) },
      { path: 'investments/assets/:id', element: withSuspense(AssetDetailsPage) },
      { path: 'investments/assets/:id/movement', element: withSuspense(MovementCreatePage) },
      { path: 'investments/assets/:id/dividend', element: withSuspense(DividendCreatePage) },
    ],
  },
]);
