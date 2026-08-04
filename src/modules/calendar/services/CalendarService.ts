import { transactionService } from '../../transactions/services/TransactionService';
import { subscriptionService } from '../../subscriptions/services/SubscriptionService';
import { creditCardsService } from '../../credit-cards/services/CreditCardsService';
import { CalendarEvent } from '../types';
import { addMonths, format, parseISO } from 'date-fns';

export class CalendarService {
  async getEventsForMonth(userId: string, month: number, year: number) {
    try {
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];

      const events: CalendarEvent[] = [];

      // 1. Existing Transactions
      const { data: transactions } = await transactionService.getTransactions({
        userId,
        startDate,
        endDate
      });

      if (transactions) {
        transactions.forEach(tx => {
          events.push({
            id: tx.id,
            date: tx.date,
            title: tx.description,
            amount: tx.amount,
            type: tx.type,
            status: tx.status,
            source: 'transaction',
            category_color: tx.categories?.color,
            category_icon: tx.categories?.icon
          });
        });
      }

      // 2. Future subscriptions
      // A simple projection: get all subscriptions and project them onto this month if their billing day is valid
      const { data: subscriptions } = await subscriptionService.getSubscriptions(userId);
      if (subscriptions) {
        subscriptions.forEach((sub: any) => {
          // If the subscription has a billing_day, project it
          const bDay = sub.billing_day || 1;
          const projectedDate = new Date(year, month - 1, bDay);
          const dateStr = format(projectedDate, 'yyyy-MM-dd');
          
          // Check if a transaction for this subscription already exists in this month to avoid duplicates
          // We can check by description or recurrence_id if we have it on tx
          const alreadyExists = events.some(e => e.date === dateStr && e.title.includes(sub.site));
          
          if (!alreadyExists && projectedDate >= new Date()) { // Only project future if desired, or just all missing
            events.push({
              id: `sub-${sub.id}-${month}-${year}`,
              date: dateStr,
              title: `Assinatura: ${sub.site}`,
              amount: sub.amount || 0,
              type: 'EXPENSE',
              status: 'UNPAID', // Future is unpaid
              source: 'subscription'
            });
          }
        });
      }

      // Sort events by date
      events.sort((a, b) => a.date.localeCompare(b.date));

      return { data: events, error: null };
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return { data: null, error };
    }
  }
}

export const calendarService = new CalendarService();
