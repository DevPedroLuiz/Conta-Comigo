export interface ClassificationResult {
  type?: 'INCOME' | 'EXPENSE' | 'TRANSFER_IN' | 'TRANSFER_OUT';
  is_internal_transfer: boolean;
  is_subscription: boolean;
  is_investment: boolean;
}

export class TransactionClassificationEngine {
  private static readonly TRANSFER_KEYWORDS = [
    'crédito liberado para pix',
    'fatura paga',
    'pagamento de fatura',
    'ted ',
    'pix entre as minhas contas',
    'pix enviado mesma titularidade',
    'transferência',
    'transf',
    'resgate',
    'aplicação',
    'cartao',
    'cartão',
    'pagamento com saldo'
  ];

  private static readonly SUBSCRIPTION_KEYWORDS = [
    'spotify',
    'netflix',
    'prime video',
    'amazon prime',
    'disney',
    'hbo',
    'max',
    'youtube premium',
    'apple',
    'globo',
    'streaming',
    'mensalidade',
    'assinatura',
    'gympass',
    'smartfit',
    'ifood club',
    'adobe'
  ];

  private static readonly INVESTMENT_KEYWORDS = [
    'cdb',
    'lci',
    'lca',
    'tesouro',
    'rendimento',
    'dividendos',
    'fii',
    'ações',
    'b3',
    'xp ',
    'rico ',
    'clear ',
    'nu invest',
    'fundo de investimento',
    'poupança'
  ];

  static classify(description: string, originalType: 'INCOME' | 'EXPENSE'): ClassificationResult {
    const normalizedDesc = description.toLowerCase();

    let result: ClassificationResult = {
      is_internal_transfer: false,
      is_subscription: false,
      is_investment: false
    };

    // 1. Check for Transfers
    if (this.TRANSFER_KEYWORDS.some(keyword => normalizedDesc.includes(keyword))) {
      result.is_internal_transfer = true;
      result.type = originalType === 'EXPENSE' ? 'TRANSFER_OUT' : 'TRANSFER_IN';
    }

    // 2. Check for Subscriptions
    if (this.SUBSCRIPTION_KEYWORDS.some(keyword => normalizedDesc.includes(keyword))) {
      result.is_subscription = true;
      // Typically subscriptions are expenses, but we preserve the logic
    }

    // 3. Check for Investments
    if (this.INVESTMENT_KEYWORDS.some(keyword => normalizedDesc.includes(keyword))) {
      result.is_investment = true;
    }

    return result;
  }
}
