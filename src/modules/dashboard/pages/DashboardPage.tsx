import { useState, useEffect } from 'react';
import { useUser } from '../../auth/hooks/useAuth';
import { useDashboardData } from '../hooks/useDashboardData';
import { BalanceCard } from '../components/BalanceCard';
import { IncomeCard } from '../components/IncomeCard';
import { ExpenseCard } from '../components/ExpenseCard';
import { RecentTransactions } from '../components/RecentTransactions';
import { ExpenseChart } from '../components/ExpenseChart';
import { GoalsSummaryCard } from '../components/GoalsSummaryCard';
import { Skeleton } from '../../../core/ui/components/skeleton';
import { SortableWidget } from '../components/SortableWidget';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

type WidgetId = 'balance' | 'income' | 'expense' | 'expense-chart' | 'goals' | 'recent-transactions';

interface WidgetDef {
  id: WidgetId;
  className: string;
}

const DEFAULT_WIDGET_ORDER: WidgetDef[] = [
  { id: 'balance', className: 'col-span-1 md:col-span-2 lg:col-span-4' },
  { id: 'income', className: 'col-span-1 md:col-span-2 lg:col-span-4' },
  { id: 'expense', className: 'col-span-1 md:col-span-2 lg:col-span-4' },
  { id: 'expense-chart', className: 'col-span-1 md:col-span-6 lg:col-span-6' },
  { id: 'goals', className: 'col-span-1 md:col-span-3 lg:col-span-3' },
  { id: 'recent-transactions', className: 'col-span-1 md:col-span-3 lg:col-span-3' }
];

const STORAGE_KEY = 'dashboard-widget-order';

export function DashboardPage() {
  const user = useUser();
  const { data, isLoading, isError } = useDashboardData(user?.id);

  const [widgets, setWidgets] = useState<WidgetDef[]>(DEFAULT_WIDGET_ORDER);

  useEffect(() => {
    const savedOrder = localStorage.getItem(STORAGE_KEY);
    if (savedOrder) {
      try {
        const parsedIds = JSON.parse(savedOrder) as string[];
        if (Array.isArray(parsedIds) && parsedIds.length === DEFAULT_WIDGET_ORDER.length) {
          const orderedWidgets = parsedIds.map(id => DEFAULT_WIDGET_ORDER.find(w => w.id === id)).filter(Boolean) as WidgetDef[];
          if (orderedWidgets.length === DEFAULT_WIDGET_ORDER.length) {
            setWidgets(orderedWidgets);
          }
        }
      } catch (e) {
        console.error('Failed to parse dashboard widget order', e);
      }
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newOrder = arrayMove(items, oldIndex, newIndex) as WidgetDef[];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrder.map(w => w.id)));
        return newOrder;
      });
    }
  };

  const renderWidget = (id: WidgetId) => {
    if (!data) return null;
    switch (id) {
      case 'balance':
        return <BalanceCard balance={data.summary.balance} investmentsTotal={data.investmentsTotal} accountsCount={data.summary.accountsCount} />;
      case 'income':
        return <IncomeCard amount={data.summary.monthlyIncome} change={data.summary.monthlyIncomeChange} />;
      case 'expense':
        return <ExpenseCard amount={data.summary.monthlyExpense} change={data.summary.monthlyExpenseChange} />;
      case 'expense-chart':
        return <ExpenseChart data={data.expensesByCategory} />;
      case 'goals':
        return <GoalsSummaryCard summary={data.goalsSummary} />;
      case 'recent-transactions':
        return <RecentTransactions transactions={data.recentTransactions} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-6 lg:grid-cols-12">
          {DEFAULT_WIDGET_ORDER.map((widget) => (
             <Skeleton key={widget.id} className={`h-[120px] md:h-[300px] w-full ${widget.className}`} />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
        Ocorreu um erro ao carregar os dados do dashboard.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Visão Geral</h2>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid gap-4 grid-cols-1 md:grid-cols-6 lg:grid-cols-12">
          <SortableContext
            items={widgets.map((w) => w.id)}
            strategy={rectSortingStrategy}
          >
            {widgets.map((widget) => (
              <SortableWidget key={widget.id} id={widget.id} className={widget.className}>
                {renderWidget(widget.id)}
              </SortableWidget>
            ))}
          </SortableContext>
        </div>
      </DndContext>
    </div>
  );
}
