import { transactionRepository, GetTransactionsFilters, referenceRepository } from '../repositories/TransactionRepository';
import { TransactionFormData } from '../schemas/transaction.schemas';
import { addMonths, parseISO, format } from 'date-fns';

export class TransactionService {
  async getTransactions(filters: GetTransactionsFilters) {
    try {
      const data = await transactionRepository.getTransactions(filters);
      return { data, error: null };
    } catch (error: unknown) {
      console.error('Error getting transactions:', error);
      if (error instanceof Error) {
        return { data: null, error: { message: error.message } };
      }
      return { data: null, error: { message: 'Ocorreu um erro inesperado.' } };
    }
  }

  async getTransactionById(userId: string, transactionId: string) {
    try {
      const data = await transactionRepository.getTransactionById(userId, transactionId);
      return { data, error: null };
    } catch (error: unknown) {
      console.error('Error getting transaction:', error);
      if (error instanceof Error) {
        return { data: null, error: { message: error.message } };
      }
      return { data: null, error: { message: 'Ocorreu um erro inesperado.' } };
    }
  }

  async createTransaction(userId: string, data: TransactionFormData) {
    try {
      if (data.amount <= 0) {
        throw new Error('O valor da transação deve ser maior que zero.');
      }
      
      const installmentsCount = data.installments && data.installments > 1 ? data.installments : 1;
      
      let installmentId: string | undefined = undefined;
      
      if (installmentsCount > 1) {
        const installmentRecord = await transactionRepository.createTransactionInstallment(userId, data.amount, installmentsCount);
        installmentId = installmentRecord.id;
      }

      const installmentAmount = data.amount / installmentsCount;
      const baseDate = parseISO(data.date);

      const transactionsToCreate = [];

      for (let i = 0; i < installmentsCount; i++) {
        const currentDate = format(addMonths(baseDate, i), 'yyyy-MM-dd');
        
        transactionsToCreate.push({
          user_id: userId,
          type: data.type,
          description: installmentsCount > 1 ? `${data.description} (${i + 1}/${installmentsCount})` : data.description,
          amount: Number(installmentAmount.toFixed(2)),
          category_id: data.category_id,
          account_id: data.account_id || undefined,
          credit_card_id: data.credit_card_id || undefined,
          date: currentDate,
          notes: data.notes || '',
          status: data.status,
          installment_id: installmentId,
        });
      }

      if (transactionsToCreate.length === 1) {
        const created = await transactionRepository.createTransaction(transactionsToCreate[0]);
        return { data: created, error: null };
      } else {
        const created = await transactionRepository.createMultipleTransactions(transactionsToCreate);
        return { data: created[0], error: null }; // returning the first one as representative
      }
    } catch (error: unknown) {
      console.error('Error creating transaction:', error);
      if (error instanceof Error) {
        return { data: null, error: { message: error.message } };
      }
      return { data: null, error: { message: 'Ocorreu um erro inesperado.' } };
    }
  }

  async updateTransaction(userId: string, transactionId: string, data: TransactionFormData) {
    try {
      if (data.amount <= 0) {
        throw new Error('O valor da transação deve ser maior que zero.');
      }
      const updates = {
        type: data.type,
        description: data.description,
        amount: data.amount,
        category_id: data.category_id,
        account_id: data.account_id || null,
        credit_card_id: data.credit_card_id || null,
        date: data.date,
        notes: data.notes || '',
        status: data.status,
      };
      // Type casting because we use null instead of undefined for unset fields to clear them in db
      const updated = await transactionRepository.updateTransaction(userId, transactionId, updates as any);
      return { data: updated, error: null };
    } catch (error: unknown) {
      console.error('Error updating transaction:', error);
      if (error instanceof Error) {
        return { data: null, error: { message: error.message } };
      }
      return { data: null, error: { message: 'Ocorreu um erro inesperado.' } };
    }
  }

  async updateTransactionCategory(userId: string, transactionId: string, categoryId: string) {
    try {
      const updated = await transactionRepository.updateTransaction(userId, transactionId, { category_id: categoryId });
      return { data: updated, error: null };
    } catch (error: unknown) {
      console.error('Error updating transaction category:', error);
      if (error instanceof Error) {
        return { data: null, error: { message: error.message } };
      }
      return { data: null, error: { message: 'Ocorreu um erro inesperado.' } };
    }
  }

  async deleteTransaction(userId: string, transactionId: string) {
    try {
      await transactionRepository.deleteTransaction(userId, transactionId);
      return { error: null };
    } catch (error: unknown) {
      console.error('Error deleting transaction:', error);
      if (error instanceof Error) {
        return { error: { message: error.message } };
      }
      return { error: { message: 'Ocorreu um erro inesperado.' } };
    }
  }

  async importBatchTransactions(userId: string, transactions: any[]) {
    try {
      const created = await transactionRepository.upsertMultipleTransactions(transactions);
      return { data: created, error: null };
    } catch (error: unknown) {
      console.error('Error importing transactions:', error);
      if (error instanceof Error) {
        return { data: null, error: { message: error.message } };
      }
      return { data: null, error: { message: 'Ocorreu um erro inesperado na importação.' } };
    }
  }

  async getFormData(userId: string) {
    try {
      const [accounts, categories, creditCards] = await Promise.all([
        referenceRepository.getAccounts(userId),
        referenceRepository.getCategories(userId),
        referenceRepository.getCreditCards(userId)
      ]);
      return { data: { accounts, categories, creditCards }, error: null };
    } catch (error: unknown) {
      console.error('Error fetching form references:', error);
      if (error instanceof Error) {
        return { data: null, error: { message: error.message } };
      }
      return { data: null, error: { message: 'Ocorreu um erro inesperado.' } };
    }
  }
}

export const transactionService = new TransactionService();
