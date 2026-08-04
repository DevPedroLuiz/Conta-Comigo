import { TransactionType, TransactionStatus } from '../transactions/types/transaction.types';

export interface CalendarEvent {
  id: string; // can be transaction id, or a generated id for future ones
  date: string;
  title: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  source: 'transaction' | 'installment' | 'subscription' | 'invoice';
  category_color?: string;
  category_icon?: string;
}
